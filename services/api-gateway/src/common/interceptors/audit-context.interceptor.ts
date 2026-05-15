import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { RequestWithUser } from '../types';

export type AuditRequestContext = {
  actorUserId?: string;
  actorEmail?: string;
  actorRole?: string;
  ipAddress?: string;
  userAgent?: string;
};

@Injectable()
export class AuditContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithUser & { audit?: AuditRequestContext }>();
    request.audit = {
      actorUserId: request.user?.userId,
      actorEmail: request.user?.email,
      actorRole: request.user?.role,
      ipAddress: request.ip,
      userAgent: Array.isArray(request.headers['user-agent'])
        ? request.headers['user-agent'][0]
        : request.headers['user-agent'],
    };

    return next.handle();
  }
}
