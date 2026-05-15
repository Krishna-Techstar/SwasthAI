import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConsentStatus, Prisma, Role } from '@swasthai/database';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeService } from '../realtime/realtime.service';
import { PatientsService } from '../patients/patients.service';
import { AuthUser } from '../common/types';
import { GrantConsentDto } from './dto/grant-consent.dto';

@Injectable()
export class ConsentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeService,
    private readonly patients: PatientsService,
  ) {}

  async grant(dto: GrantConsentDto, user: AuthUser, meta: { ipAddress?: string; userAgent?: string }) {
    if (user.role !== Role.DOCTOR || !user.userId) {
      throw new ForbiddenException('Only doctors can capture AI consent for a consultation');
    }

    await this.patients.assertCanAccessPatient(dto.patientProfileId, user);

    const consent = await this.prisma.$transaction(async (tx) => {
      const created = await tx.aiConsent.create({
        data: {
          patientProfileId: dto.patientProfileId,
          doctorId: user.userId!,
          consultationId: dto.consultationId,
          consentVersion: dto.consentVersion,
          scope: dto.scope as Prisma.InputJsonValue,
          sessionInfo: dto.sessionInfo as Prisma.InputJsonValue,
          status: ConsentStatus.GRANTED,
        },
      });

      await tx.consentLog.create({
        data: {
          aiConsentId: created.id,
          actorUserId: user.userId,
          actorRole: user.role,
          action: 'GRANTED',
          ipAddress: meta.ipAddress,
          userAgent: meta.userAgent,
          metadata: dto.sessionInfo as Prisma.InputJsonValue,
        },
      });

      await this.realtime.enqueue(tx, {
        eventName: 'consent.granted',
        aggregateType: 'ai_consent',
        aggregateId: created.id,
        patientProfileId: dto.patientProfileId,
        actorUserId: user.userId,
        roleScope: [Role.DOCTOR, Role.NURSE, Role.PATIENT, Role.ADMIN],
        roomNames: [
          this.realtime.patientRoom(dto.patientProfileId),
          ...(dto.consultationId ? [this.realtime.consultationRoom(dto.consultationId)] : []),
        ],
        payload: {
          consentId: created.id,
          patientProfileId: dto.patientProfileId,
          consultationId: dto.consultationId,
          status: created.status,
        },
      });

      return created;
    });

    return consent;
  }

  async revoke(consentId: string, reason: string | undefined, user: AuthUser, meta: { ipAddress?: string; userAgent?: string }) {
    const existing = await this.prisma.aiConsent.findUnique({ where: { id: consentId } });
    if (!existing) {
      throw new NotFoundException('Consent not found');
    }

    await this.patients.assertCanAccessPatient(existing.patientProfileId, user);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.aiConsent.update({
        where: { id: consentId },
        data: { status: ConsentStatus.REVOKED, revokedAt: new Date() },
      });

      await tx.consentLog.create({
        data: {
          aiConsentId: consentId,
          actorUserId: user.userId,
          actorRole: user.role,
          action: 'REVOKED',
          ipAddress: meta.ipAddress,
          userAgent: meta.userAgent,
          metadata: { reason },
        },
      });

      await this.realtime.enqueue(tx, {
        eventName: 'consent.revoked',
        aggregateType: 'ai_consent',
        aggregateId: consentId,
        patientProfileId: existing.patientProfileId,
        actorUserId: user.userId,
        roleScope: [Role.DOCTOR, Role.NURSE, Role.PATIENT, Role.ADMIN],
        roomNames: [
          this.realtime.patientRoom(existing.patientProfileId),
          ...(existing.consultationId ? [this.realtime.consultationRoom(existing.consultationId)] : []),
        ],
        payload: {
          consentId,
          patientProfileId: existing.patientProfileId,
          consultationId: existing.consultationId,
          status: updated.status,
          reason,
        },
      });

      return updated;
    });
  }

  async assertActiveConsent(input: {
    patientProfileId: string;
    doctorId?: string;
    consultationId?: string;
  }) {
    const consent = await this.prisma.aiConsent.findFirst({
      where: {
        patientProfileId: input.patientProfileId,
        doctorId: input.doctorId,
        consultationId: input.consultationId,
        status: ConsentStatus.GRANTED,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { grantedAt: 'desc' },
    });

    if (!consent) {
      throw new ForbiddenException('AI processing requires active patient consent');
    }

    return consent;
  }
}
