import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../common/types';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(user: AuthUser) {
    return this.prisma.notification.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async markRead(id: string, user: AuthUser) {
    return this.prisma.notification.updateMany({
      where: { id, userId: user.userId },
      data: { readAt: new Date() },
    });
  }
}
