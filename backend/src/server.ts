import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = parseInt(process.env.PORT ?? "5000");

const start = async (): Promise<void> => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`🚀 LWMS Auth Server running on port ${PORT} [${process.env.NODE_ENV ?? "development"}]`);
    console.log(`📡 Health: http://localhost:${PORT}/health`);
    console.log(`🔑 User Auth: http://localhost:${PORT}/api/auth`);
    console.log(`🛡️  Admin Auth: http://localhost:${PORT}/api/admin/auth`);
  });

  // ─── Graceful Shutdown ────────────────────────────────────────────────────
  const shutdown = async (signal: string): Promise<void> => {
    console.log(`\n⚠️  ${signal} received — shutting down gracefully...`);
    server.close(async () => {
      const mongoose = await import("mongoose");
      await mongoose.default.disconnect();
      console.log("✅ MongoDB connection closed. Server stopped.");
      process.exit(0);
    });

    // Force-exit if graceful shutdown takes too long
    setTimeout(() => {
      console.error("❌ Graceful shutdown timed out. Forcing exit.");
      process.exit(1);
    }, 10_000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  process.on("unhandledRejection", (reason) => {
    console.error("Unhandled promise rejection:", reason);
  });

  process.on("uncaughtException", (err) => {
    console.error("Uncaught exception:", err);
    process.exit(1);
  });
};

start();
