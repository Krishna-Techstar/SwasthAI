import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma, RealtimeDeliveryStatus, Role } from '@swasthai/database';
import { Server } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

export type RealtimeEventInput = {
  eventName: string;
  aggregateType: string;
  aggregateId: string;
  patientProfileId?: string;
  actorUserId?: string;
  roleScope: Role[];
  roomNames: string[];
  payload: Prisma.InputJsonValue;
};

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);
  private server?: Server;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  attachServer(server: Server) {
    this.server = server;
  }

  async enqueue(tx: Prisma.TransactionClient, event: RealtimeEventInput) {
    return tx.realtimeEventOutbox.create({
      data: {
        eventName: event.eventName,
        aggregateType: event.aggregateType,
        aggregateId: event.aggregateId,
        patientProfileId: event.patientProfileId,
        actorUserId: event.actorUserId,
        roleScope: event.roleScope,
        roomNames: event.roomNames,
        payload: event.payload,
      },
    });
  }

  async publish(event: {
    id: string;
    eventName: string;
    roomNames: string[];
    payload: unknown;
  }) {
    const packet = {
      id: event.id,
      event: event.eventName,
      payload: event.payload,
      publishedAt: new Date().toISOString(),
    };

    for (const room of event.roomNames) {
      this.server?.to(room).emit(event.eventName, packet);
    }

    await this.redis.publish('swasthai:realtime', packet);
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async publishPendingOutbox() {
    const events = await this.prisma.realtimeEventOutbox.findMany({
      where: { deliveryStatus: RealtimeDeliveryStatus.PENDING },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    for (const event of events) {
      try {
        await this.publish(event);
        await this.prisma.realtimeEventOutbox.update({
          where: { id: event.id },
          data: {
            deliveryStatus: RealtimeDeliveryStatus.PUBLISHED,
            publishedAt: new Date(),
            attempts: { increment: 1 },
          },
        });
      } catch (error) {
        this.logger.error(`Failed to publish realtime event ${event.id}`, error as Error);
        await this.prisma.realtimeEventOutbox.update({
          where: { id: event.id },
          data: {
            deliveryStatus: RealtimeDeliveryStatus.FAILED,
            attempts: { increment: 1 },
          },
        });
      }
    }
  }

  patientRoom(patientProfileId: string) {
    return `patient:${patientProfileId}`;
  }

  consultationRoom(consultationId: string) {
    return `consultation:${consultationId}`;
  }

  roleRoom(role: Role) {
    return `role:${role}`;
  }

  userRoom(userId: string) {
    return `user:${userId}`;
  }
}
