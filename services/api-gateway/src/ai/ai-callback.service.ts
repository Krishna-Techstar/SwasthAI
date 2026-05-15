import { Injectable, NotFoundException } from '@nestjs/common';
import { AiJobStatus, Prisma, ReportStatus, Role } from '@swasthai/database';
import { PrismaService } from '../prisma/prisma.service';
import { PatientsService } from '../patients/patients.service';
import { RealtimeService } from '../realtime/realtime.service';
import { CompleteSoapJobDto } from './dto/complete-soap-job.dto';

@Injectable()
export class AiCallbackService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly patients: PatientsService,
    private readonly realtime: RealtimeService,
  ) {}

  async completeSoapJob(dto: CompleteSoapJobDto) {
    const job = await this.prisma.aiProcessingJob.findUnique({
      where: { id: dto.jobId },
      include: { consultation: true },
    });

    if (!job?.consultation || !job.patientProfileId || !job.consultationId) {
      throw new NotFoundException('SOAP generation job not found');
    }
    const consultation = job.consultation;

    const report = await this.prisma.$transaction(async (tx) => {
      const previous = await tx.soapReport.findFirst({
        where: { consultationId: job.consultationId! },
        orderBy: { version: 'desc' },
      });

      const searchText = [
        dto.soap.subjective,
        dto.soap.objective,
        dto.soap.assessment,
        dto.soap.plan,
      ].filter(Boolean).join(' ');

      const created = await tx.soapReport.create({
        data: {
          consultationId: job.consultationId!,
          patientProfileId: job.patientProfileId!,
          doctorId: consultation.doctorId,
          status: ReportStatus.AI_GENERATED,
          subjective: dto.soap.subjective,
          objective: dto.soap.objective,
          assessment: dto.soap.assessment,
          plan: dto.soap.plan,
          aiGenerated: true,
          aiModel: dto.modelName,
          confidence: dto.confidence as Prisma.InputJsonValue,
          version: (previous?.version ?? 0) + 1,
          searchText,
        },
      });

      await tx.aiProcessingJob.update({
        where: { id: dto.jobId },
        data: {
          status: AiJobStatus.SUCCEEDED,
          resultPayload: {
            soapReportId: created.id,
            insights: dto.insights ?? null,
          } as Prisma.InputJsonValue,
          completedAt: new Date(),
        },
      });

      if (dto.insights) {
        await tx.aiInsight.create({
          data: {
            patientProfileId: job.patientProfileId!,
            consultationId: job.consultationId!,
            type: 'soap_generation',
            modelName: dto.modelName ?? 'clinical-ai',
            summary: 'AI generated SOAP report',
            content: dto.insights as Prisma.InputJsonValue,
            createdByService: 'fastapi-clinical',
          },
        });
      }

      await this.patients.appendTimeline(tx, {
        patientProfileId: job.patientProfileId!,
        eventType: 'soap_report.ai_completed',
        sourceTable: 'soap_reports',
        sourceId: created.id,
        summary: 'AI generated SOAP report',
        searchText,
      });

      await this.realtime.enqueue(tx, {
        eventName: 'ai.soap.completed',
        aggregateType: 'soap_report',
        aggregateId: created.id,
        patientProfileId: job.patientProfileId!,
        roleScope: [Role.DOCTOR, Role.NURSE, Role.PATIENT, Role.ADMIN],
        roomNames: [
          this.realtime.patientRoom(job.patientProfileId!),
          this.realtime.consultationRoom(job.consultationId!),
        ],
        payload: {
          jobId: dto.jobId,
          consultationId: job.consultationId,
          reportId: created.id,
          version: created.version,
        },
      });

      return created;
    });

    await this.patients.invalidateContext(job.patientProfileId);
    return report;
  }
}
