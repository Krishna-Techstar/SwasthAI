import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AiJobStatus, ConsultationStatus, Prisma, ReportStatus, Role } from '@swasthai/database';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeService } from '../realtime/realtime.service';
import { PatientsService } from '../patients/patients.service';
import { ConsentService } from '../consent/consent.service';
import { AuditService } from '../audit/audit.service';
import { JobsService } from '../jobs/jobs.service';
import { AuthUser } from '../common/types';
import { AddVitalDto } from './dto/add-vital.dto';
import { SaveBodyMapDto } from './dto/body-map.dto';
import { CreateSoapReportDto } from './dto/create-soap-report.dto';
import { GenerateSoapDto } from './dto/generate-soap.dto';
import { LiveTranscriptDto } from './dto/live-transcript.dto';
import { SaveNoteDto } from './dto/save-note.dto';
import { StartConsultationDto } from './dto/start-consultation.dto';

@Injectable()
export class ConsultationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeService,
    private readonly patients: PatientsService,
    private readonly consent: ConsentService,
    private readonly audit: AuditService,
    private readonly jobs: JobsService,
  ) {}

  async start(dto: StartConsultationDto, user: AuthUser) {
    if (user.role !== Role.DOCTOR || !user.userId) {
      throw new ForbiddenException('Only doctors can start consultations');
    }

    const patient = await this.prisma.patientProfile.findUnique({ where: { id: dto.patientProfileId } });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const consultation = await this.prisma.$transaction(async (tx) => {
      const created = await tx.consultation.create({
        data: {
          patientProfileId: dto.patientProfileId,
          doctorId: user.userId!,
          nurseId: dto.nurseId,
          hospitalId: dto.hospitalId,
          appointmentId: dto.appointmentId,
          chiefComplaint: dto.chiefComplaint,
          status: ConsultationStatus.ACTIVE,
        },
      });

      await this.patients.appendTimeline(tx, {
        patientProfileId: dto.patientProfileId,
        eventType: 'consultation.started',
        sourceTable: 'consultations',
        sourceId: created.id,
        summary: dto.chiefComplaint ?? 'Consultation started',
      });

      await this.realtime.enqueue(tx, {
        eventName: 'consultation.started',
        aggregateType: 'consultation',
        aggregateId: created.id,
        patientProfileId: dto.patientProfileId,
        actorUserId: user.userId,
        roleScope: [Role.DOCTOR, Role.NURSE, Role.PATIENT, Role.ADMIN],
        roomNames: [
          this.realtime.patientRoom(dto.patientProfileId),
          this.realtime.consultationRoom(created.id),
          this.realtime.userRoom(user.userId!),
          ...(dto.nurseId ? [this.realtime.userRoom(dto.nurseId)] : []),
        ],
        payload: { consultationId: created.id, patientProfileId: dto.patientProfileId },
      });

      return created;
    });

    await this.patients.invalidateContext(dto.patientProfileId);
    return consultation;
  }

  async get(id: string, user: AuthUser) {
    const consultation = await this.assertConsultationAccess(id, user);
    return this.prisma.consultation.findUnique({
      where: { id: consultation.id },
      include: {
        patient: { include: { user: true } },
        doctor: { select: { id: true, fullName: true, email: true } },
        nurse: { select: { id: true, fullName: true, email: true } },
        notes: { orderBy: [{ noteType: 'asc' }, { version: 'desc' }] },
        transcripts: { orderBy: { sequence: 'asc' } },
        symptoms: true,
        diagnoses: true,
        bodyMapPoints: true,
        prescriptions: { include: { items: true, drugSafetyChecks: true } },
        soapReports: { orderBy: { version: 'desc' }, include: { changes: true } },
        radiologyUploads: { include: { file: true, aiPredictions: true, reports: true } },
      },
    });
  }

  async saveNote(consultationId: string, dto: SaveNoteDto, user: AuthUser) {
    const consultation = await this.assertConsultationAccess(consultationId, user, true);

    const note = await this.prisma.$transaction(async (tx) => {
      const previous = await tx.consultationNote.findFirst({
        where: { consultationId, noteType: dto.noteType },
        orderBy: { version: 'desc' },
      });

      const created = await tx.consultationNote.create({
        data: {
          consultationId,
          authorId: user.userId!,
          noteType: dto.noteType,
          content: dto.content,
          version: (previous?.version ?? 0) + 1,
          previousVersionId: previous?.id,
        },
      });

      await this.realtime.enqueue(tx, {
        eventName: 'consultation.note.saved',
        aggregateType: 'consultation_note',
        aggregateId: created.id,
        patientProfileId: consultation.patientProfileId,
        actorUserId: user.userId,
        roleScope: [Role.DOCTOR, Role.NURSE, Role.ADMIN],
        roomNames: [
          this.realtime.consultationRoom(consultationId),
          this.realtime.patientRoom(consultation.patientProfileId),
        ],
        payload: { consultationId, noteId: created.id, noteType: dto.noteType, version: created.version },
      });

      return created;
    });

    await this.patients.invalidateContext(consultation.patientProfileId);
    return note;
  }

  async addTranscript(consultationId: string, dto: LiveTranscriptDto, user: AuthUser) {
    const consultation = await this.assertConsultationAccess(consultationId, user, true);

    const transcript = await this.prisma.$transaction(async (tx) => {
      const created = await tx.liveTranscript.upsert({
        where: { consultationId_sequence: { consultationId, sequence: dto.sequence } },
        create: {
          consultationId,
          speakerRole: dto.speakerRole,
          speakerUserId: user.userId,
          sequence: dto.sequence,
          text: dto.text,
          language: dto.language ?? 'en',
          isFinal: dto.isFinal ?? false,
          confidence: dto.confidence,
          aiProvider: dto.aiProvider,
        },
        update: {
          text: dto.text,
          isFinal: dto.isFinal ?? false,
          confidence: dto.confidence,
        },
      });

      await this.realtime.enqueue(tx, {
        eventName: 'consultation.transcript.updated',
        aggregateType: 'live_transcript',
        aggregateId: created.id,
        patientProfileId: consultation.patientProfileId,
        actorUserId: user.userId,
        roleScope: [Role.DOCTOR, Role.NURSE, Role.PATIENT, Role.ADMIN],
        roomNames: [
          this.realtime.consultationRoom(consultationId),
          this.realtime.patientRoom(consultation.patientProfileId),
        ],
        payload: { consultationId, transcript: created },
      });

      return created;
    });

    return transcript;
  }

  async addVital(consultationId: string, dto: AddVitalDto, user: AuthUser) {
    const consultation = await this.assertConsultationAccess(consultationId, user, true);

    const vital = await this.prisma.$transaction(async (tx) => {
      const created = await tx.vitalSign.create({
        data: {
          consultationId,
          patientProfileId: consultation.patientProfileId,
          recordedById: user.userId,
          type: dto.type,
          value: dto.value,
          unit: dto.unit,
          measuredAt: dto.measuredAt ? new Date(dto.measuredAt) : new Date(),
          metadata: dto.metadata as Prisma.InputJsonValue,
        },
      });

      await this.patients.appendTimeline(tx, {
        patientProfileId: consultation.patientProfileId,
        eventType: 'vital.recorded',
        sourceTable: 'vitals',
        sourceId: created.id,
        summary: `${dto.type}: ${dto.value} ${dto.unit}`,
        metadata: dto.metadata as Prisma.InputJsonValue,
      });

      await this.realtime.enqueue(tx, {
        eventName: 'patient.vitals.updated',
        aggregateType: 'vitals',
        aggregateId: created.id,
        patientProfileId: consultation.patientProfileId,
        actorUserId: user.userId,
        roleScope: [Role.DOCTOR, Role.NURSE, Role.PATIENT, Role.ADMIN],
        roomNames: [
          this.realtime.consultationRoom(consultationId),
          this.realtime.patientRoom(consultation.patientProfileId),
        ],
        payload: { consultationId, vital: created },
      });

      return created;
    });

    await this.patients.invalidateContext(consultation.patientProfileId);
    return vital;
  }

  async saveBodyMap(consultationId: string, dto: SaveBodyMapDto, user: AuthUser) {
    const consultation = await this.assertConsultationAccess(consultationId, user, true);

    const points = await this.prisma.$transaction(async (tx) => {
      await tx.bodyMapPoint.deleteMany({ where: { consultationId } });
      if (dto.points.length) {
        await tx.bodyMapPoint.createMany({
          data: dto.points.map((point) => ({
            consultationId,
            patientProfileId: consultation.patientProfileId,
            region: point.region,
            side: point.side,
            x: point.x,
            y: point.y,
            painScore: point.painScore,
            metadata: point.metadata as Prisma.InputJsonValue,
          })),
        });
      }
      const created = await tx.bodyMapPoint.findMany({ where: { consultationId } });

      await this.realtime.enqueue(tx, {
        eventName: 'consultation.body_map.updated',
        aggregateType: 'consultation',
        aggregateId: consultationId,
        patientProfileId: consultation.patientProfileId,
        actorUserId: user.userId,
        roleScope: [Role.DOCTOR, Role.NURSE, Role.PATIENT, Role.ADMIN],
        roomNames: [
          this.realtime.consultationRoom(consultationId),
          this.realtime.patientRoom(consultation.patientProfileId),
        ],
        payload: { consultationId, points: created },
      });

      return created;
    });

    await this.patients.invalidateContext(consultation.patientProfileId);
    return points;
  }

  async createSoapReport(consultationId: string, dto: CreateSoapReportDto, user: AuthUser) {
    const consultation = await this.assertConsultationAccess(consultationId, user, true);

    if (dto.aiGenerated) {
      await this.consent.assertActiveConsent({
        patientProfileId: consultation.patientProfileId,
        doctorId: consultation.doctorId,
        consultationId,
      });
    }

    const report = await this.prisma.$transaction(async (tx) => {
      const previous = await tx.soapReport.findFirst({
        where: { consultationId },
        orderBy: { version: 'desc' },
      });

      const created = await tx.soapReport.create({
        data: {
          consultationId,
          patientProfileId: consultation.patientProfileId,
          doctorId: consultation.doctorId,
          status: dto.aiGenerated ? ReportStatus.AI_GENERATED : ReportStatus.DRAFT,
          subjective: dto.subjective,
          objective: dto.objective,
          assessment: dto.assessment,
          plan: dto.plan,
          aiGenerated: dto.aiGenerated ?? false,
          aiModel: dto.aiModel,
          confidence: dto.confidence as Prisma.InputJsonValue,
          version: (previous?.version ?? 0) + 1,
          searchText: [dto.subjective, dto.objective, dto.assessment, dto.plan].filter(Boolean).join(' '),
        },
      });

      await tx.reportChangeLog.create({
        data: {
          soapReportId: created.id,
          editedById: user.userId,
          changeType: dto.aiGenerated ? 'AI_GENERATED' : 'CREATED',
          versionFrom: previous?.version,
          versionTo: created.version,
          after: {
            reportId: created.id,
            status: created.status,
            version: created.version,
            aiGenerated: created.aiGenerated,
          },
        },
      });

      await this.patients.appendTimeline(tx, {
        patientProfileId: consultation.patientProfileId,
        eventType: 'soap_report.created',
        sourceTable: 'soap_reports',
        sourceId: created.id,
        summary: dto.aiGenerated ? 'AI generated SOAP report' : 'SOAP report created',
        searchText: created.searchText ?? undefined,
      });

      await tx.searchDocument.upsert({
        where: {
          entityType_entityId: { entityType: 'soap_report', entityId: created.id },
        },
        create: {
          patientProfileId: consultation.patientProfileId,
          entityType: 'soap_report',
          entityId: created.id,
          title: `SOAP report v${created.version}`,
          content: created.searchText ?? '',
          metadata: { consultationId },
        },
        update: {
          title: `SOAP report v${created.version}`,
          content: created.searchText ?? '',
          metadata: { consultationId },
        },
      });

      await this.realtime.enqueue(tx, {
        eventName: 'report.soap.updated',
        aggregateType: 'soap_report',
        aggregateId: created.id,
        patientProfileId: consultation.patientProfileId,
        actorUserId: user.userId,
        roleScope: [Role.DOCTOR, Role.NURSE, Role.PATIENT, Role.ADMIN],
        roomNames: [
          this.realtime.consultationRoom(consultationId),
          this.realtime.patientRoom(consultation.patientProfileId),
        ],
        payload: { consultationId, reportId: created.id, status: created.status, version: created.version },
      });

      await this.audit.recordTx(tx, {
        actorUserId: user.userId,
        actorEmail: user.email,
        actorRole: user.role,
        action: dto.aiGenerated ? 'soap.ai_generated' : 'soap.created',
        entityType: 'soap_report',
        entityId: created.id,
        patientProfileId: consultation.patientProfileId,
      });

      return created;
    });

    await this.patients.invalidateContext(consultation.patientProfileId);
    return report;
  }

  async queueSoapGeneration(consultationId: string, dto: GenerateSoapDto, user: AuthUser) {
    const consultation = await this.assertConsultationAccess(consultationId, user, true);
    const activeConsent = await this.consent.assertActiveConsent({
      patientProfileId: consultation.patientProfileId,
      doctorId: consultation.doctorId,
      consultationId,
    });

    const job = await this.prisma.$transaction(async (tx) => {
      const created = await tx.aiProcessingJob.create({
        data: {
          jobType: 'soap_generation',
          status: AiJobStatus.QUEUED,
          patientProfileId: consultation.patientProfileId,
          consultationId,
          aiConsentId: activeConsent.id,
          requestPayload: {
            consultationId,
            patientProfileId: consultation.patientProfileId,
            modelName: dto.modelName,
          },
        },
      });

      await this.realtime.enqueue(tx, {
        eventName: 'ai.soap.queued',
        aggregateType: 'ai_processing_job',
        aggregateId: created.id,
        patientProfileId: consultation.patientProfileId,
        actorUserId: user.userId,
        roleScope: [Role.DOCTOR, Role.NURSE, Role.PATIENT, Role.ADMIN],
        roomNames: [
          this.realtime.consultationRoom(consultationId),
          this.realtime.patientRoom(consultation.patientProfileId),
        ],
        payload: { jobId: created.id, consultationId },
      });

      return created;
    });

    const redisJob = await this.jobs.enqueueSoapGeneration(job.id, {
      consultationId,
      patientProfileId: consultation.patientProfileId,
      modelName: dto.modelName,
    });
    await this.prisma.aiProcessingJob.update({
      where: { id: job.id },
      data: { redisJobId: redisJob.id },
    });

    return job;
  }

  async signSoapReport(reportId: string, user: AuthUser) {
    if (user.role !== Role.DOCTOR || !user.userId) {
      throw new ForbiddenException('Only doctors can sign SOAP reports');
    }

    const report = await this.prisma.soapReport.findUnique({ where: { id: reportId } });
    if (!report) {
      throw new NotFoundException('SOAP report not found');
    }
    if (report.doctorId !== user.userId) {
      throw new ForbiddenException('Only the owning doctor can sign this SOAP report');
    }

    const signed = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.soapReport.update({
        where: { id: reportId },
        data: { status: ReportStatus.SIGNED, signedById: user.userId, signedAt: new Date() },
      });

      await tx.reportChangeLog.create({
        data: {
          soapReportId: reportId,
          editedById: user.userId,
          changeType: 'SIGNED',
          versionFrom: report.version,
          versionTo: report.version,
        },
      });

      await this.realtime.enqueue(tx, {
        eventName: 'report.soap.signed',
        aggregateType: 'soap_report',
        aggregateId: reportId,
        patientProfileId: report.patientProfileId,
        actorUserId: user.userId,
        roleScope: [Role.DOCTOR, Role.NURSE, Role.PATIENT, Role.ADMIN],
        roomNames: [
          this.realtime.consultationRoom(report.consultationId),
          this.realtime.patientRoom(report.patientProfileId),
        ],
        payload: { reportId, consultationId: report.consultationId, status: updated.status },
      });

      return updated;
    });

    await this.patients.invalidateContext(report.patientProfileId);
    return signed;
  }

  async end(consultationId: string, user: AuthUser) {
    const consultation = await this.assertConsultationAccess(consultationId, user, true);

    const ended = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.consultation.update({
        where: { id: consultationId },
        data: { status: ConsultationStatus.COMPLETED, endedAt: new Date() },
      });

      await this.patients.appendTimeline(tx, {
        patientProfileId: consultation.patientProfileId,
        eventType: 'consultation.completed',
        sourceTable: 'consultations',
        sourceId: consultationId,
        summary: 'Consultation completed',
      });

      await this.realtime.enqueue(tx, {
        eventName: 'consultation.completed',
        aggregateType: 'consultation',
        aggregateId: consultationId,
        patientProfileId: consultation.patientProfileId,
        actorUserId: user.userId,
        roleScope: [Role.DOCTOR, Role.NURSE, Role.PATIENT, Role.ADMIN],
        roomNames: [
          this.realtime.consultationRoom(consultationId),
          this.realtime.patientRoom(consultation.patientProfileId),
        ],
        payload: { consultationId, status: updated.status, endedAt: updated.endedAt },
      });

      return updated;
    });

    await this.patients.invalidateContext(consultation.patientProfileId);
    return ended;
  }

  private async assertConsultationAccess(id: string, user: AuthUser, write = false) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id },
      select: { id: true, patientProfileId: true, doctorId: true, nurseId: true },
    });

    if (!consultation) {
      throw new NotFoundException('Consultation not found');
    }

    if (user.role === Role.ADMIN) {
      return consultation;
    }

    if (write && user.role === Role.PATIENT) {
      throw new ForbiddenException('Patients cannot modify consultations');
    }

    if (user.userId === consultation.doctorId || user.userId === consultation.nurseId) {
      return consultation;
    }

    if (!write) {
      await this.patients.assertCanAccessPatient(consultation.patientProfileId, user);
      return consultation;
    }

    throw new ForbiddenException('No permission for this consultation');
  }
}
