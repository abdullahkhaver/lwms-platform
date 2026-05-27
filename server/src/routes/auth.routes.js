import express from "express";

import {
  registerUser,
  loginUser,
  getMe,
  updateMe,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
} from "../controllers/user.controller.js";

import {
  protect,
  adminOnly,
} from "../middleware/auth.middleware.js";

const router = express.Router();


// ================= AUTH =================
router.post("/register", registerUser);
router.post("/login", loginUser);


// ================= USER =================
router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);


// ================= ADMIN ONLY =================
router.get("/users", protect, adminOnly, getAllUsers);
router.get("/users/:id", protect, adminOnly, getUserById);
router.put("/users/:id/role", protect, adminOnly, updateUserRole);
router.delete("/users/:id", protect, adminOnly, deleteUser);

export default router;