import { Request, Response } from "express";
import crypto from "crypto";
import User from "../models/User.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateSecureToken,
  hashToken,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  clearCookieOptions,
} from "../utils/token.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "../utils/email.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { UserRole } from "../types/index.js";

// ─── Register ─────────────────────────────────────────────────────────────────

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, phone, password } = req.body as {
    name: string;
    email: string;
    phone: string;
    password: string;
  };

  // Check if email already registered
  const existing = await User.findOne({ email });
  if (existing) {
    sendError(res, "An account with this email already exists.", 409);
    return;
  }

  // Generate email verification token
  const rawToken = generateSecureToken();
  const hashedToken = hashToken(rawToken);

  const user = await User.create({
    name,
    email,
    phone,
    password,
    emailVerificationToken: hashedToken,
    emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
  });

  // Send verification email (non-blocking — don't fail registration if email fails)
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${rawToken}`;
  try {
    await sendVerificationEmail(email, name, verificationUrl);
  } catch (err) {
    console.error("Failed to send verification email:", err);
  }

  sendSuccess(
    res,
    "Account created! Please check your email to verify your account.",
    { id: user._id, name: user.name, email: user.email },
    201
  );
};

// ─── Verify Email ─────────────────────────────────────────────────────────────

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.query as { token: string };

  if (!token) {
    sendError(res, "Verification token is required.", 400);
    return;
  }

  const hashedToken = hashToken(token);
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: new Date() },
  }).select("+emailVerificationToken +emailVerificationExpires");

  if (!user) {
    sendError(res, "Invalid or expired verification token.", 400);
    return;
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  try {
    await sendWelcomeEmail(user.email, user.name);
  } catch (err) {
    console.error("Failed to send welcome email:", err);
  }

  sendSuccess(res, "Email verified successfully. You can now log in.");
};

// ─── Login ────────────────────────────────────────────────────────────────────

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email: string; password: string };

  const user = await User.findByEmail(email);

  if (!user || !(await user.comparePassword(password))) {
    // Same message for both cases to prevent user enumeration
    sendError(res, "Invalid email or password.", 401);
    return;
  }

  if (!user.isActive) {
    sendError(res, "Your account has been deactivated. Please contact support.", 403);
    return;
  }

  if (!user.isEmailVerified) {
    sendError(res, "Please verify your email before logging in.", 403);
    return;
  }

  // Generate tokens
  const accessToken = generateAccessToken(user._id.toString(), UserRole.USER);
  const refreshToken = generateRefreshToken(user._id.toString(), UserRole.USER);

  // Store hashed refresh token
  const hashedRefresh = hashToken(refreshToken);
  user.refreshTokens.push(hashedRefresh);
  // Keep at most 5 refresh tokens (multi-device support)
  if (user.refreshTokens.length > 5) user.refreshTokens.shift();
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  // Set cookies
  res.cookie("accessToken", accessToken, accessTokenCookieOptions());
  res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions());

  sendSuccess(res, "Logged in successfully.", {
    accessToken,
    user: user.toSafeObject(),
  });
};

// ─── Refresh Token ────────────────────────────────────────────────────────────

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const token: string | undefined =
    req.cookies?.refreshToken ?? (req.body as { refreshToken?: string }).refreshToken;

  if (!token) {
    sendError(res, "Refresh token is required.", 401);
    return;
  }

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    sendError(res, "Invalid or expired refresh token.", 401);
    return;
  }

  const user = await User.findById(payload.id).select("+refreshTokens");
  if (!user || !user.isActive) {
    sendError(res, "User not found.", 401);
    return;
  }

  const hashedIncoming = hashToken(token);
  if (!user.refreshTokens.includes(hashedIncoming)) {
    // Token reuse detected — invalidate all tokens (security measure)
    user.refreshTokens = [];
    await user.save({ validateBeforeSave: false });
    sendError(res, "Refresh token reuse detected. All sessions have been invalidated.", 401);
    return;
  }

  // Rotate refresh token
  user.refreshTokens = user.refreshTokens.filter((t) => t !== hashedIncoming);
  const newAccessToken = generateAccessToken(user._id.toString(), UserRole.USER);
  const newRefreshToken = generateRefreshToken(user._id.toString(), UserRole.USER);
  user.refreshTokens.push(hashToken(newRefreshToken));
  await user.save({ validateBeforeSave: false });

  res.cookie("accessToken", newAccessToken, accessTokenCookieOptions());
  res.cookie("refreshToken", newRefreshToken, refreshTokenCookieOptions());

  sendSuccess(res, "Token refreshed.", { accessToken: newAccessToken });
};

// ─── Logout ───────────────────────────────────────────────────────────────────

export const logout = async (req: Request, res: Response): Promise<void> => {
  const token: string | undefined = req.cookies?.refreshToken;

  if (token && req.user) {
    // Remove this specific refresh token
    const user = await User.findById(req.user.id).select("+refreshTokens");
    if (user) {
      user.refreshTokens = user.refreshTokens.filter((t) => t !== hashToken(token));
      await user.save({ validateBeforeSave: false });
    }
  }

  res.clearCookie("accessToken", clearCookieOptions());
  res.clearCookie("refreshToken", { ...clearCookieOptions(), path: "/api/auth" });

  sendSuccess(res, "Logged out successfully.");
};

// ─── Logout All Devices ───────────────────────────────────────────────────────

export const logoutAll = async (req: Request, res: Response): Promise<void> => {
  if (req.user) {
    const user = await User.findById(req.user.id).select("+refreshTokens");
    if (user) {
      user.refreshTokens = [];
      await user.save({ validateBeforeSave: false });
    }
  }

  res.clearCookie("accessToken", clearCookieOptions());
  res.clearCookie("refreshToken", { ...clearCookieOptions(), path: "/api/auth" });

  sendSuccess(res, "Logged out from all devices.");
};

// ─── Forgot Password ──────────────────────────────────────────────────────────

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body as { email: string };

  const user = await User.findOne({ email });

  // Always respond the same way to prevent email enumeration
  const message = "If an account with that email exists, a password reset link has been sent.";

  if (!user) {
    sendSuccess(res, message);
    return;
  }

  const rawToken = generateSecureToken();
  const hashedToken = hashToken(rawToken);

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${rawToken}`;
  try {
    await sendPasswordResetEmail(email, user.name, resetUrl);
  } catch (err) {
    // Rollback token if email fails
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    sendError(res, "Failed to send password reset email. Please try again later.", 500);
    return;
  }

  sendSuccess(res, message);
};

