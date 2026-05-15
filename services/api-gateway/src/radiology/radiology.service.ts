import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AiJobStatus, Prisma, ReportStatus, Role } from '@swasthai/database';
import { PrismaService } from '../prisma/prisma.service';
import { PatientsService } from '../patients/patients.service';
import { ConsentService } from '../consent/consent.service';
import { JobsService } from '../jobs/jobs.service';
import { RealtimeService } from '../realtime/realtime.service';
import { AuthUser } from '../common/types';
import { CreateRadiologyReportDto } from './dto/create-radiology-report.dto';
import { CreateRadiologyUploadDto } from './dto/create-radiology-upload.dto';
import { RecordAiPredictionDto } from './dto/record-ai-prediction.dto';

@Injectable()
export class RadiologyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly patients: PatientsService,
    private readonly consent: ConsentService,
    private readonly jobs: JobsService,
    private readonly realtime: RealtimeService,
  ) {}

  async createUpload(dto: CreateRadiologyUploadDto, user: AuthUser) {
    const clinicalRoles: Role[] = [Role.DOCTOR, Role.NURSE, Role.ADMIN];
    if (!clinicalRoles.includes(user.role)) {
      throw new ForbiddenException('Only clinical staff can create radiology uploads');
    }

    await this.patients.assertCanAccessPatient(dto.patientProfileId, user);

    let aiJobId: string | undefined;
    const upload = await this.prisma.$transaction(async (tx) => {
      const created = await tx.radiologyUpload.create({
        data: {
          patientProfileId: dto.patientProfileId,
          consultationId: dto.consultationId,
          orderedByDoctorId: user.role === Role.DOCTOR ? user.userId : undefined,
          uploadedById: user.userId,
          fileId: dto.fileId,
          scanType: dto.scanType,
          bodyRegion: dto.bodyRegion,
          metadata: dto.metadata as Prisma.InputJsonValue,
          aiStatus: dto.queueAi ? AiJobStatus.QUEUED : AiJobStatus.CANCELLED,
        },
      });

      await this.patients.appendTimeline(tx, {
        patientProfileId: dto.patientProfileId,
        eventType: 'radiology.uploaded',
        sourceTable: 'radiology_uploads',
        sourceId: created.id,
        summary: `${dto.scanType} uploaded${dto.bodyRegion ? ` for ${dto.bodyRegion}` : ''}`,
      });

      if (dto.queueAi) {
        if (!user.userId) {
          throw new ForbiddenException('AI radiology processing requires a clinical actor');
        }
        const activeConsent = await this.consent.assertActiveConsent({
          patientProfileId: dto.patientProfileId,
          doctorId: user.userId,
          consultationId: dto.consultationId,
        });

        const aiJob = await tx.aiProcessingJob.create({
          data: {
            jobType: 'radiology_prediction',
            status: AiJobStatus.QUEUED,
            patientProfileId: dto.patientProfileId,
            consultationId: dto.consultationId,
            radiologyUploadId: created.id,
            aiConsentId: activeConsent.id,
            requestPayload: {
              radiologyUploadId: created.id,
              scanType: dto.scanType,
              fileId: dto.fileId,
            },
          },
        });
        aiJobId = aiJob.id;
      }

      await this.realtime.enqueue(tx, {
        eventName: 'radiology.upload.created',
        aggregateType: 'radiology_upload',
        aggregateId: created.id,
        patientProfileId: dto.patientProfileId,
        actorUserId: user.userId,
        roleScope: [Role.DOCTOR, Role.NURSE, Role.PATIENT, Role.ADMIN],
        roomNames: [
          this.realtime.patientRoom(dto.patientProfileId),
          ...(dto.consultationId ? [this.realtime.consultationRoom(dto.consultationId)] : []),
        ],
        payload: { radiologyUploadId: created.id, patientProfileId: dto.patientProfileId },
      });

      return created;
    });

    await this.patients.invalidateContext(dto.patientProfileId);
    if (aiJobId) {
      const redisJob = await this.jobs.enqueueRadiologyPrediction(aiJobId, {
        radiologyUploadId: upload.id,
        patientProfileId: upload.patientProfileId,
        consultationId: upload.consultationId,
        fileId: upload.fileId,
        scanType: upload.scanType,
      });
      await this.prisma.aiProcessingJob.update({
        where: { id: aiJobId },
        data: { redisJobId: redisJob.id },
      });
    }
    return upload;
  }

  async recordPrediction(uploadId: string, dto: RecordAiPredictionDto, user: AuthUser) {
    const upload = await this.prisma.radiologyUpload.findUnique({ where: { id: uploadId } });
    if (!upload) {
      throw new NotFoundException('Radiology upload not found');
    }
    await this.patients.assertCanAccessPatient(upload.patientProfileId, user);

    const prediction = await this.prisma.$transaction(async (tx) => {
      const created = await tx.aiPrediction.create({
        data: {
          radiologyUploadId: uploadId,
          modelName: dto.modelName,
          modelVersion: dto.modelVersion,
          status: AiJobStatus.SUCCEEDED,
          classification: dto.classification,
          confidence: dto.confidence,
          severity: dto.severity,
          prediction: dto.prediction as Prisma.InputJsonValue,
          completedAt: new Date(),
        },
      });

      if (dto.heatmapFileId) {
        await tx.heatmap.create({
          data: { aiPredictionId: created.id, fileId: dto.heatmapFileId },
        });
      }
      if (dto.segmentationMaskFileId) {
        await tx.segmentationMask.create({
          data: { aiPredictionId: created.id, fileId: dto.segmentationMaskFileId },
        });
      }
      if (dto.contourMapFileId) {
        await tx.contourMap.create({
          data: { aiPredictionId: created.id, fileId: dto.contourMapFileId },
        });
      }
      if (dto.shapExplanation) {
        await tx.shapOutput.create({
          data: {
            aiPredictionId: created.id,
            fileId: dto.shapFileId,
            explanation: dto.shapExplanation as Prisma.InputJsonValue,
          },
        });
      }

      await tx.radiologyUpload.update({
        where: { id: uploadId },
        data: { aiStatus: AiJobStatus.SUCCEEDED },
      });

      if (dto.jobId) {
        await tx.aiProcessingJob.update({
          where: { id: dto.jobId },
          data: {
            status: AiJobStatus.SUCCEEDED,
            resultPayload: { predictionId: created.id },
            completedAt: new Date(),
          },
        });
      }

      await tx.aiInsight.create({
        data: {
          patientProfileId: upload.patientProfileId,
          consultationId: upload.consultationId,
          type: 'radiology_prediction',
          modelName: dto.modelName,
          summary: dto.classification ?? 'Radiology AI prediction completed',
          content: dto.prediction as Prisma.InputJsonValue,
          confidence: dto.confidence,
          createdByService: 'fastapi-radiology',
        },
      });

      await this.realtime.enqueue(tx, {
        eventName: 'radiology.ai.completed',
        aggregateType: 'ai_prediction',
        aggregateId: created.id,
        patientProfileId: upload.patientProfileId,
        actorUserId: user.userId,
        roleScope: [Role.DOCTOR, Role.NURSE, Role.PATIENT, Role.ADMIN],
        roomNames: [
          this.realtime.patientRoom(upload.patientProfileId),
          ...(upload.consultationId ? [this.realtime.consultationRoom(upload.consultationId)] : []),
        ],
        payload: { radiologyUploadId: uploadId, predictionId: created.id },
      });

      return created;
    });

    await this.patients.invalidateContext(upload.patientProfileId);
    return prediction;
  }

  async createReport(uploadId: string, dto: CreateRadiologyReportDto, user: AuthUser) {
    const upload = await this.prisma.radiologyUpload.findUnique({ where: { id: uploadId } });
    if (!upload) {
      throw new NotFoundException('Radiology upload not found');
    }
    await this.patients.assertCanAccessPatient(upload.patientProfileId, user);

    const report = await this.prisma.$transaction(async (tx) => {
      const previous = await tx.radiologyReport.findFirst({
        where: { radiologyUploadId: uploadId },
        orderBy: { version: 'desc' },
      });

      const created = await tx.radiologyReport.create({
        data: {
          radiologyUploadId: uploadId,
          patientProfileId: upload.patientProfileId,
          consultationId: upload.consultationId,
          doctorId: user.role === Role.DOCTOR ? user.userId : undefined,
          aiPredictionId: dto.aiPredictionId,
          status: dto.aiGenerated ? ReportStatus.AI_GENERATED : ReportStatus.DRAFT,
          findings: dto.findings,
          impression: dto.impression,
          recommendation: dto.recommendation,
          aiGenerated: dto.aiGenerated ?? false,
          version: (previous?.version ?? 0) + 1,
        },
      });

      await this.patients.appendTimeline(tx, {
        patientProfileId: upload.patientProfileId,
        eventType: 'radiology.report.created',
        sourceTable: 'radiology_reports',
        sourceId: created.id,
        summary: dto.impression ?? dto.findings ?? 'Radiology report created',
        searchText: [dto.findings, dto.impression, dto.recommendation].filter(Boolean).join(' '),
      });

      await this.realtime.enqueue(tx, {
        eventName: 'radiology.report.updated',
        aggregateType: 'radiology_report',
        aggregateId: created.id,
        patientProfileId: upload.patientProfileId,
        actorUserId: user.userId,
        roleScope: [Role.DOCTOR, Role.NURSE, Role.PATIENT, Role.ADMIN],
        roomNames: [
          this.realtime.patientRoom(upload.patientProfileId),
          ...(upload.consultationId ? [this.realtime.consultationRoom(upload.consultationId)] : []),
        ],
        payload: { radiologyUploadId: uploadId, reportId: created.id, version: created.version },
      });

      return created;
    });

    await this.patients.invalidateContext(upload.patientProfileId);
    return report;
  }
}
