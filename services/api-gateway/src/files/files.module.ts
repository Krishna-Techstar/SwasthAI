import { Module } from '@nestjs/common';
import { PatientsModule } from '../patients/patients.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

@Module({
  imports: [PatientsModule, RealtimeModule],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
