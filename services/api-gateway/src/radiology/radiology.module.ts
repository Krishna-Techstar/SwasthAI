import { Module } from '@nestjs/common';
import { ConsentModule } from '../consent/consent.module';
import { PatientsModule } from '../patients/patients.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { RadiologyController } from './radiology.controller';
import { RadiologyService } from './radiology.service';

@Module({
  imports: [ConsentModule, PatientsModule, RealtimeModule],
  controllers: [RadiologyController],
  providers: [RadiologyService],
  exports: [RadiologyService],
})
export class RadiologyModule {}
