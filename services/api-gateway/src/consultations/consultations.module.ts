import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { ConsentModule } from '../consent/consent.module';
import { PatientsModule } from '../patients/patients.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { ConsultationsController } from './consultations.controller';
import { ConsultationsService } from './consultations.service';

@Module({
  imports: [AuditModule, ConsentModule, PatientsModule, RealtimeModule],
  controllers: [ConsultationsController],
  providers: [ConsultationsService],
  exports: [ConsultationsService],
})
export class ConsultationsModule {}
