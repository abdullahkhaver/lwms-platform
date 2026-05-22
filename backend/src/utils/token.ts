import jwt from "jsonwebtoken";
import crypto from "crypto";
import { JwtPayload, UserRole } from "../types/index.js";

// ─── Token Generation ─────────────────────────────────────────────────────────

export const generateAccessToken = (id: string, role: UserRole): string => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN ?? "7d";

  if (!secret) throw new Error("JWT_SECRET is not defined");

  return jwt.sign({ id, role }, secret, { expiresIn } as jwt.SignOptions);
};

export const generateRefreshToken = (id: string, role: UserRole): string => {
  const secret = process.env.JWT_REFRESH_SECRET;
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN ?? "30d";

  if (!secret) throw new Error("JWT_REFRESH_SECRET is not defined");

  return jwt.sign({ id, role }, secret, { expiresIn } as jwt.SignOptions);
};

// ─── Token Verification ───────────────────────────────────────────────────────

export const verifyAccessToken = (token: string): JwtPayload => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined");
  return jwt.verify(token, secret) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error("JWT_REFRESH_SECRET is not defined");
  return jwt.verify(token, secret) as JwtPayload;
};

// ─── Secure Random Tokens (for email verification / password reset) ───────────

export const generateSecureToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

export const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

// ─── Cookie Options ───────────────────────────────────────────────────────────

export const accessTokenCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === "true",
  sameSite: (process.env.COOKIE_SAME_SITE ?? "lax") as "lax" | "strict" | "none",
  maxAge: 7 * 24 * 60 * 60 * 1000,   // 7 days in ms
  path: "/",
});

export const refreshTokenCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === "true",
  sameSite: (process.env.COOKIE_SAME_SITE ?? "lax") as "lax" | "strict" | "none",
  maxAge: 30 * 24 * 60 * 60 * 1000,  // 30 days in ms
  path: "/api/auth",                  // restrict cookie scope to auth routes
});

export const clearCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === "true",
  sameSite: (process.env.COOKIE_SAME_SITE ?? "lax") as "lax" | "strict" | "none",
  path: "/",
});
