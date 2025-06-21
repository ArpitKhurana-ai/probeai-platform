console.log("🚀 Starting ProbeAI backend server...");
console.log("Environment:", process.env.NODE_ENV || "development");
console.log("Platform:", process.platform);
console.log("Node version:", process.version);

import express, { type Request, type Response, type NextFunction } from "express";
import { registerRoutes } from "./routes";
import { initializeBrevo } from "./brevo";

const app = express();

// 🔥 SIMPLE CORS
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// 🔥 EXPRESS BODY PARSERS
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
console.log("📦 Express app configured");

// 🧪 Request Logging
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`➡️ ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  res.on("finish", () => {
    const ms = Date.now() - start;
    console.log(`⬅️ ${req.method} ${req.url} ${res.statusCode} in ${ms}ms`);
  });
  next();
});

// 🔥 ERROR HANDLER
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("🚨 ERROR HANDLER:", {
    method: req.method,
    url: req.url,
    error: err.message,
    origin: req.headers.origin
  });

  if (!res.headersSent) {
    const origin = req.headers.origin;
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    res.status(err.status || 500).json({
      error: err.message || "Internal Server Error",
      timestamp: new Date().toISOString()
    });
  }
});

// 💥 CRASH GUARDS
process.on("uncaughtException", (err) => {
  console.error("💥 UNCAUGHT EXCEPTION:", err);
  process.exit(1);
});
process.on("unhandledRejection", (reason) => {
  console.error("💥 UNHANDLED REJECTION:", reason);
  process.exit(1);
});

// ✅ BOOTSTRAP
(async () => {
  try {
    console.log("🔧 Starting initialization...");

    const envCheck = {
      NODE_ENV: process.env.NODE_ENV || 'development',
      DATABASE_URL: process.env.DATABASE_URL ? "✅ Set" : "❌ Missing",
      SESSION_SECRET: process.env.SESSION_SECRET ? "✅ Set" : "❌ Missing",
      ALGOLIA_API_KEY: process.env.ALGOLIA_API_KEY ? "✅ Set" : "⚠️ Missing",
      BREVO_API_KEY: process.env.BREVO_API_KEY ? "✅ Set" : "⚠️ Missing"
    };
    console.table(envCheck);

    // ✅ Register app routes
    await registerRoutes(app);
    console.log("✅ Routes registered successfully");

    // ✅ Brevo Init
    try {
      await initializeBrevo();
      console.log("✅ Brevo initialized");
    } catch (err: any) {
      console.warn("⚠️ Brevo init failed:", err.message);
    }

    // ✅ Move these below route setup
    app.get("/cors-check", (req, res) => {
      console.log("📍 /cors-check hit");
      res.json({
        status: "ok",
        origin: req.headers.origin,
        timestamp: new Date().toISOString(),
      });
    });

    app.get("/health", (req, res) => {
      console.log("📍 /health hit");
      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        origin: req.headers.origin,
      });
    });

    // 🔍 Fallback handler
    app.all("*", (req, res) => {
      console.log(`🔍 Unhandled route: ${req.method} ${req.url}`);
      res.status(404).json({
        error: "Route not found",
        method: req.method,
        path: req.url,
        timestamp: new Date().toISOString(),
        availableRoutes: ["/cors-check", "/health", "/api/*"],
      });
    });

    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
    const server = app.listen(port, "0.0.0.0", () => {
      console.log(`✅ Server running at http://0.0.0.0:${port}`);
      console.log(`🌍 Railway URL: https://probeai-platform-production.up.railway.app`);
    });

    const shutdown = () => {
      console.log("🛑 Shutting down...");
      server.close(() => {
        console.log("✅ Server closed");
        process.exit(0);
      });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);

  } catch (err: any) {
    console.error("💥 Startup failed:", err.message);
    process.exit(1);
  }
})();
