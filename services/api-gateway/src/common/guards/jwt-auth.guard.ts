import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { RequestWithUser } from '../types';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException('Missing access token');
    }

    try {
      const payload = await this.jwt.verifyAsync(token, {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      });

      const session = await this.prisma.session.findUnique({
        where: { id: payload.sessionId },
        select: {
          id: true,
          userId: true,
          adminEmail: true,
          role: true,
          status: true,
          expiresAt: true,
          revokedAt: true,
          user: {
            select: {
              id: true,
              email: true,
              approvalStatus: true,
              status: true,
            },
          },
        },
      });

      if (
        !session ||
        session.status !== 'ACTIVE' ||
        session.revokedAt ||
        session.expiresAt.getTime() <= Date.now()
      ) {
        throw new UnauthorizedException('Session is no longer active');
      }

      if (session.user && session.user.status !== 'ACTIVE') {
        throw new UnauthorizedException('User is not active');
      }

      request.user = {
        sub: payload.sub,
        userId: session.userId ?? undefined,
        adminEmail: session.adminEmail ?? undefined,
        email: session.user?.email ?? session.adminEmail ?? payload.email,
        role: session.role,
        sessionId: session.id,
        jti: payload.jti,
        approvalStatus: session.user?.approvalStatus,
      };
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid access token');
    }
  }

  private extractToken(request: RequestWithUser): string | undefined {
    const header = request.headers.authorization;
    const value = Array.isArray(header) ? header[0] : header;
    if (value?.startsWith('Bearer ')) {
      return value.slice(7);
    }

    return request.cookies?.access_token;
  }
}
