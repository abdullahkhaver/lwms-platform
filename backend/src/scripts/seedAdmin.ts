/**
 * Run this once to seed the first admin account:
 *   npx tsx src/scripts/seedAdmin.ts
 */
import "dotenv/config";
import mongoose from "mongoose";
import Admin from "../models/Admin.js";
import { UserRole } from "../types/index.js";

const ALL_PERMISSIONS: string[] = [
  "view_complaints",
  "update_complaint_status",
  "delete_complaints",
  "view_reports",
  "manage_users",
  "manage_admins",
];

const seed = async (): Promise<void> => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI not set");

  await mongoose.connect(uri);
  console.log("Connected to MongoDB.");

  const email = "superadmin@lwms.com";
  const existing = await Admin.findOne({ email });

  if (existing) {
    console.log("⚠️  Super-admin already exists:", email);
    await mongoose.disconnect();
    return;
  }

  const admin = await Admin.create({
    name: "Super Admin",
    email,
    password: "Admin@LWMS2025!",  // ← change this immediately after first login
    role: UserRole.ADMIN,
    permissions: ALL_PERMISSIONS,
  });

  console.log("✅ Super-admin created:");
  console.log("   Email:   ", admin.email);
  console.log("   Password: Admin@LWMS2025!  ← CHANGE THIS NOW");
  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
