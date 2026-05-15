import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { AdminModule } from './admin/admin.module';
import { AiModule } from './ai/ai.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { ApprovalGuard } from './common/guards/approval.guard';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { BigIntSerializerInterceptor } from './common/interceptors/bigint-serializer.interceptor';
import { AuditContextInterceptor } from './common/interceptors/audit-context.interceptor';
import { ConsultationsModule } from './consultations/consultations.module';
import { ConsentModule } from './consent/consent.module';
import { DrugSafetyModule } from './drug-safety/drug-safety.module';
import { FilesModule } from './files/files.module';
import { JobsModule } from './jobs/jobs.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PatientsModule } from './patients/patients.module';
import { PrismaModule } from './prisma/prisma.module';
import { RadiologyModule } from './radiology/radiology.module';
import { ReportsModule } from './reports/reports.module';
import { RealtimeModule } from './realtime/realtime.module';
import { RedisModule } from './redis/redis.module';
import { UsersModule } from './users/users.module';
import { validateEnv } from './config/validate-env';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    ScheduleModule.forRoot(),
    PrismaModule,
    RedisModule,
    JobsModule,
    RealtimeModule,
    AuditModule,
    AuthModule,
    AiModule,
    UsersModule,
    AdminModule,
    PatientsModule,
    ConsentModule,
    ConsultationsModule,
    RadiologyModule,
    ReportsModule,
    FilesModule,
    DrugSafetyModule,
    AppointmentsModule,
    NotificationsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ApprovalGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_INTERCEPTOR, useClass: AuditContextInterceptor },
    { provide: APP_INTERCEPTOR, useClass: BigIntSerializerInterceptor },
  ],
})
export class AppModule {}
