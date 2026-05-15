import { Injectable, NotFoundException } from '@nestjs/common';
import { AiJobStatus, AppointmentStatus, ConsultationStatus, ReportStatus, Role } from '@swasthai/database';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../common/types';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async me(user: AuthUser) {
    if (user.adminEmail) {
      return {
        id: `admin:${user.adminEmail}`,
        email: user.adminEmail,
        fullName: 'SwasthAI Admin',
        role: user.role,
        approvalStatus: 'APPROVED',
      };
    }

    const record = await this.prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        fullName: true,
        abhaId: true,
        approvalStatus: true,
        onboardingStatus: true,
        profileImage: true,
        doctorProfile: true,
        nurseProfile: true,
        patientProfile: true,
      },
    });

    if (!record) {
      throw new NotFoundException('User not found');
    }

    return record;
  }

  async dashboard(user: AuthUser) {
    if (!user.userId) {
      return { role: user.role, generatedAt: new Date().toISOString(), stats: [], queue: [], flags: [] };
    }

    if (user.role === Role.DOCTOR || user.role === Role.NURSE) {
      return this.providerDashboard(user);
    }

    if (user.role === Role.PATIENT) {
      return this.patientDashboard(user);
    }

    return { role: user.role, generatedAt: new Date().toISOString(), stats: [], queue: [], flags: [] };
  }

  private async providerDashboard(user: AuthUser) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);
    const assignmentWhere =
      user.role === Role.DOCTOR
        ? { doctorId: user.userId }
        : { nurseId: user.userId };

    const [
      todaysAppointments,
      activeConsultations,
      pendingAiJobs,
      drugSafetyAlerts,
      reportReviews,
      queue,
    ] = await this.prisma.$transaction([
      this.prisma.appointment.count({
        where: {
          ...assignmentWhere,
          scheduledStart: { gte: startOfToday, lt: endOfToday },
          status: { in: [AppointmentStatus.REQUESTED, AppointmentStatus.SCHEDULED, AppointmentStatus.CHECKED_IN] },
        },
      }),
      this.prisma.consultation.count({
        where: { ...assignmentWhere, status: ConsultationStatus.ACTIVE },
      }),
      this.prisma.aiProcessingJob.count({
        where: {
          status: { in: [AiJobStatus.QUEUED, AiJobStatus.RUNNING] },
          consultation: { is: assignmentWhere },
        },
      }),
      this.prisma.drugSafetyCheck.count({
        where: {
          status: { in: ['BLOCKED', 'WARNING', 'HIGH_RISK'] },
          consultation: { is: assignmentWhere },
        },
      }),
      this.prisma.soapReport.count({
        where: {
          ...(user.role === Role.DOCTOR
            ? { doctorId: user.userId }
            : { consultation: { nurseId: user.userId } }),
          status: { in: [ReportStatus.AI_GENERATED, ReportStatus.UNDER_REVIEW, ReportStatus.DRAFT] },
        },
      }),
      this.prisma.appointment.findMany({
        where: {
          ...assignmentWhere,
          scheduledStart: { gte: startOfToday, lt: endOfToday },
          status: { in: [AppointmentStatus.REQUESTED, AppointmentStatus.SCHEDULED, AppointmentStatus.CHECKED_IN] },
        },
        orderBy: { scheduledStart: 'asc' },
        take: 10,
        include: {
          patient: { include: { user: { select: { fullName: true } } } },
        },
      }),
    ]);

    return {
      role: user.role,
      generatedAt: new Date().toISOString(),
      stats: [
        { key: 'todayPatients', value: todaysAppointments, label: "Today's patients", trend: `${activeConsultations} active consults` },
        { key: 'drugAlerts', value: drugSafetyAlerts, label: 'Drug alerts', trend: 'From persisted safety checks' },
        { key: 'aiQueue', value: pendingAiJobs, label: 'AI queue', trend: 'Queued or running jobs' },
        { key: 'reportReviews', value: reportReviews, label: 'Report reviews', trend: 'Draft and AI-generated SOAP' },
      ],
      flags: [
        { label: 'Drug safety alerts', count: drugSafetyAlerts },
        { label: 'AI jobs pending', count: pendingAiJobs },
      ].filter((item) => item.count > 0),
      queue: queue.map((appointment) => ({
        id: appointment.patientProfileId,
        appointmentId: appointment.id,
        name: appointment.patient.user.fullName,
        type: appointment.type,
        reason: appointment.reason,
        status: appointment.status,
        statusLabel: appointment.status.replace(/_/g, ' ').toLowerCase(),
        scheduledStart: appointment.scheduledStart,
      })),
    };
  }

  private async patientDashboard(user: AuthUser) {
    const patient = await this.prisma.patientProfile.findUnique({
      where: { userId: user.userId },
      select: { id: true },
    });

    if (!patient) {
      throw new NotFoundException('Patient profile not found');
    }

    const [appointments, reports, notifications] = await this.prisma.$transaction([
      this.prisma.appointment.count({
        where: {
          patientProfileId: patient.id,
          scheduledStart: { gte: new Date() },
          status: { in: [AppointmentStatus.REQUESTED, AppointmentStatus.SCHEDULED, AppointmentStatus.CHECKED_IN] },
        },
      }),
      this.prisma.soapReport.count({ where: { patientProfileId: patient.id } }),
      this.prisma.notification.count({ where: { userId: user.userId, readAt: null } }),
    ]);

    return {
      role: user.role,
      generatedAt: new Date().toISOString(),
      stats: [
        { key: 'appointments', value: appointments, label: 'Upcoming appointments', trend: 'Scheduled care' },
        { key: 'reports', value: reports, label: 'Reports', trend: 'SOAP reports' },
        { key: 'notifications', value: notifications, label: 'Unread notifications', trend: 'Care updates' },
      ],
      queue: [],
      flags: notifications ? [{ label: 'Unread notifications', count: notifications }] : [],
    };
  }
}
