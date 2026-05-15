import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { Role } from '@swasthai/database';
import { Public } from '../common/decorators/public.decorator';
import { InternalApiKeyGuard } from '../common/guards/internal-api-key.guard';
import { RadiologyService } from '../radiology/radiology.service';
import { RecordAiPredictionDto } from '../radiology/dto/record-ai-prediction.dto';
import { AiCallbackService } from './ai-callback.service';
import { CompleteSoapJobDto } from './dto/complete-soap-job.dto';

@Public()
@UseGuards(InternalApiKeyGuard)
@Controller('ai/callbacks')
export class AiCallbackController {
  constructor(
    private readonly callbacks: AiCallbackService,
    private readonly radiology: RadiologyService,
  ) {}

  @Post('soap-completed')
  completeSoap(@Body() dto: CompleteSoapJobDto) {
    return this.callbacks.completeSoapJob(dto);
  }

  @Post('radiology-completed/:uploadId')
  completeRadiology(@Body() dto: RecordAiPredictionDto, @Param('uploadId') uploadId: string) {
    return this.radiology.recordPrediction(uploadId, dto, {
      sub: 'system:fastapi-radiology',
      adminEmail: 'system:fastapi-radiology',
      email: 'system:fastapi-radiology',
      role: Role.ADMIN,
      sessionId: 'internal',
      jti: 'internal',
    });
  }
}
