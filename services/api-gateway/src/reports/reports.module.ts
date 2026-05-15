import { Module } from '@nestjs/common';
import { PatientsModule } from '../patients/patients.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [PatientsModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
