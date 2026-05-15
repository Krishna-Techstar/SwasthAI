import { Injectable, NotFoundException } from '@nestjs/common';
import {
  AiJobStatus,
  AppointmentStatus,
  ApprovalStatus,
  ConsultationStatus,
  OnboardingStatus,
  Prisma,
  RealtimeDeliveryStatus,
  ReportStatus,
  Role,
  UserStatus,
} from '@swasthai/database';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { RealtimeService } from '../realtime/realtime.service';
import { AuthUser } from '../common/types';
import { ListApprovalsDto } from './dto/list-approvals.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly realtime: RealtimeService,
  ) {}

  async listApprovals(query: ListApprovalsDto) {
    const where: Prisma.ApprovalQueueWhereInput = {
      status: query.status ?? ApprovalStatus.PENDING,
      role: query.role,
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.approvalQueue.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: { submittedAt: 'asc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phone: true,
              fullName: true,
              role: true,
              approvalStatus: true,
              doctorProfile: true,
              nurseProfile: true,
            },
          },
          hospital: true,
        },
      }),
      this.prisma.approvalQueue.count({ where }),
    ]);

    return { items, total, page: query.page, limit: query.limit };
  }

  async dashboard() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      activePatients,
      doctors,
      nurses,
      verifiedClinicians,
      pendingApprovals,
      activeConsultations,
      todaysAppointments,
      pendingAiJobs,
      failedAiJobs,
      soapReportsUnderReview,
      radiologyReportsUnderReview,
      notificationsLast24h,
      realtimePending,
      realtimeFailed,
      recentAuditLogs,
    ] = await this.prisma.$transaction([
      this.prisma.user.count({ where: { role: Role.PATIENT, deletedAt: null } }),
      this.prisma.user.count({ where: { role: Role.DOCTOR, deletedAt: null } }),
      this.prisma.user.count({ where: { role: Role.NURSE, deletedAt: null } }),
      this.prisma.user.count({
        where: {
          role: { in: [Role.DOCTOR, Role.NURSE] },
          approvalStatus: ApprovalStatus.APPROVED,
          deletedAt: null,
        },
      }),
      this.prisma.approvalQueue.count({ where: { status: ApprovalStatus.PENDING } }),
      this.prisma.consultation.count({ where: { status: ConsultationStatus.ACTIVE } }),
      this.prisma.appointment.count({
        where: {
          scheduledStart: { gte: startOfToday, lt: endOfToday },
        },
      }),
      this.prisma.aiProcessingJob.count({
        where: { status: { in: [AiJobStatus.QUEUED, AiJobStatus.RUNNING] } },
      }),
      this.prisma.aiProcessingJob.count({ where: { status: AiJobStatus.FAILED } }),
      this.prisma.soapReport.count({
        where: { status: { in: [ReportStatus.AI_GENERATED, ReportStatus.UNDER_REVIEW] } },
      }),
      this.prisma.radiologyReport.count({
        where: { status: { in: [ReportStatus.AI_GENERATED, ReportStatus.UNDER_REVIEW] } },
      }),
      this.prisma.notification.count({ where: { createdAt: { gte: last24Hours } } }),
      this.prisma.realtimeEventOutbox.count({
        where: { deliveryStatus: RealtimeDeliveryStatus.PENDING },
      }),
      this.prisma.realtimeEventOutbox.count({
        where: { deliveryStatus: RealtimeDeliveryStatus.FAILED },
      }),
      this.prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          action: true,
          entityType: true,
          entityId: true,
          actorEmail: true,
          actorRole: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      metrics: {
        activePatients,
        doctors,
        nurses,
        verifiedClinicians,
        activeConsultations,
        todaysAppointments,
        notificationsLast24h,
      },
      queues: {
        pendingApprovals,
        pendingAiJobs,
        failedAiJobs,
        reportsUnderReview: soapReportsUnderReview + radiologyReportsUnderReview,
        realtimePending,
        realtimeFailed,
      },
      recentActivity: recentAuditLogs.map((log) => ({
        id: log.id,
        label: `${log.action} on ${log.entityType}`,
        actor: log.actorEmail ?? log.actorRole ?? 'system',
        entityId: log.entityId,
        createdAt: log.createdAt,
      })),
    };
  }

  async reports() {
    const [soapReports, radiologyReports] = await this.prisma.$transaction([
      this.prisma.soapReport.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: { include: { user: { select: { fullName: true, email: true } } } },
          doctor: { select: { id: true, fullName: true, email: true } },
          changes: { take: 3, orderBy: { createdAt: 'desc' } },
        },
      }),
      this.prisma.radiologyReport.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: { include: { user: { select: { fullName: true, email: true } } } },
          doctor: { select: { id: true, fullName: true, email: true } },
          radiologyUpload: { include: { file: true } },
          changes: { take: 3, orderBy: { createdAt: 'desc' } },
        },
      }),
    ]);

    return { soapReports, radiologyReports };
  }

  async aiJobs() {
    const items = await this.prisma.aiProcessingJob.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: {
        patient: { include: { user: { select: { fullName: true, email: true } } } },
        consultation: { select: { id: true, status: true, startedAt: true } },
        radiologyUpload: { select: { id: true, scanType: true, aiStatus: true } },
      },
    });

    return { items };
  }

  async realtimeHealth() {
    const [pending, published, failed, lastEvent] = await this.prisma.$transaction([
      this.prisma.realtimeEventOutbox.count({
        where: { deliveryStatus: RealtimeDeliveryStatus.PENDING },
      }),
      this.prisma.realtimeEventOutbox.count({
        where: { deliveryStatus: RealtimeDeliveryStatus.PUBLISHED },
      }),
      this.prisma.realtimeEventOutbox.count({
        where: { deliveryStatus: RealtimeDeliveryStatus.FAILED },
      }),
      this.prisma.realtimeEventOutbox.findFirst({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          eventName: true,
          deliveryStatus: true,
          createdAt: true,
          publishedAt: true,
          attempts: true,
        },
      }),
    ]);

    return {
      status: failed > 0 ? 'DEGRADED' : 'HEALTHY',
      outbox: { pending, published, failed },
      lastEvent,
    };
  }

  async hospitals() {
    const items = await this.prisma.hospital.findMany({
      take: 100,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            doctorProfiles: true,
            nurseProfiles: true,
            consultations: true,
            appointments: true,
          },
        },
      },
    });

    return { items };
  }

  async approve(approvalId: string, admin: AuthUser, meta: { ipAddress?: string; userAgent?: string }) {
    return this.review(approvalId, ApprovalStatus.APPROVED, admin, meta);
  }

  async reject(
    approvalId: string,
    reason: string | undefined,
    admin: AuthUser,
    meta: { ipAddress?: string; userAgent?: string },
  ) {
    return this.review(approvalId, ApprovalStatus.REJECTED, admin, meta, reason);
  }

  // ─── User Management ───

  async listUsers(query: { role?: Role; status?: string; search?: string; skip?: number; limit?: number; page?: number }) {
    const where: any = { deletedAt: null };
    if (query.role) where.role = query.role;
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { fullName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { abhaId: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip: query.skip ?? 0,
        take: query.limit ?? 25,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          phone: true,
          fullName: true,
          role: true,
          status: true,
          approvalStatus: true,
          onboardingStatus: true,
          lastLoginAt: true,
          createdAt: true,
          doctorProfile: {
            select: {
              specialization: true,
              department: true,
              hospitalId: true,
              registrationNumber: true,
              consultationFee: true,
              hospital: { select: { id: true, name: true, code: true } },
            },
          },
          nurseProfile: {
            select: {
              department: true,
              licenseNumber: true,
              hospitalId: true,
              hospital: { select: { id: true, name: true, code: true } },
            },
          },
          patientProfile: { select: { dateOfBirth: true, gender: true, bloodGroup: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, total, page: query.page ?? 1, limit: query.limit ?? 25 };
  }

  async getUserDetail(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        doctorProfile: { include: { hospital: true } },
        nurseProfile: { include: { hospital: true } },
        patientProfile: true,
        sessions: { where: { status: 'ACTIVE' }, take: 5, orderBy: { createdAt: 'desc' } },
        approvalQueues: { take: 5, orderBy: { submittedAt: 'desc' } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash, ...safe } = user as any;
    return safe;
  }

  async updateUserStatus(userId: string, status: string, admin: AuthUser, meta: { ipAddress?: string; userAgent?: string }, reason?: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { status: status as any },
      select: { id: true, email: true, fullName: true, role: true, status: true },
    });

    await this.audit.record({
      actorEmail: admin.email,
      actorRole: Role.ADMIN,
      action: `admin.user.status.${status.toLowerCase()}`,
      entityType: 'user',
      entityId: userId,
      after: { status, reason },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return user;
  }

  // ─── Appointments ───

  async listAppointments(query: { status?: string; type?: string; from?: string; to?: string; skip?: number; limit?: number; page?: number }) {
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;
    if (query.from || query.to) {
      where.scheduledStart = {};
      if (query.from) where.scheduledStart.gte = new Date(query.from);
      if (query.to) where.scheduledStart.lte = new Date(query.to);
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.appointment.findMany({
        where,
        skip: query.skip ?? 0,
        take: query.limit ?? 25,
        orderBy: { scheduledStart: 'desc' },
        include: {
          patient: { include: { user: { select: { fullName: true, email: true } } } },
          doctor: { select: { id: true, fullName: true, email: true } },
          hospital: { select: { id: true, name: true, code: true } },
        },
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return { items, total, page: query.page ?? 1, limit: query.limit ?? 25 };
  }

  // ─── Consultations ───

  async listConsultations(query: { status?: string; skip?: number; limit?: number; page?: number }) {
    const where: any = {};
    if (query.status) where.status = query.status;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.consultation.findMany({
        where,
        skip: query.skip ?? 0,
        take: query.limit ?? 25,
        orderBy: { startedAt: 'desc' },
        include: {
          patient: { include: { user: { select: { fullName: true, email: true } } } },
          doctor: { select: { id: true, fullName: true, email: true } },
          nurse: { select: { id: true, fullName: true } },
          hospital: { select: { id: true, name: true } },
        },
      }),
      this.prisma.consultation.count({ where }),
    ]);

    return { items, total, page: query.page ?? 1, limit: query.limit ?? 25 };
  }

  // ─── Analytics ───

  async analyticsSummary() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalPatients,
      totalDoctors,
      totalNurses,
      totalConsultations,
      consultationsLast7,
      totalAppointments,
      appointmentsLast7,
      signedReports,
      aiJobsCompleted,
      aiJobsFailed,
    ] = await this.prisma.$transaction([
      this.prisma.user.count({ where: { role: Role.PATIENT, deletedAt: null } }),
      this.prisma.user.count({ where: { role: Role.DOCTOR, deletedAt: null } }),
      this.prisma.user.count({ where: { role: Role.NURSE, deletedAt: null } }),
      this.prisma.consultation.count(),
      this.prisma.consultation.count({ where: { startedAt: { gte: last7Days } } }),
      this.prisma.appointment.count(),
      this.prisma.appointment.count({ where: { scheduledStart: { gte: last7Days } } }),
      this.prisma.soapReport.count({ where: { status: ReportStatus.SIGNED } }),
      this.prisma.aiProcessingJob.count({ where: { status: AiJobStatus.SUCCEEDED } }),
      this.prisma.aiProcessingJob.count({ where: { status: AiJobStatus.FAILED } }),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      totals: { totalPatients, totalDoctors, totalNurses, totalConsultations, totalAppointments, signedReports, aiJobsCompleted, aiJobsFailed },
      recent: { consultationsLast7, appointmentsLast7 },
    };
  }

  async analyticsTrends(days = 30) {
    const safeDays = Number.isFinite(days) ? Math.min(Math.max(days, 1), 90) : 30;
    const since = new Date(Date.now() - safeDays * 24 * 60 * 60 * 1000);

    const [patients, consultations, appointments] = await this.prisma.$transaction([
      this.prisma.$queryRaw`
        SELECT date_trunc('day', created_at) AS day, COUNT(*)::int AS count
        FROM users WHERE role = 'PATIENT' AND created_at >= ${since}
        GROUP BY 1 ORDER BY 1`,
      this.prisma.$queryRaw`
        SELECT date_trunc('day', started_at) AS day, COUNT(*)::int AS count
        FROM consultations WHERE started_at >= ${since}
        GROUP BY 1 ORDER BY 1`,
      this.prisma.$queryRaw`
        SELECT date_trunc('day', scheduled_start) AS day, COUNT(*)::int AS count
        FROM appointments WHERE scheduled_start >= ${since}
        GROUP BY 1 ORDER BY 1`,
    ]);

    return { patients, consultations, appointments };
  }

  // ─── Notifications ───

  async billingSummary() {
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      doctorProfiles,
      completedAppointments,
      completedAppointmentsLast30,
      scheduledAppointments,
      signedReports,
    ] = await this.prisma.$transaction([
      this.prisma.doctorProfile.findMany({
        where: { consultationFee: { not: null } },
        select: {
          consultationFee: true,
          user: { select: { id: true, fullName: true, email: true } },
          hospital: { select: { id: true, name: true } },
        },
      }),
      this.prisma.appointment.findMany({
        where: { status: AppointmentStatus.COMPLETED },
        select: { id: true, doctorId: true },
      }),
      this.prisma.appointment.findMany({
        where: { status: AppointmentStatus.COMPLETED, scheduledStart: { gte: last30Days } },
        select: { id: true, doctorId: true },
      }),
      this.prisma.appointment.count({
        where: { status: { in: [AppointmentStatus.REQUESTED, AppointmentStatus.SCHEDULED, AppointmentStatus.CHECKED_IN] } },
      }),
      this.prisma.soapReport.count({ where: { status: ReportStatus.SIGNED } }),
    ]);

    const feeByDoctor = new Map(
      doctorProfiles.map((profile) => [
        profile.user.id,
        Number(profile.consultationFee?.toString() ?? 0),
      ]),
    );
    const estimateRevenue = (appointments: Array<{ doctorId: string }>) =>
      appointments.reduce((sum, appointment) => sum + (feeByDoctor.get(appointment.doctorId) ?? 0), 0);
    const fees = [...feeByDoctor.values()];

    return {
      generatedAt: new Date().toISOString(),
      currency: 'INR',
      totals: {
        doctorsWithFees: doctorProfiles.length,
        averageConsultationFee: fees.length ? Math.round(fees.reduce((sum, fee) => sum + fee, 0) / fees.length) : 0,
        completedAppointments: completedAppointments.length,
        completedAppointmentsLast30: completedAppointmentsLast30.length,
        scheduledAppointments,
        signedReports,
        estimatedLifetimeRevenue: estimateRevenue(completedAppointments),
        estimatedRevenueLast30: estimateRevenue(completedAppointmentsLast30),
      },
      feeRoster: doctorProfiles.slice(0, 25).map((profile) => ({
        doctorId: profile.user.id,
        doctorName: profile.user.fullName,
        email: profile.user.email,
        hospitalName: profile.hospital?.name,
        consultationFee: Number(profile.consultationFee?.toString() ?? 0),
      })),
    };
  }

  async supportSummary() {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [failedLogins, lockedUsers, disabledUsers, recentAuditLogs, recentFailedLogins] =
      await this.prisma.$transaction([
        this.prisma.loginLog.count({ where: { success: false, createdAt: { gte: last24Hours } } }),
        this.prisma.user.count({ where: { status: UserStatus.LOCKED, deletedAt: null } }),
        this.prisma.user.count({ where: { status: UserStatus.DISABLED, deletedAt: null } }),
        this.prisma.auditLog.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            actorEmail: true,
            actorRole: true,
            action: true,
            entityType: true,
            entityId: true,
            createdAt: true,
          },
        }),
        this.prisma.loginLog.findMany({
          where: { success: false },
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            email: true,
            reason: true,
            ipAddress: true,
            createdAt: true,
          },
        }),
      ]);

    return {
      generatedAt: new Date().toISOString(),
      totals: {
        failedLoginsLast24h: failedLogins,
        lockedUsers,
        disabledUsers,
      },
      recentAuditLogs,
      recentFailedLogins,
    };
  }

  async recentNotifications(limit = 10) {
    const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 100) : 10;
    const [items, unreadCount] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        take: safeLimit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          channel: true,
          title: true,
          body: true,
          readAt: true,
          createdAt: true,
          user: { select: { fullName: true, email: true } },
        },
      }),
      this.prisma.notification.count({ where: { readAt: null } }),
    ]);

    return { items, unreadCount };
  }

  // ─── Hospital CRUD ───

  async createHospital(data: { name: string; code: string; address?: string; city?: string; state?: string; country?: string }) {
    return this.prisma.hospital.create({ data: { ...data, country: data.country ?? 'IN' } });
  }

  async updateHospital(id: string, data: { name?: string; address?: string; city?: string; state?: string }) {
    return this.prisma.hospital.update({ where: { id }, data });
  }

  private async review(
    approvalId: string,
    status: ApprovalStatus,
    admin: AuthUser,
    meta: { ipAddress?: string; userAgent?: string },
    reason?: string,
  ) {
    const approval = await this.prisma.approvalQueue.findUnique({
      where: { id: approvalId },
      include: { user: true },
    });

    if (!approval) {
      throw new NotFoundException('Approval request not found');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const updatedApproval = await tx.approvalQueue.update({
        where: { id: approvalId },
        data: {
          status,
          reviewedAt: new Date(),
          reviewedByEmail: admin.email,
          rejectionReason: status === ApprovalStatus.REJECTED ? reason : null,
        },
        include: { user: true },
      });

      await tx.user.update({
        where: { id: approval.userId },
        data: {
          approvalStatus: status,
          onboardingStatus:
            status === ApprovalStatus.APPROVED
              ? OnboardingStatus.COMPLETE
              : OnboardingStatus.UNDER_REVIEW,
        },
      });

      await tx.approvalEvent.create({
        data: {
          approvalQueueId: approvalId,
          actorEmail: admin.email,
          fromStatus: approval.status,
          toStatus: status,
          reason,
        },
      });

      await tx.adminAction.create({
        data: {
          adminEmail: admin.email,
          action: `approval.${status.toLowerCase()}`,
          targetUserId: approval.userId,
          approvalQueueId: approvalId,
          metadata: { reason },
          ipAddress: meta.ipAddress,
          userAgent: meta.userAgent,
        },
      });

      await this.audit.recordTx(tx, {
        actorEmail: admin.email,
        actorRole: Role.ADMIN,
        action: `admin.approval.${status.toLowerCase()}`,
        entityType: 'approval_queue',
        entityId: approvalId,
        after: { status, reason },
        metadata: { targetUserId: approval.userId },
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      });

      await this.realtime.enqueue(tx, {
        eventName: 'admin.approval.updated',
        aggregateType: 'approval_queue',
        aggregateId: approvalId,
        actorUserId: admin.userId,
        roleScope: [Role.ADMIN, approval.role],
        roomNames: [
          'admin:approvals',
          this.realtime.roleRoom(Role.ADMIN),
          this.realtime.userRoom(approval.userId),
        ],
        payload: {
          approvalId,
          userId: approval.userId,
          status,
          reason,
        },
      });

      return updatedApproval;
    });

    return result;
  }

  async seedDoctor() {
    const id = Math.random().toString(36).substring(7);
    const email = `seed-doctor-${id}@swasthai.demo`;
    
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          fullName: `Dr. Seeded ${id.toUpperCase()}`,
          phone: `+91 00000 ${Math.floor(10000 + Math.random() * 90000)}`,
          passwordHash: 'demo-hash',
          role: Role.DOCTOR,
          approvalStatus: ApprovalStatus.PENDING,
          onboardingStatus: OnboardingStatus.UNDER_REVIEW,
        },
      });

      await tx.doctorProfile.create({
        data: {
          userId: user.id,
          registrationNumber: `SEED-REG-${id}`,
          specialization: 'General Practice',
          experienceYears: 10,
        },
      });

      const approval = await tx.approvalQueue.create({
        data: {
          userId: user.id,
          role: Role.DOCTOR,
          status: ApprovalStatus.PENDING,
        },
      });

      return { success: true, userId: user.id, approvalId: approval.id };
    });
  }
}