// ─── Reset Password ───────────────────────────────────────────────────────────

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token, password } = req.body as { token: string; password: string };

  const hashedToken = hashToken(token);
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  }).select("+password +passwordResetToken +passwordResetExpires +refreshTokens");

  if (!user) {
    sendError(res, "Invalid or expired password reset token.", 400);
    return;
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  // Invalidate all existing sessions after password change
  user.refreshTokens = [];
  await user.save();

  sendSuccess(res, "Password reset successful. Please log in with your new password.");
};

// ─── Change Password (authenticated) ─────────────────────────────────────────

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body as {
    currentPassword: string;
    newPassword: string;
  };

  const user = await User.findById(req.user!.id).select("+password +refreshTokens");
  if (!user) {
    sendError(res, "User not found.", 404);
    return;
  }

  if (!(await user.comparePassword(currentPassword))) {
    sendError(res, "Current password is incorrect.", 401);
    return;
  }

  user.password = newPassword;
  // Invalidate all sessions on password change
  user.refreshTokens = [];
  await user.save();

  res.clearCookie("accessToken", clearCookieOptions());
  res.clearCookie("refreshToken", { ...clearCookieOptions(), path: "/api/auth" });

  sendSuccess(res, "Password changed successfully. Please log in again.");
};

// ─── Get Current User ─────────────────────────────────────────────────────────

export const getMe = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findById(req.user!.id);
  if (!user) {
    sendError(res, "User not found.", 404);
    return;
  }
  sendSuccess(res, "User profile fetched.", user.toSafeObject());
};

// ─── Update Profile ───────────────────────────────────────────────────────────

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const { name, phone } = req.body as { name?: string; phone?: string };

  const user = await User.findById(req.user!.id);
  if (!user) {
    sendError(res, "User not found.", 404);
    return;
  }

  if (name) user.name = name;
  if (phone) user.phone = phone;
  await user.save({ validateBeforeSave: false });

  sendSuccess(res, "Profile updated.", user.toSafeObject());
};
