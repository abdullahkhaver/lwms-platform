import express from "express";
import {
  createComplaint,
  getAllComplaints,
  getUserComplaints,
  getComplaintById,
  getComplaintByTrackingId,
  updateComplaintStatus,
  deleteComplaint,
  getComplaintsByLocation,
  getDashboardStats,
  generateReport,
} from "../controllers/complaint.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

// ================= USER ROUTES =================
// Create a new complaint (protected)
router.post("/", protect, createComplaint);

// Get user's own complaints (protected)
router.get("/my-complaints", protect, getUserComplaints);

// Track complaint by tracking ID (public)
router.get("/track/:trackingId", getComplaintByTrackingId);

// ================= ADMIN ROUTES =================
// Get all complaints (admin only)
router.get("/admin/all", protect, adminOnly, getAllComplaints);

// Get complaints by location for map view (admin only)
router.get("/admin/map", protect, adminOnly, getComplaintsByLocation);

// Get dashboard statistics (admin only)
router.get("/admin/stats", protect, adminOnly, getDashboardStats);

// Generate report (admin only)
router.get("/admin/report", protect, adminOnly, generateReport);

// Get complaint by ID (admin only)
router.get("/admin/:id", protect, adminOnly, getComplaintById);

// Update complaint status (admin only)
router.put("/admin/:id/status", protect, adminOnly, updateComplaintStatus);

// Delete complaint (admin only)
router.delete("/admin/:id", protect, adminOnly, deleteComplaint);

export default router;
