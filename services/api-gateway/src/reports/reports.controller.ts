import { Controller, Get, Param } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/types';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('patients/:patientProfileId')
  patientReports(@Param('patientProfileId') patientProfileId: string, @CurrentUser() user: AuthUser) {
    return this.reports.patientReports(patientProfileId, user);
  }

  @Get('soap/:id')
  soapReport(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.reports.soapReport(id, user);
  }

  @Get('radiology/:id')
  radiologyReport(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.reports.radiologyReport(id, user);
  }
}
