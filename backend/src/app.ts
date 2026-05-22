import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import { sendError } from "./utils/response.js";

const app: Application = express();

// ─── Security Middleware ──────────────────────────────────────────────────────

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL ?? "http://localhost:5173",
    credentials: true,           // allow cookies
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ─── Global Rate Limit ────────────────────────────────────────────────────────

app.use(
  rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? "900000"),
    max: parseInt(process.env.RATE_LIMIT_MAX ?? "100"),
    message: { success: false, message: "Too many requests. Please slow down." },
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// ─── Body Parsers ─────────────────────────────────────────────────────────────

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.json({ success: true, message: "LWMS Auth API is running", timestamp: new Date() });
});

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use("/api/auth", authRoutes);
app.use("/api/admin/auth", adminAuthRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────

app.use((_req: Request, res: Response) => {
  sendError(res, "Route not found.", 404);
});

// ─── Global Error Handler ─────────────────────────────────────────────────────

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);

  // Mongoose duplicate key
  if ("code" in err && (err as NodeJS.ErrnoException).code === "11000") {
    sendError(res, "A record with that value already exists.", 409);
    return;
  }

  // Mongoose validation
  if (err.name === "ValidationError") {
    sendError(res, err.message, 422);
    return;
  }

  // Default
  const statusCode = "status" in err ? (err as { status: number }).status : 500;
  const message =
    process.env.NODE_ENV === "production" ? "Something went wrong." : err.message;
  sendError(res, message, statusCode);
});

export default app;
