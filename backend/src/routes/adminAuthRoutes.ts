import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  adminLogin,
  adminRefreshToken,
  adminLogout,
  getAdminMe,
  createAdmin,
  listUsers,
  toggleUserStatus,
} from "../controllers/adminAuthController.js";
import { protect, adminOnly } from "../middleware/auth.js";
import { validate, loginValidation } from "../middleware/validate.js";
import { body } from "express-validator";

const router = Router();

// ─── Rate Limiter (extra strict for admin) ────────────────────────────────────

const adminAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // only 5 attempts per 15 min
  message: {
    success: false,
    message: "Too many admin login attempts. Please try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Public Admin Routes ──────────────────────────────────────────────────────

/**
 * @route   POST /api/admin/auth/login
 * @desc    Admin login
 * @access  Public
 * @body    { email, password }
 */
router.post("/login", adminAuthLimiter, loginValidation, validate, adminLogin);

/**
 * @route   POST /api/admin/auth/refresh
 * @desc    Refresh admin access token
 * @access  Public
 */
router.post("/refresh", adminRefreshToken);

// ─── Protected Admin Routes ───────────────────────────────────────────────────

/**
 * @route   GET /api/admin/auth/me
 * @desc    Get current admin profile
 * @access  Private (admin)
 */
router.get("/me", protect, adminOnly, getAdminMe);

/**
 * @route   POST /api/admin/auth/logout
 * @desc    Logout admin from current device
 * @access  Private (admin)
 */
router.post("/logout", protect, adminOnly, adminLogout);

/**
 * @route   POST /api/admin/auth/create
 * @desc    Create a new admin account
 * @access  Private (admin only — use for onboarding new admins)
 * @body    { name, email, password, permissions? }
 */
router.post(
  "/create",
  protect,
  adminOnly,
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").trim().isEmail().withMessage("Valid email required").normalizeEmail(),
    body("password")
      .isLength({ min: 10 })
      .withMessage("Admin password must be at least 10 characters"),
  ],
  validate,
  createAdmin
);

/**
 * @route   GET /api/admin/auth/users
 * @desc    List all registered users (paginated)
 * @access  Private (admin)
 * @query   page, limit
 */
router.get("/users", protect, adminOnly, listUsers);

/**
 * @route   PATCH /api/admin/auth/users/:userId/toggle-status
 * @desc    Activate or deactivate a user account
 * @access  Private (admin)
 */
router.patch("/users/:userId/toggle-status", protect, adminOnly, toggleUserStatus);

export default router;
