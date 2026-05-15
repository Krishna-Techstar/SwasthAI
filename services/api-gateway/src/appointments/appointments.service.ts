import { ForbiddenException, Injectable } from '@nestjs/common';
import { AppointmentStatus, ReminderChannel, ReminderStatus, Role } from '@swasthai/database';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { PatientsService } from '../patients/patients.service';
import { RealtimeService } from '../realtime/realtime.service';
import { AuthUser } from '../common/types';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { AiFollowUpSuggestionsDto } from './dto/ai-follow-up-suggestions.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly patients: PatientsService,
    private readonly realtime: RealtimeService,
  ) {}

  async create(dto: CreateAppointmentDto, user: AuthUser) {
    if (![Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.PATIENT].includes(user.role)) {
      throw new ForbiddenException('No permission to create appointments');
    }

    if (user.role === Role.PATIENT) {
      await this.patients.assertCanAccessPatient(dto.patientProfileId, user);
    }

    const appointment = await this.prisma.$transaction(async (tx) => {
      const created = await tx.appointment.create({
        data: {
          patientProfileId: dto.patientProfileId,
          doctorId: dto.doctorId,
          nurseId: dto.nurseId,
          hospitalId: dto.hospitalId,
          createdById: user.userId,
          type: dto.type,
          urgency: dto.urgency,
          status: AppointmentStatus.SCHEDULED,
          scheduledStart: new Date(dto.scheduledStart),
          scheduledEnd: new Date(dto.scheduledEnd),
          reason: dto.reason,
        },
      });

      const channels = dto.reminderChannels?.length ? dto.reminderChannels : [ReminderChannel.PUSH];
      await tx.reminder.createMany({
        data: channels.map((channel) => ({
          appointmentId: created.id,
          channel,
          status: ReminderStatus.PENDING,
          scheduledFor: new Date(new Date(dto.scheduledStart).getTime() - 60 * 60 * 1000),
        })),
      });

      await this.patients.appendTimeline(tx, {
        patientProfileId: dto.patientProfileId,
        eventType: 'appointment.scheduled',
        sourceTable: 'appointments',
        sourceId: created.id,
        summary: dto.reason ?? 'Appointment scheduled',
        occurredAt: created.scheduledStart,
      });

      await this.realtime.enqueue(tx, {
        eventName: 'appointment.scheduled',
        aggregateType: 'appointment',
        aggregateId: created.id,
        patientProfileId: dto.patientProfileId,
        actorUserId: user.userId,
        roleScope: [Role.DOCTOR, Role.NURSE, Role.PATIENT, Role.ADMIN],
        roomNames: [
          this.realtime.patientRoom(dto.patientProfileId),
          this.realtime.userRoom(dto.doctorId),
          ...(dto.nurseId ? [this.realtime.userRoom(dto.nurseId)] : []),
        ],
        payload: { appointmentId: created.id, patientProfileId: dto.patientProfileId },
      });

      return created;
    });

    await this.patients.invalidateContext(dto.patientProfileId);
    return appointment;
  }

  async createSchedule(dto: CreateScheduleDto, user: AuthUser) {
    if (user.role !== Role.ADMIN && user.userId !== dto.providerId) {
      throw new ForbiddenException('Only admins or the provider can manage schedules');
    }

    return this.prisma.schedule.create({
      data: {
        providerId: dto.providerId,
        hospitalId: dto.hospitalId,
        weekday: dto.weekday,
        startTime: dto.startTime,
        endTime: dto.endTime,
        slotMinutes: dto.slotMinutes,
        timezone: dto.timezone,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async providerSchedule(providerId: string) {
    return this.prisma.schedule.findMany({
      where: { providerId, isActive: true },
      orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }],
    });
  }

  async createReminder(appointmentId: string, channel: ReminderChannel) {
    const appointment = await this.prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    return this.prisma.reminder.create({
      data: {
        appointmentId,
        channel,
        status: ReminderStatus.PENDING,
        scheduledFor: new Date(appointment.scheduledStart.getTime() - 60 * 60 * 1000),
      },
    });
  }

  async aiFollowUpSuggestions(dto: AiFollowUpSuggestionsDto, user: AuthUser) {
    await this.patients.assertCanAccessPatient(dto.patientProfileId, user);
    const context = await this.patients.getContext(dto.patientProfileId, user);
    const baseUrl = this.config.getOrThrow<string>('FASTAPI_CLINICAL_URL');
    const response = await fetch(`${baseUrl}/follow-up-suggestions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientContext: context, diagnosis: dto.diagnosis }),
    });

    if (!response.ok) {
      throw new Error(`Clinical AI service failed with status ${response.status}`);
    }

    return response.json();
  }
}
