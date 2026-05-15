import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { Role } from '@swasthai/database';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthUser } from '../common/types';
import { AdminService } from './admin.service';
import { ListApprovalsDto } from './dto/list-approvals.dto';
import { ReviewApprovalDto } from './dto/review-approval.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { ListAppointmentsDto } from './dto/list-appointments.dto';
import { ListConsultationsDto } from './dto/list-consultations.dto';
import { CreateHospitalDto } from './dto/create-hospital.dto';

@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('approvals')
  listApprovals(@Query() query: ListApprovalsDto) {
    return this.adminService.listApprovals(query);
  }

  @Get('dashboard')
  dashboard() {
    return this.adminService.dashboard();
  }

  @Get('reports')
  reports() {
    return this.adminService.reports();
  }

  @Get('ai-jobs')
  aiJobs() {
    return this.adminService.aiJobs();
  }

  @Get('realtime/health')
  realtimeHealth() {
    return this.adminService.realtimeHealth();
  }

  @Get('hospitals')
  hospitals() {
    return this.adminService.hospitals();
  }

  @Post('hospitals')
  createHospital(@Body() dto: CreateHospitalDto) {
    return this.adminService.createHospital(dto);
  }

  @Patch('hospitals/:id')
  updateHospital(@Param('id') id: string, @Body() dto: Partial<CreateHospitalDto>) {
    return this.adminService.updateHospital(id, dto);
  }

  @Patch('approvals/:id/approve')
  approve(@Param('id') id: string, @CurrentUser() user: AuthUser, @Req() req: Request) {
    return this.adminService.approve(id, user, this.meta(req));
  }

  @Patch('approvals/:id/reject')
  reject(
    @Param('id') id: string,
    @Body() dto: ReviewApprovalDto,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ) {
    return this.adminService.reject(id, dto.reason, user, this.meta(req));
  }

  // ─── User Management ───

  @Get('users')
  listUsers(@Query() query: ListUsersDto) {
    return this.adminService.listUsers(query);
  }

  @Get('users/:id')
  getUserDetail(@Param('id') id: string) {
    return this.adminService.getUserDetail(id);
  }

  @Patch('users/:id/status')
  updateUserStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ) {
    return this.adminService.updateUserStatus(id, dto.status, user, this.meta(req), dto.reason);
  }

  // ─── Appointments & Consultations ───

  @Get('appointments')
  listAppointments(@Query() query: ListAppointmentsDto) {
    return this.adminService.listAppointments(query);
  }

  @Get('consultations')
  listConsultations(@Query() query: ListConsultationsDto) {
    return this.adminService.listConsultations(query);
  }

  // ─── Analytics ───

  @Get('analytics/summary')
  analyticsSummary() {
    return this.adminService.analyticsSummary();
  }

  @Get('analytics/trends')
  analyticsTrends(@Query('days') days?: string) {
    return this.adminService.analyticsTrends(days ? Number(days) : 30);
  }

  @Get('billing/summary')
  billingSummary() {
    return this.adminService.billingSummary();
  }

  @Get('support/summary')
  supportSummary() {
    return this.adminService.supportSummary();
  }

  // ─── Notifications ───

  @Get('notifications/recent')
  recentNotifications(@Query('limit') limit?: string) {
    return this.adminService.recentNotifications(limit ? Number(limit) : 10);
  }

  @Post('seed-doctor')
  seedDoctor() {
    return this.adminService.seedDoctor();
  }

  private meta(req: Request) {
    return {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    };
  }
}
