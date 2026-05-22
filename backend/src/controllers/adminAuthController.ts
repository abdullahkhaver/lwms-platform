import { Request, Response } from "express";
import Admin from "../models/Admin.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  clearCookieOptions,
} from "../utils/token.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { UserRole } from "../types/index.js";

// ─── Admin Login ──────────────────────────────────────────────────────────────

export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email: string; password: string };

  const admin = await Admin.findByEmail(email);

  if (!admin || !(await admin.comparePassword(password))) {
    sendError(res, "Invalid admin credentials.", 401);
    return;
  }

  if (!admin.isActive) {
    sendError(res, "Admin account has been deactivated.", 403);
    return;
  }

  const accessToken = generateAccessToken(admin._id.toString(), UserRole.ADMIN);
  const refreshToken = generateRefreshToken(admin._id.toString(), UserRole.ADMIN);

  const hashedRefresh = hashToken(refreshToken);
  admin.refreshTokens.push(hashedRefresh);
  if (admin.refreshTokens.length > 3) admin.refreshTokens.shift(); // admins: max 3 sessions
  admin.lastLoginAt = new Date();
  await admin.save({ validateBeforeSave: false });

  res.cookie("accessToken", accessToken, accessTokenCookieOptions());
  res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions());

  sendSuccess(res, "Admin logged in successfully.", {
    accessToken,
    admin: admin.toSafeObject(),
  });
};

// ─── Admin Refresh Token ──────────────────────────────────────────────────────

export const adminRefreshToken = async (req: Request, res: Response): Promise<void> => {
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

  if (payload.role !== UserRole.ADMIN) {
    sendError(res, "Invalid token type for admin.", 401);
    return;
  }

  const admin = await Admin.findById(payload.id).select("+refreshTokens");
  if (!admin || !admin.isActive) {
    sendError(res, "Admin not found.", 401);
    return;
  }

  const hashedIncoming = hashToken(token);
  if (!admin.refreshTokens.includes(hashedIncoming)) {
    admin.refreshTokens = [];
    await admin.save({ validateBeforeSave: false });
    sendError(res, "Refresh token reuse detected. All admin sessions invalidated.", 401);
    return;
  }

  admin.refreshTokens = admin.refreshTokens.filter((t) => t !== hashedIncoming);
  const newAccessToken = generateAccessToken(admin._id.toString(), UserRole.ADMIN);
  const newRefreshToken = generateRefreshToken(admin._id.toString(), UserRole.ADMIN);
  admin.refreshTokens.push(hashToken(newRefreshToken));
  await admin.save({ validateBeforeSave: false });

  res.cookie("accessToken", newAccessToken, accessTokenCookieOptions());
  res.cookie("refreshToken", newRefreshToken, refreshTokenCookieOptions());

  sendSuccess(res, "Token refreshed.", { accessToken: newAccessToken });
};

// ─── Admin Logout ─────────────────────────────────────────────────────────────

export const adminLogout = async (req: Request, res: Response): Promise<void> => {
  const token: string | undefined = req.cookies?.refreshToken;

  if (token && req.user) {
    const admin = await Admin.findById(req.user.id).select("+refreshTokens");
    if (admin) {
      admin.refreshTokens = admin.refreshTokens.filter((t) => t !== hashToken(token));
      await admin.save({ validateBeforeSave: false });
    }
  }

  res.clearCookie("accessToken", clearCookieOptions());
  res.clearCookie("refreshToken", { ...clearCookieOptions(), path: "/api/auth" });

  sendSuccess(res, "Admin logged out successfully.");
};

// ─── Get Admin Profile ────────────────────────────────────────────────────────

export const getAdminMe = async (req: Request, res: Response): Promise<void> => {
  const admin = await Admin.findById(req.user!.id);
  if (!admin) {
    sendError(res, "Admin not found.", 404);
    return;
  }
  sendSuccess(res, "Admin profile fetched.", admin.toSafeObject());
};

// ─── Create Admin (super-admin only — seed via script or protected route) ─────

export const createAdmin = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, permissions } = req.body as {
    name: string;
    email: string;
    password: string;
    permissions?: string[];
  };

  const existing = await Admin.findOne({ email });
  if (existing) {
    sendError(res, "An admin with this email already exists.", 409);
    return;
  }

  const admin = await Admin.create({ name, email, password, permissions });

  sendSuccess(
    res,
    "Admin account created.",
    admin.toSafeObject(),
    201
  );
};

// ─── List All Users (admin view) ──────────────────────────────────────────────

export const listUsers = async (req: Request, res: Response): Promise<void> => {
  const page = Math.max(1, parseInt((req.query.page as string) ?? "1"));
  const limit = Math.min(50, parseInt((req.query.limit as string) ?? "20"));
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    import("../models/User.js").then(({ default: User }) =>
      User.find().skip(skip).limit(limit).sort({ createdAt: -1 })
    ),
    import("../models/User.js").then(({ default: User }) => User.countDocuments()),
  ]);

  sendSuccess(res, "Users fetched.", users, 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
};

// ─── Toggle User Active Status ────────────────────────────────────────────────

export const toggleUserStatus = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;
  const User = (await import("../models/User.js")).default;

  const user = await User.findById(userId);
  if (!user) {
    sendError(res, "User not found.", 404);
    return;
  }

  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });

  sendSuccess(res, `User ${user.isActive ? "activated" : "deactivated"}.`, {
    id: user._id,
    isActive: user.isActive,
  });
};
