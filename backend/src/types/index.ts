// ─── Role Enums ───────────────────────────────────────────────────────────────

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

// ─── JWT Payload ──────────────────────────────────────────────────────────────

export interface JwtPayload {
  id: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// ─── Auth Request Bodies ──────────────────────────────────────────────────────

export interface RegisterBody {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface ForgotPasswordBody {
  email: string;
}

export interface ResetPasswordBody {
  token: string;
  password: string;
}

export interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileBody {
  name?: string;
  phone?: string;
}

// ─── Augment Express Request ──────────────────────────────────────────────────

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
      };
    }
  }
}
