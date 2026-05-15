import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuditModule } from '../audit/audit.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { RedisModule } from '../redis/redis.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    ConfigModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),

        signOptions: {
          expiresIn: '900s',
        },
      }),
    }),

    AuditModule,
    RealtimeModule,
    RedisModule,
  ],

  controllers: [AuthController],

  providers: [AuthService],

  exports: [
    AuthService,
    JwtModule,
  ],
})
export class AuthModule {}
