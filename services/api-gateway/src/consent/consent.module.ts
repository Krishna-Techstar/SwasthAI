import { Module } from '@nestjs/common';
import { PatientsModule } from '../patients/patients.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { ConsentController } from './consent.controller';
import { ConsentService } from './consent.service';

@Module({
  imports: [PatientsModule, RealtimeModule],
  controllers: [ConsentController],
  providers: [ConsentService],
  exports: [ConsentService],
})
export class ConsentModule {}
