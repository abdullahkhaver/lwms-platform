import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";
import { UserRole } from "../types/index.js";

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IAdmin extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole.ADMIN;
  isActive: boolean;
  permissions: AdminPermission[];
  refreshTokens: string[];
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidate: string): Promise<boolean>;
  toSafeObject(): Omit<IAdmin, "password" | "refreshTokens">;
}

export interface IAdminModel extends Model<IAdmin> {
  findByEmail(email: string): Promise<IAdmin | null>;
}

export type AdminPermission =
  | "view_complaints"
  | "update_complaint_status"
  | "delete_complaints"
  | "view_reports"
  | "manage_users"
  | "manage_admins";

// ─── Schema ───────────────────────────────────────────────────────────────────

const adminSchema = new Schema<IAdmin, IAdminModel>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [10, "Admin password must be at least 10 characters"],
      select: false,
    },
    role: {
      type: String,
      default: UserRole.ADMIN,
      immutable: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    permissions: {
      type: [String],
      enum: [
        "view_complaints",
        "update_complaint_status",
        "delete_complaints",
        "view_reports",
        "manage_users",
        "manage_admins",
      ] satisfies AdminPermission[],
      default: [
        "view_complaints",
        "update_complaint_status",
        "view_reports",
      ],
    },
    refreshTokens: {
      type: [String],
      default: [],
      select: false,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "admins",   // explicit collection name, separate from users
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

adminSchema.index({ email: 1 });

// ─── Pre-save: Hash password ──────────────────────────────────────────────────

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(14);   // stronger salt for admins
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Instance Methods ─────────────────────────────────────────────────────────

adminSchema.methods.comparePassword = async function (
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

adminSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshTokens;
  return obj;
};

// ─── Static Methods ───────────────────────────────────────────────────────────

adminSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase() }).select("+password +refreshTokens");
};

// ─── Model ────────────────────────────────────────────────────────────────────

const Admin = mongoose.model<IAdmin, IAdminModel>("Admin", adminSchema);
export default Admin;
