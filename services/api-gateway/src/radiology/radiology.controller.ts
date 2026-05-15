import { Body, Controller, Param, Post } from '@nestjs/common';
import { Role } from '@swasthai/database';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthUser } from '../common/types';
import { CreateRadiologyReportDto } from './dto/create-radiology-report.dto';
import { CreateRadiologyUploadDto } from './dto/create-radiology-upload.dto';
import { RecordAiPredictionDto } from './dto/record-ai-prediction.dto';
import { RadiologyService } from './radiology.service';

@Roles(Role.DOCTOR, Role.NURSE, Role.ADMIN)
@Controller('radiology')
export class RadiologyController {
  constructor(private readonly radiology: RadiologyService) {}

  @Post('uploads')
  createUpload(@Body() dto: CreateRadiologyUploadDto, @CurrentUser() user: AuthUser) {
    return this.radiology.createUpload(dto, user);
  }

  @Post('uploads/:id/predictions')
  recordPrediction(
    @Param('id') id: string,
    @Body() dto: RecordAiPredictionDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.radiology.recordPrediction(id, dto, user);
  }

  @Post('uploads/:id/reports')
  createReport(
    @Param('id') id: string,
    @Body() dto: CreateRadiologyReportDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.radiology.createReport(id, dto, user);
  }
}
