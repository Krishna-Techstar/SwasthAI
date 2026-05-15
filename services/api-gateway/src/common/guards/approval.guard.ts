import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Role } from '@swasthai/database';
import { RequestWithUser } from '../types';

@Injectable()
export class ApprovalGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user || user.role === Role.ADMIN || user.role === Role.PATIENT) {
      return true;
    }

    if (user.approvalStatus !== 'APPROVED') {
      throw new ForbiddenException('Provider account is awaiting admin approval');
    }

    return true;
  }
}
