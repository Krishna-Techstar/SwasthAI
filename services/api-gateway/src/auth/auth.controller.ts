import {
  Body,
  Controller,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { AuthUser } from '../common/types';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignupDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Post('signup')
  async signup(@Body() dto: SignupDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.signup(dto, this.meta(req));
    this.setCookies(res, result.accessToken, result.refreshToken);
    return result;
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.login(dto, this.meta(req));
    this.setCookies(res, result.accessToken, result.refreshToken);
    return result;
  }

  @Public()
  @Post('admin/login')
  async adminLogin(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.adminLogin(dto, this.meta(req));
    this.setCookies(res, result.accessToken, result.refreshToken);
    return result;
  }

  @Public()
  @Post('refresh')
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request & { cookies?: Record<string, string> },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.refresh(dto.refreshToken ?? req.cookies?.refresh_token, this.meta(req));
    this.setCookies(res, result.accessToken, result.refreshToken);
    return result;
  }

  @Public()
  @Post('otp/send')
  sendOtp(@Body() dto: { phone: string }) {
    return this.auth.sendOtp(dto.phone);
  }

  @Public()
  @Post('otp/verify')
  verifyOtp(@Body() dto: { phone: string; otp: string }) {
    return this.auth.verifyOtp(dto.phone, dto.otp);
  }

  @Post('logout')
  async logout(
    @Body() dto: LogoutDto,
    @CurrentUser() user: AuthUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.logout(
      user.sessionId,
      Boolean(dto.allSessions),
      user.userId,
      user.adminEmail,
    );
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return result;
  }

  private meta(req: Request) {
    return {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      deviceId: req.headers['x-device-id'] as string | undefined,
    };
  }

  private setCookies(res: Response, accessToken?: string | null, refreshToken?: string | null) {
    if (!accessToken || !refreshToken) {
      return;
    }

    const secure = String(this.config.get('COOKIE_SECURE') ?? 'true') === 'true';
    const domain = this.config.get<string>('COOKIE_DOMAIN') || undefined;

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure,
      sameSite: secure ? 'none' : 'lax',
      domain,
      maxAge: Number(this.config.get('JWT_ACCESS_TTL_SECONDS') ?? 900) * 1000,
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure,
      sameSite: secure ? 'none' : 'lax',
      domain,
      maxAge: Number(this.config.get('JWT_REFRESH_TTL_SECONDS') ?? 2_592_000) * 1000,
    });
  }
}
