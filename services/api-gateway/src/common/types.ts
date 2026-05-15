import { Role } from '@swasthai/database';

export type AuthUser = {
  sub: string;
  userId?: string;
  adminEmail?: string;
  email: string;
  role: Role;
  sessionId: string;
  jti: string;
  approvalStatus?: string;
};

export type RequestWithUser = Request & {
  user: AuthUser;
  cookies?: Record<string, string>;
  ip?: string;
  headers: Record<string, string | string[] | undefined>;
};
