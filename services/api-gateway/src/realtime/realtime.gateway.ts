import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@swasthai/database';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeService } from './realtime.service';

type AuthenticatedSocket = Socket & {
  data: {
    user?: {
      userId?: string;
      adminEmail?: string;
      email: string;
      role: Role;
      sessionId: string;
    };
  };
};

@WebSocketGateway({
  namespace: '/sync',
  cors: { origin: true, credentials: true },
})
export class RealtimeGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeService,
  ) {}

  afterInit(server: Server) {
    this.realtime.attachServer(server);
  }

  async handleConnection(client: AuthenticatedSocket) {
    const token = this.extractToken(client);
    if (!token) {
      client.disconnect(true);
      return;
    }

    try {
      const payload = await this.jwt.verifyAsync(token, {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      });

      const session = await this.prisma.session.findUnique({
        where: { id: payload.sessionId },
        include: { user: { include: { patientProfile: true } } },
      });

      if (!session || session.status !== 'ACTIVE' || session.revokedAt) {
        client.disconnect(true);
        return;
      }

      client.data.user = {
        userId: session.userId ?? undefined,
        adminEmail: session.adminEmail ?? undefined,
        email: session.user?.email ?? session.adminEmail ?? payload.email,
        role: session.role,
        sessionId: session.id,
      };

      if (session.userId) {
        await client.join(this.realtime.userRoom(session.userId));
      }
      await client.join(this.realtime.roleRoom(session.role));

      if (session.role === Role.ADMIN) {
        await client.join('admin:approvals');
      }

      if (session.user?.patientProfile) {
        await client.join(this.realtime.patientRoom(session.user.patientProfile.id));
      }
    } catch {
      client.disconnect(true);
    }
  }

  @SubscribeMessage('patient:subscribe')
  async subscribePatient(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() body: { patientProfileId: string },
  ) {
    const user = client.data.user;
    if (!user || !body.patientProfileId) {
      return { ok: false };
    }

    const allowed = await this.canAccessPatient(user, body.patientProfileId);
    if (!allowed) {
      return { ok: false };
    }

    await client.join(this.realtime.patientRoom(body.patientProfileId));
    return { ok: true };
  }

  @SubscribeMessage('consultation:subscribe')
  async subscribeConsultation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() body: { consultationId: string },
  ) {
    const user = client.data.user;
    if (!user || !body.consultationId) {
      return { ok: false };
    }

    const consultation = await this.prisma.consultation.findUnique({
      where: { id: body.consultationId },
      select: { patientProfileId: true, doctorId: true, nurseId: true },
    });

    const allowed =
      consultation &&
      (user.role === Role.ADMIN ||
        user.userId === consultation.doctorId ||
        user.userId === consultation.nurseId ||
        (await this.isPatientSelf(user, consultation.patientProfileId)));

    if (!allowed) {
      return { ok: false };
    }

    await client.join(this.realtime.consultationRoom(body.consultationId));
    return { ok: true };
  }

  private extractToken(client: Socket): string | undefined {
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string') {
      return authToken;
    }

    const header = client.handshake.headers.authorization;
    if (header?.startsWith('Bearer ')) {
      return header.slice(7);
    }

    return undefined;
  }

  private async canAccessPatient(
    user: AuthenticatedSocket['data']['user'],
    patientProfileId: string,
  ) {
    if (!user) {
      return false;
    }

    if (user.role === Role.ADMIN) {
      return true;
    }

    if (await this.isPatientSelf(user, patientProfileId)) {
      return true;
    }

    if (user.role === Role.DOCTOR || user.role === Role.NURSE) {
      const count = await this.prisma.consultation.count({
        where: {
          patientProfileId,
          OR: [{ doctorId: user.userId }, { nurseId: user.userId }],
        },
      });
      return count > 0;
    }

    return false;
  }

  private async isPatientSelf(
    user: AuthenticatedSocket['data']['user'],
    patientProfileId: string,
  ) {
    if (!user?.userId || user.role !== Role.PATIENT) {
      return false;
    }

    const patient = await this.prisma.patientProfile.findUnique({
      where: { id: patientProfileId },
      select: { userId: true },
    });
    return patient?.userId === user.userId;
  }
}
