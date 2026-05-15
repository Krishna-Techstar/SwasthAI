import { Injectable } from '@nestjs/common';
import { Prisma, Role } from '@swasthai/database';
import { PrismaService } from '../prisma/prisma.service';

export type AuditInput = {
  actorUserId?: string;
  actorEmail?: string;
  actorRole?: Role;
  action: string;
  entityType: string;
  entityId?: string;
  patientProfileId?: string;
  ipAddress?: string;
  userAgent?: string;
  before?: Prisma.InputJsonValue;
  after?: Prisma.InputJsonValue;
  metadata?: Prisma.InputJsonValue;
};

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async record(input: AuditInput) {
    return this.prisma.auditLog.create({ data: input });
  }

  async recordTx(tx: Prisma.TransactionClient, input: AuditInput) {
    return tx.auditLog.create({ data: input });
  }

  async login(input: {
    email: string;
    userId?: string;
    role?: Role;
    success: boolean;
    reason?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.prisma.loginLog.create({ data: input });
  }

  async adminAction(input: {
    adminEmail: string;
    action: string;
    targetUserId?: string;
    approvalQueueId?: string;
    metadata?: Prisma.InputJsonValue;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.prisma.adminAction.create({ data: input });
  }
}
