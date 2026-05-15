import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class InternalApiKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const header = request.headers['x-internal-api-key'];
    const supplied = Array.isArray(header) ? header[0] : header;
    const expected = this.config.getOrThrow<string>('AI_SERVICE_API_KEY');

    if (!supplied || supplied !== expected) {
      throw new UnauthorizedException('Invalid internal API key');
    }

    return true;
  }
}
