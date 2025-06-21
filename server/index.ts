import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { initializeBrevo } from "./brevo";

console.log("🚀 Starting ProbeAI backend server...");
console.log("Environment:", process.env.NODE_ENV || "development");
console.log("Platform:", process.platform);
console.log("Node version:", process.version);

const app = express();

// 🔥 SIMPLE UNIVERSAL CORS MIDDLEWARE
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
});

// 🔥 ERROR HANDLER — ENSURE CORS ON ERRORS
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

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
console.log("📦 Express configured");

// ✅ MOVE THESE BEFORE registerRoutes
app.get("/cors-check", (req, res) => {
  console.log("📍 /cors-check called");
  res.json({
    message: "✅ CORS test route works",
    origin: req.headers.origin,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
});

app.get("/health", (req, res) => {
  console.log("📍 /health check called");
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString()
  });
});

// Logging
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`➡️ ${req.method} ${req.url} - Origin: ${req.headers.origin}`);

  res.on("finish", () => {
    const ms = Date.now() - start;
    console.log(`⬅️ ${req.method} ${req.url} ${res.statusCode} in ${ms}ms`);
  });

  next();
});

// Boot
(async () => {
  try {
    console.log("🔧 Starting initialization...");

    const envCheck = {
      NODE_ENV: process.env.NODE_ENV || "development",
      DATABASE_URL: process.env.DATABASE_URL ? "✅ Set" : "❌ Missing",
      SESSION_SECRET: process.env.SESSION_SECRET ? "✅ Set" : "❌ Missing",
      ALGOLIA_API_KEY: process.env.ALGOLIA_API_KEY ? "✅ Set" : "⚠️ Missing",
      BREVO_API_KEY: process.env.BREVO_API_KEY ? "✅ Set" : "⚠️ Missing"
    };
    console.table(envCheck);

    // Routes
    await registerRoutes(app);
    console.log("✅ Routes registered");

    // Algolia
    try {
      console.log("🔍 Initializing Algolia...");
      const { initializeAlgolia } = await import("./initialize-algolia.js");
      await initializeAlgolia();
      console.log("✅ Algolia initialized");
    } catch (err: any) {
      console.warn("⚠️ Algolia init failed:", err.message);
    }

    // Brevo
    try {
      console.log("📧 Initializing Brevo...");
      await initializeBrevo();
      console.log("✅ Brevo initialized");
    } catch (err: any) {
      console.warn("⚠️ Brevo init failed:", err.message);
    }

    // Start server
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
    const server = app.listen(port, "0.0.0.0", () => {
      console.log(`✅ Server running on http://0.0.0.0:${port}`);
      console.log(`🌐 Deployed at: https://probeai-platform-production.up.railway.app`);
    });

    // Shutdown
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
    console.error("Stack:", err.stack);
    process.exit(1);
  }
})();
