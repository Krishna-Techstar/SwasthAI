import { Module } from '@nestjs/common';
import { PatientsModule } from '../patients/patients.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { DrugSafetyController } from './drug-safety.controller';
import { DrugSafetyService } from './drug-safety.service';

@Module({
  imports: [PatientsModule, RealtimeModule],
  controllers: [DrugSafetyController],
  providers: [DrugSafetyService],
})
export class DrugSafetyModule {}
