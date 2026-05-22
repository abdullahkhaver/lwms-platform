import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  register,
  verifyEmail,
  login,
  refreshToken,
  logout,
  logoutAll,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
  updateProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import {
  validate,
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation,
  updateProfileValidation,
} from "../middleware/validate.js";

const router = Router();

// ─── Rate Limiters ────────────────────────────────────────────────────────────

/** Strict limiter for auth actions (register, login, forgot-password) */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX ?? "10"),
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Public Routes ────────────────────────────────────────────────────────────

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 * @body    { name, email, phone, password, confirmPassword }
 */
router.post("/register", authLimiter, registerValidation, validate, register);

/**
 * @route   GET /api/auth/verify-email
 * @desc    Verify user email with token
 * @access  Public
 * @query   token
 */
router.get("/verify-email", verifyEmail);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return tokens
 * @access  Public
 * @body    { email, password }
 */
router.post("/login", authLimiter, loginValidation, validate, login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token (cookie or body)
 * @access  Public
 */
router.post("/refresh", refreshToken);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 * @body    { email }
 */
router.post("/forgot-password", authLimiter, forgotPasswordValidation, validate, forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token from email
 * @access  Public
 * @body    { token, password, confirmPassword }
 */
router.post("/reset-password", resetPasswordValidation, validate, resetPassword);

// ─── Protected Routes (require valid access token) ────────────────────────────

/**
 * @route   GET /api/auth/me
 * @desc    Get current user's profile
 * @access  Private
 */
router.get("/me", protect, getMe);

/**
 * @route   PATCH /api/auth/me
 * @desc    Update current user's name/phone
 * @access  Private
 * @body    { name?, phone? }
 */
router.patch("/me", protect, updateProfileValidation, validate, updateProfile);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change password (must know current password)
 * @access  Private
 * @body    { currentPassword, newPassword, confirmNewPassword }
 */
router.post("/change-password", protect, changePasswordValidation, validate, changePassword);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout from current device
 * @access  Private
 */
router.post("/logout", protect, logout);

/**
 * @route   POST /api/auth/logout-all
 * @desc    Logout from all devices
 * @access  Private
 */
router.post("/logout-all", protect, logoutAll);

export default router;
