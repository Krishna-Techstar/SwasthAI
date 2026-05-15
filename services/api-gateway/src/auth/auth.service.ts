import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ApprovalStatus,
  OnboardingStatus,
  Role,
  SessionStatus,
  User,
} from '@swasthai/database';
import * as bcrypt from 'bcryptjs';
import { randomUUID, createHash, randomInt } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { RealtimeService } from '../realtime/realtime.service';
import { RedisService } from '../redis/redis.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

type RequestMeta = {
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
    private readonly realtime: RealtimeService,
    private readonly redis: RedisService,
  ) {}

  async signup(dto: SignupDto, meta: RequestMeta) {
    if (dto.role === Role.ADMIN) {
      throw new BadRequestException('Admin signup is disabled');
    }

    const email = dto.email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(dto.password, 12);

    const result = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.user.findFirst({
        where: {
          OR: [
            { email },
            ...(dto.phone ? [{ phone: dto.phone }] : []),
            ...(dto.abhaId ? [{ abhaId: dto.abhaId }] : []),
          ],
        },
      });

      if (existing) {
        throw new BadRequestException('A user with these credentials already exists');
      }

      const approvalRequired = dto.role === Role.DOCTOR || dto.role === Role.NURSE;
      const user = await tx.user.create({
        data: {
          email,
          phone: dto.phone,
          passwordHash,
          role: dto.role,
          abhaId: dto.abhaId,
          fullName: dto.fullName,
          approvalStatus: approvalRequired ? ApprovalStatus.PENDING : ApprovalStatus.NOT_REQUIRED,
          onboardingStatus: approvalRequired
            ? OnboardingStatus.UNDER_REVIEW
            : OnboardingStatus.COMPLETE,
        },
      });

      if (dto.role === Role.DOCTOR) {
        await tx.doctorProfile.create({
          data: {
            userId: user.id,
            hospitalId: dto.hospitalId,
            registrationNumber: dto.registrationNumber || `DEMO-REG-${Date.now().toString().slice(-6)}`,
            specialization: dto.specialization || 'General Practice',
            experienceYears: dto.experienceYears || 0,
          },
        });
      }

      if (dto.role === Role.NURSE) {
        await tx.nurseProfile.create({
          data: {
            userId: user.id,
            hospitalId: dto.hospitalId,
            licenseNumber: dto.licenseNumber || `DEMO-LIC-${Date.now().toString().slice(-6)}`,
            department: dto.department || 'General',
            experienceYears: dto.experienceYears || 0,
          },
        });
      }

      if (dto.role === Role.PATIENT) {
        await tx.patientProfile.create({
          data: {
            userId: user.id,
            dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
            gender: dto.gender,
            bloodGroup: dto.bloodGroup,
            address: dto.address,
          },
        });
      }

      if (approvalRequired) {
        const approval = await tx.approvalQueue.create({
          data: {
            userId: user.id,
            role: dto.role,
            hospitalId: dto.hospitalId,
            status: ApprovalStatus.PENDING,
          },
        });

        await this.realtime.enqueue(tx, {
          eventName: 'admin.approval.created',
          aggregateType: 'approval_queue',
          aggregateId: approval.id,
          actorUserId: user.id,
          roleScope: [Role.ADMIN],
          roomNames: ['admin:approvals', this.realtime.roleRoom(Role.ADMIN)],
          payload: { approvalId: approval.id, userId: user.id, role: dto.role },
        });
      }

      await this.audit.recordTx(tx, {
        actorUserId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        action: 'auth.signup',
        entityType: 'user',
        entityId: user.id,
        metadata: { role: dto.role },
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      });

      return user;
    });

    if (result.role === Role.DOCTOR || result.role === Role.NURSE) {
      return {
        user: this.safeUser(result),
        requiresApproval: true,
        accessToken: null,
        refreshToken: null,
      };
    }

    const tokens = await this.createSession(result, meta);
    return { user: this.safeUser(result), requiresApproval: false, ...tokens };
  }

  async login(dto: LoginDto, meta: RequestMeta) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      await this.audit.login({ email, success: false, reason: 'USER_NOT_FOUND', ...meta });
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      await this.audit.login({
        email,
        userId: user.id,
        role: user.role,
        success: false,
        reason: 'BAD_PASSWORD',
        ...meta,
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    if (
      (user.role === Role.DOCTOR || user.role === Role.NURSE) &&
      user.approvalStatus !== ApprovalStatus.APPROVED
    ) {
      await this.audit.login({
        email,
        userId: user.id,
        role: user.role,
        success: false,
        reason: `APPROVAL_${user.approvalStatus}`,
        ...meta,
      });
      throw new ForbiddenException('Provider account is awaiting admin approval');
    }

    const tokens = await this.createSession(user, meta);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    await this.audit.login({ email, userId: user.id, role: user.role, success: true, ...meta });

    return { user: this.safeUser(user), ...tokens };
  }

  async adminLogin(dto: LoginDto, meta: RequestMeta) {
    const email = dto.email.trim().toLowerCase();
    const adminEmail = this.config.getOrThrow<string>('ADMIN_EMAIL').trim().toLowerCase();
    const passwordHash = this.config.getOrThrow<string>('ADMIN_PASSWORD_HASH');

    if (email !== adminEmail || !(await bcrypt.compare(dto.password, passwordHash))) {
      await this.audit.login({
        email,
        role: Role.ADMIN,
        success: false,
        reason: 'BAD_ADMIN_CREDENTIALS',
        ...meta,
      });
      throw new UnauthorizedException('Invalid admin credentials');
    }

    const tokens = await this.createAdminSession(adminEmail, meta);
    await this.audit.login({ email, role: Role.ADMIN, success: true, ...meta });
    return {
      user: {
        id: `admin:${adminEmail}`,
        email: adminEmail,
        fullName: 'SwasthAI Admin',
        role: Role.ADMIN,
        approvalStatus: ApprovalStatus.APPROVED,
      },
      ...tokens,
    };
  }

  async refresh(refreshToken: string | undefined, meta: RequestMeta) {
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    let payload: { sessionId: string; jti: string; sub: string; email: string; role: Role };
    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const oldHash = this.hashToken(refreshToken);
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: oldHash },
      include: { session: { include: { user: true } } },
    });

    if (
      !tokenRecord ||
      tokenRecord.revokedAt ||
      tokenRecord.expiresAt.getTime() <= Date.now() ||
      tokenRecord.session.status !== SessionStatus.ACTIVE ||
      tokenRecord.session.revokedAt
    ) {
      throw new UnauthorizedException('Refresh token is no longer valid');
    }

    const subjectUser = tokenRecord.session.user;
    const subject = subjectUser
      ? {
          sub: subjectUser.id,
          userId: subjectUser.id,
          email: subjectUser.email,
          role: subjectUser.role,
        }
      : {
          sub: `admin:${tokenRecord.session.adminEmail}`,
          adminEmail: tokenRecord.session.adminEmail!,
          email: tokenRecord.session.adminEmail!,
          role: Role.ADMIN,
        };

    const accessJti = randomUUID();
    const refreshJti = randomUUID();
    const accessToken = await this.signAccess({
      ...subject,
      sessionId: tokenRecord.sessionId,
      jti: accessJti,
    });
    const newRefreshToken = await this.signRefresh({
      ...subject,
      sessionId: tokenRecord.sessionId,
      jti: refreshJti,
    });
    const newRefreshHash = this.hashToken(newRefreshToken);

    await this.prisma.$transaction(async (tx) => {
      await tx.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { revokedAt: new Date() },
      });
      const nextRefresh = await tx.refreshToken.create({
        data: {
          userId: tokenRecord.userId,
          adminEmail: tokenRecord.adminEmail,
          sessionId: tokenRecord.sessionId,
          tokenHash: newRefreshHash,
          rotatedFromTokenId: tokenRecord.id,
          expiresAt: this.refreshExpiry(),
        },
      });
      await tx.session.update({
        where: { id: tokenRecord.sessionId },
        data: {
          accessJti,
          refreshTokenId: nextRefresh.id,
          ipAddress: meta.ipAddress,
          userAgent: meta.userAgent,
        },
      });
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  async sendOtp(phone: string | undefined) {
    if (!phone) {
      throw new BadRequestException('Phone number is required');
    }

    const normalizedPhone = phone.trim();
    // DEMO MODE: Don't actually send anything or store in Redis
    console.log(`[DEMO] OTP requested for ${normalizedPhone}. Use any 6-digit code (e.g., 000000)`);

    return {
      success: true,
      phone: normalizedPhone,
      expiresIn: 300,
      delivery: 'demo-mode',
      devCode: '000000', // Provide a hint for the demo
    };
  }

  async verifyOtp(phone: string | undefined, otp: string | undefined) {
    if (!phone || !otp) {
      throw new BadRequestException('Phone number and OTP are required');
    }

    const normalizedPhone = phone.trim();
    const normalizedOtp = otp.trim();

    // DEMO MODE: Any 6-digit code is valid
    if (/^\d{6}$/.test(normalizedOtp)) {
      console.log(`[DEMO] OTP verified for ${normalizedPhone}: ${normalizedOtp}`);
      return { success: true, phone: normalizedPhone, verifiedAt: new Date().toISOString() };
    }

    throw new UnauthorizedException('Invalid OTP format. Please use a 6-digit code.');
  }

  async logout(sessionId: string, allSessions: boolean, userId?: string, adminEmail?: string) {
    const now = new Date();
    await this.prisma.$transaction(async (tx) => {
      if (allSessions && userId) {
        await tx.session.updateMany({
          where: { userId, status: SessionStatus.ACTIVE },
          data: { status: SessionStatus.REVOKED, revokedAt: now },
        });
        await tx.refreshToken.updateMany({
          where: { userId, revokedAt: null },
          data: { revokedAt: now },
        });
        return;
      }

      if (allSessions && adminEmail) {
        await tx.session.updateMany({
          where: { adminEmail, status: SessionStatus.ACTIVE },
          data: { status: SessionStatus.REVOKED, revokedAt: now },
        });
        await tx.refreshToken.updateMany({
          where: { adminEmail, revokedAt: null },
          data: { revokedAt: now },
        });
        return;
      }

      await tx.session.update({
        where: { id: sessionId },
        data: { status: SessionStatus.REVOKED, revokedAt: now },
      });
      await tx.refreshToken.updateMany({
        where: { sessionId, revokedAt: null },
        data: { revokedAt: now },
      });
    });

    return { success: true };
  }

  private async createSession(user: User, meta: RequestMeta) {
    const sessionId = randomUUID();
    const accessJti = randomUUID();
    const refreshJti = randomUUID();

    const accessToken = await this.signAccess({
      sub: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionId,
      jti: accessJti,
    });
    const refreshToken = await this.signRefresh({
      sub: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionId,
      jti: refreshJti,
    });

    await this.prisma.$transaction(async (tx) => {
      await tx.session.create({
        data: {
          id: sessionId,
          userId: user.id,
          role: user.role,
          accessJti,
          ipAddress: meta.ipAddress,
          userAgent: meta.userAgent,
          deviceId: meta.deviceId,
          expiresAt: this.refreshExpiry(),
        },
      });
      const refresh = await tx.refreshToken.create({
        data: {
          userId: user.id,
          sessionId,
          tokenHash: this.hashToken(refreshToken),
          expiresAt: this.refreshExpiry(),
        },
      });
      await tx.session.update({
        where: { id: sessionId },
        data: { refreshTokenId: refresh.id },
      });
    });

    return { accessToken, refreshToken };
  }

  private async createAdminSession(adminEmail: string, meta: RequestMeta) {
    const sessionId = randomUUID();
    const accessJti = randomUUID();
    const refreshJti = randomUUID();

    const accessToken = await this.signAccess({
      sub: `admin:${adminEmail}`,
      adminEmail,
      email: adminEmail,
      role: Role.ADMIN,
      sessionId,
      jti: accessJti,
    });
    const refreshToken = await this.signRefresh({
      sub: `admin:${adminEmail}`,
      adminEmail,
      email: adminEmail,
      role: Role.ADMIN,
      sessionId,
      jti: refreshJti,
    });

    await this.prisma.$transaction(async (tx) => {
      await tx.session.create({
        data: {
          id: sessionId,
          adminEmail,
          role: Role.ADMIN,
          accessJti,
          ipAddress: meta.ipAddress,
          userAgent: meta.userAgent,
          deviceId: meta.deviceId,
          expiresAt: this.refreshExpiry(),
        },
      });
      const refresh = await tx.refreshToken.create({
        data: {
          adminEmail,
          sessionId,
          tokenHash: this.hashToken(refreshToken),
          expiresAt: this.refreshExpiry(),
        },
      });
      await tx.session.update({
        where: { id: sessionId },
        data: { refreshTokenId: refresh.id },
      });
    });

    return { accessToken, refreshToken };
  }

  private async signAccess(payload: Record<string, unknown>) {
    return this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: Number(this.config.get('JWT_ACCESS_TTL_SECONDS') ?? 900),
    });
  }

  private async signRefresh(payload: Record<string, unknown>) {
    return this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: Number(this.config.get('JWT_REFRESH_TTL_SECONDS') ?? 2_592_000),
    });
  }

  private refreshExpiry() {
    const ttlSeconds = Number(this.config.get('JWT_REFRESH_TTL_SECONDS') ?? 2_592_000);
    return new Date(Date.now() + ttlSeconds * 1000);
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private otpKey(phone: string) {
    return `otp:${phone}`;
  }

  private safeUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      fullName: user.fullName,
      abhaId: user.abhaId,
      approvalStatus: user.approvalStatus,
      onboardingStatus: user.onboardingStatus,
      profileImageFileId: user.profileImageFileId,
    };
  }
}
