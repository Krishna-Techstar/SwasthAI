import { Body, Controller, Param, Patch, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/types';
import { ConsentService } from './consent.service';
import { GrantConsentDto } from './dto/grant-consent.dto';
import { RevokeConsentDto } from './dto/revoke-consent.dto';

@Controller('consents')
export class ConsentController {
  constructor(private readonly consent: ConsentService) {}

  @Post()
  grant(@Body() dto: GrantConsentDto, @CurrentUser() user: AuthUser, @Req() req: Request) {
    return this.consent.grant(dto, user, this.meta(req));
  }

  @Patch(':id/revoke')
  revoke(
    @Param('id') id: string,
    @Body() dto: RevokeConsentDto,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ) {
    return this.consent.revoke(id, dto.reason, user, this.meta(req));
  }

  private meta(req: Request) {
    return {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    };
  }
}
