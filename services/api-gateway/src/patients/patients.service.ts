import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role } from '@swasthai/database';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { AuthUser } from '../common/types';
import { SearchPatientsDto } from './dto/search-patients.dto';

@Injectable()
export class PatientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getContext(patientProfileId: string, user: AuthUser) {
    await this.assertCanAccessPatient(patientProfileId, user);
    const cacheKey = this.contextCacheKey(patientProfileId);
    const cached = await this.redis.getJson(cacheKey);
    if (cached) {
      return cached;
    }

    const patient = await this.prisma.patientProfile.findUnique({
      where: { id: patientProfileId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            abhaId: true,
            profileImage: true,
          },
        },
        emergencyContacts: true,
        allergies: { where: { isActive: true }, orderBy: { recordedAt: 'desc' } },
        chronicDiseases: { orderBy: { recordedAt: 'desc' } },
        medications: {
          where: { isActive: true },
          orderBy: { updatedAt: 'desc' },
          include: { medication: true },
        },
        vitals: { take: 40, orderBy: { measuredAt: 'desc' } },
        consultations: {
          take: 20,
          orderBy: { startedAt: 'desc' },
          include: {
            doctor: { select: { id: true, fullName: true, email: true } },
            nurse: { select: { id: true, fullName: true, email: true } },
            symptoms: true,
            diagnoses: true,
            prescriptions: { include: { items: true, drugSafetyChecks: true } },
            soapReports: { orderBy: { version: 'desc' }, take: 3 },
          },
        },
        radiologyUploads: {
          take: 20,
          orderBy: { uploadedAt: 'desc' },
          include: {
            file: true,
            aiPredictions: {
              take: 3,
              orderBy: { requestedAt: 'desc' },
              include: {
                heatmaps: { include: { file: true } },
                segmentationMasks: { include: { file: true } },
                shapOutputs: { include: { file: true } },
              },
            },
            reports: { orderBy: { version: 'desc' }, take: 3, include: { file: true } },
          },
        },
        aiInsights: { take: 25, orderBy: { createdAt: 'desc' } },
        timelineEvents: { take: 100, orderBy: { occurredAt: 'desc' } },
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    await this.redis.setJson(cacheKey, patient, 60);
    return patient;
  }

  async invalidateContext(patientProfileId: string) {
    await this.redis.invalidate(this.contextCacheKey(patientProfileId));
  }

  async search(dto: SearchPatientsDto, user: AuthUser) {
    if (user.role === Role.PATIENT) {
      throw new ForbiddenException('Patients cannot search all patient records');
    }

    const rows = await this.prisma.$queryRaw<
      Array<{
        id: string;
        full_name: string;
        email: string;
        phone: string | null;
        abha_id: string | null;
        rank: number;
      }>
    >`
      SELECT pp.id,
             u.full_name,
             u.email,
             u.phone,
             u.abha_id,
             ts_rank(
               to_tsvector('english', unaccent(coalesce(u.full_name, '') || ' ' || coalesce(u.email, '') || ' ' || coalesce(u.abha_id, ''))),
               plainto_tsquery('english', unaccent(${dto.q}))
             ) AS rank
      FROM patient_profiles pp
      JOIN users u ON u.id = pp.user_id
      WHERE to_tsvector('english', unaccent(coalesce(u.full_name, '') || ' ' || coalesce(u.email, '') || ' ' || coalesce(u.abha_id, '')))
            @@ plainto_tsquery('english', unaccent(${dto.q}))
         OR u.phone ILIKE ${`%${dto.q}%`}
      ORDER BY rank DESC, u.full_name ASC
      LIMIT ${dto.limit}
      OFFSET ${dto.skip}
    `;

    return { items: rows, page: dto.page, limit: dto.limit };
  }

  async assertCanAccessPatient(patientProfileId: string, user: AuthUser) {
    if (user.role === Role.ADMIN) {
      return;
    }

    const patient = await this.prisma.patientProfile.findUnique({
      where: { id: patientProfileId },
      select: { userId: true },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    if (user.role === Role.PATIENT && patient.userId === user.userId) {
      return;
    }

    if (user.role === Role.DOCTOR || user.role === Role.NURSE) {
      const relationCount = await this.prisma.consultation.count({
        where: {
          patientProfileId,
          OR: [{ doctorId: user.userId }, { nurseId: user.userId }],
        },
      });

      if (relationCount > 0) {
        return;
      }
    }

    throw new ForbiddenException('No permission to access this patient record');
  }

  async appendTimeline(
    tx: Prisma.TransactionClient,
    input: {
      patientProfileId: string;
      eventType: string;
      sourceTable: string;
      sourceId: string;
      summary: string;
      searchText?: string;
      metadata?: Prisma.InputJsonValue;
      occurredAt?: Date;
    },
  ) {
    return tx.patientTimelineEvent.upsert({
      where: {
        sourceTable_sourceId_eventType: {
          sourceTable: input.sourceTable,
          sourceId: input.sourceId,
          eventType: input.eventType,
        },
      },
      create: {
        ...input,
        occurredAt: input.occurredAt ?? new Date(),
      },
      update: {
        summary: input.summary,
        searchText: input.searchText,
        metadata: input.metadata,
        occurredAt: input.occurredAt ?? new Date(),
      },
    });
  }

  private contextCacheKey(patientProfileId: string) {
    return `patient:context:${patientProfileId}`;
  }
}
