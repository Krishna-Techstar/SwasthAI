import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Role } from '@swasthai/database';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthUser } from '../common/types';
import { AppointmentsService } from './appointments.service';
import { AiFollowUpSuggestionsDto } from './dto/ai-follow-up-suggestions.dto';
import { CreateAppointmentDto, CreateReminderDto } from './dto/create-appointment.dto';
import { CreateScheduleDto } from './dto/create-schedule.dto';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointments: AppointmentsService) {}

  @Post()
  create(@Body() dto: CreateAppointmentDto, @CurrentUser() user: AuthUser) {
    return this.appointments.create(dto, user);
  }

  @Post('ai-suggestions')
  aiSuggestions(@Body() dto: AiFollowUpSuggestionsDto, @CurrentUser() user: AuthUser) {
    return this.appointments.aiFollowUpSuggestions(dto, user);
  }

  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  @Post('schedules')
  createSchedule(@Body() dto: CreateScheduleDto, @CurrentUser() user: AuthUser) {
    return this.appointments.createSchedule(dto, user);
  }

  @Get('providers/:providerId/schedule')
  providerSchedule(@Param('providerId') providerId: string) {
    return this.appointments.providerSchedule(providerId);
  }

  @Post(':id/reminders')
  createReminder(@Param('id') id: string, @Body() dto: CreateReminderDto) {
    return this.appointments.createReminder(id, dto.channel);
  }
}
