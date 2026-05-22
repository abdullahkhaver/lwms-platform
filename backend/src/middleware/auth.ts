import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/token.js";
import { sendError } from "../utils/response.js";
import { UserRole } from "../types/index.js";
import User from "../models/User.js";
import Admin from "../models/Admin.js";

// ─── Protect: Verify Access Token ─────────────────────────────────────────────

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Extract token from Authorization header or cookie
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken as string;
    }

    if (!token) {
      sendError(res, "Authentication required. Please log in.", 401);
      return;
    }

    // 2. Verify token
    const decoded = verifyAccessToken(token);

    // 3. Check that the account still exists and is active
    if (decoded.role === UserRole.ADMIN) {
      const admin = await Admin.findById(decoded.id).select("isActive");
      if (!admin || !admin.isActive) {
        sendError(res, "Account not found or deactivated.", 401);
        return;
      }
    } else {
      const user = await User.findById(decoded.id).select("isActive");
      if (!user || !user.isActive) {
        sendError(res, "Account not found or deactivated.", 401);
        return;
      }
    }

    // 4. Attach to request
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.name === "TokenExpiredError") {
        sendError(res, "Session expired. Please log in again.", 401);
        return;
      }
      if (err.name === "JsonWebTokenError") {
        sendError(res, "Invalid token.", 401);
        return;
      }
    }
    sendError(res, "Authentication failed.", 401);
  }
};

// ─── Restrict: Role-Based Access ──────────────────────────────────────────────

export const restrictTo = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      sendError(
        res,
        "You do not have permission to perform this action.",
        403
      );
      return;
    }
    next();
  };
};

// ─── Admin Only Shorthand ─────────────────────────────────────────────────────

export const adminOnly = restrictTo(UserRole.ADMIN);

// ─── User Only Shorthand ──────────────────────────────────────────────────────

export const userOnly = restrictTo(UserRole.USER);

// ─── Optional Auth (attach user if token present, don't block if absent) ──────

export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken as string;
    }

    if (token) {
      const decoded = verifyAccessToken(token);
      req.user = { id: decoded.id, role: decoded.role };
    }
  } catch {
    // Silently ignore invalid/expired tokens for optional auth
  }
  next();
};
