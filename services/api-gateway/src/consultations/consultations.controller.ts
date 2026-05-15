import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { Role } from '@swasthai/database';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthUser } from '../common/types';
import { ConsultationsService } from './consultations.service';
import { AddVitalDto } from './dto/add-vital.dto';
import { SaveBodyMapDto } from './dto/body-map.dto';
import { CreateSoapReportDto } from './dto/create-soap-report.dto';
import { GenerateSoapDto } from './dto/generate-soap.dto';
import { LiveTranscriptDto } from './dto/live-transcript.dto';
import { SaveNoteDto } from './dto/save-note.dto';
import { StartConsultationDto } from './dto/start-consultation.dto';

@Controller('consultations')
export class ConsultationsController {
  constructor(private readonly consultations: ConsultationsService) {}

  @Roles(Role.DOCTOR)
  @Post()
  start(@Body() dto: StartConsultationDto, @CurrentUser() user: AuthUser) {
    return this.consultations.start(dto, user);
  }

  @Get(':id')
  get(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.consultations.get(id, user);
  }

  @Roles(Role.DOCTOR, Role.NURSE, Role.ADMIN)
  @Post(':id/notes')
  saveNote(@Param('id') id: string, @Body() dto: SaveNoteDto, @CurrentUser() user: AuthUser) {
    return this.consultations.saveNote(id, dto, user);
  }

  @Roles(Role.DOCTOR, Role.NURSE, Role.ADMIN)
  @Post(':id/transcripts')
  addTranscript(@Param('id') id: string, @Body() dto: LiveTranscriptDto, @CurrentUser() user: AuthUser) {
    return this.consultations.addTranscript(id, dto, user);
  }

  @Roles(Role.DOCTOR, Role.NURSE, Role.ADMIN)
  @Post(':id/vitals')
  addVital(@Param('id') id: string, @Body() dto: AddVitalDto, @CurrentUser() user: AuthUser) {
    return this.consultations.addVital(id, dto, user);
  }

  @Roles(Role.DOCTOR, Role.NURSE, Role.ADMIN)
  @Post(':id/body-map')
  saveBodyMap(@Param('id') id: string, @Body() dto: SaveBodyMapDto, @CurrentUser() user: AuthUser) {
    return this.consultations.saveBodyMap(id, dto, user);
  }

  @Roles(Role.DOCTOR, Role.ADMIN)
  @Post(':id/soap-reports/generate-ai')
  generateSoap(@Param('id') id: string, @Body() dto: GenerateSoapDto, @CurrentUser() user: AuthUser) {
    return this.consultations.queueSoapGeneration(id, dto, user);
  }

  @Roles(Role.DOCTOR, Role.ADMIN)
  @Post(':id/soap-reports')
  createSoap(@Param('id') id: string, @Body() dto: CreateSoapReportDto, @CurrentUser() user: AuthUser) {
    return this.consultations.createSoapReport(id, dto, user);
  }

  @Roles(Role.DOCTOR)
  @Patch('soap-reports/:reportId/sign')
  signSoap(@Param('reportId') reportId: string, @CurrentUser() user: AuthUser) {
    return this.consultations.signSoapReport(reportId, user);
  }

  @Roles(Role.DOCTOR, Role.NURSE, Role.ADMIN)
  @Patch(':id/end')
  end(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.consultations.end(id, user);
  }
}
