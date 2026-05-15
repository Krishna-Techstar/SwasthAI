import { Module } from '@nestjs/common';
import { PatientsModule } from '../patients/patients.module';
import { RadiologyModule } from '../radiology/radiology.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { AiCallbackController } from './ai-callback.controller';
import { AiCallbackService } from './ai-callback.service';

@Module({
  imports: [PatientsModule, RadiologyModule, RealtimeModule],
  controllers: [AiCallbackController],
  providers: [AiCallbackService],
})
export class AiModule {}
