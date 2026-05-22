import { body, validationResult, ValidationChain } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response.js";

// ─── Collect Validation Errors ────────────────────────────────────────────────

export const validate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({
      field: e.type === "field" ? e.path : "unknown",
      message: e.msg as string,
    }));
    sendError(res, "Validation failed", 422, formatted);
    return;
  }
  next();
};

// ─── Reusable Field Rules ─────────────────────────────────────────────────────

const nameRule = (): ValidationChain =>
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2, max: 50 }).withMessage("Name must be 2–50 characters");

const emailRule = (): ValidationChain =>
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please enter a valid email")
    .normalizeEmail();

const phoneRule = (): ValidationChain =>
  body("phone")
    .trim()
    .notEmpty().withMessage("Phone number is required")
    .matches(/^[+\d\s\-()]{7,20}$/).withMessage("Please enter a valid phone number");

const passwordRule = (field = "password"): ValidationChain =>
  body(field)
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
    .matches(/\d/).withMessage("Password must contain at least one number")
    .matches(/[@$!%*?&#]/).withMessage("Password must contain at least one special character (@$!%*?&#)");

// ─── Validator Sets ───────────────────────────────────────────────────────────

export const registerValidation: ValidationChain[] = [
  nameRule(),
  emailRule(),
  phoneRule(),
  passwordRule(),
  body("confirmPassword")
    .notEmpty().withMessage("Please confirm your password")
    .custom((value, { req }) => {
      if (value !== req.body.password) throw new Error("Passwords do not match");
      return true;
    }),
];

export const loginValidation: ValidationChain[] = [
  emailRule(),
  body("password").notEmpty().withMessage("Password is required"),
];

export const forgotPasswordValidation: ValidationChain[] = [emailRule()];

export const resetPasswordValidation: ValidationChain[] = [
  body("token").notEmpty().withMessage("Reset token is required"),
  passwordRule("password"),
  body("confirmPassword")
    .notEmpty().withMessage("Please confirm your password")
    .custom((value, { req }) => {
      if (value !== req.body.password) throw new Error("Passwords do not match");
      return true;
    }),
];

export const changePasswordValidation: ValidationChain[] = [
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  passwordRule("newPassword"),
  body("confirmNewPassword")
    .notEmpty().withMessage("Please confirm your new password")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) throw new Error("New passwords do not match");
      return true;
    }),
];

export const updateProfileValidation: ValidationChain[] = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage("Name must be 2–50 characters"),
  body("phone")
    .optional()
    .trim()
    .matches(/^[+\d\s\-()]{7,20}$/).withMessage("Please enter a valid phone number"),
];
