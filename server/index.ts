import express, { type Request, type Response, type NextFunction } from "express";
import { registerRoutes } from "./routes";
import { initializeBrevo } from "./brevo";

console.log("🚀 Starting ProbeAI backend server...");
console.log("Environment:", process.env.NODE_ENV || "development");
console.log("Platform:", process.platform);
console.log("Node version:", process.version);

const app = express();

// ✅ SIMPLE CORS (placed first)
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  console.log(`🔗 CORS - ${req.method} ${req.url} - Origin: ${origin}`);

  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    console.log(`🎯 OPTIONS preflight`);
    return res.status(204).end();
  }

  next();
});

// ✅ ERROR HANDLER
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("🚨 ERROR:", {
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

// ✅ CORS CHECK & HEALTH ROUTES
app.get("/cors-check", (req, res) => {
  res.json({
    message: "✅ CORS working",
    origin: req.headers.origin,
    timestamp: new Date().toISOString(),
    headers: req.headers
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    origin: req.headers.origin
  });
});

// 🔍 Request logger
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`➡️ ${req.method} ${req.url} - Origin: ${req.headers.origin}`);

  res.on("finish", () => {
    const ms = Date.now() - start;
    console.log(`⬅️ ${req.method} ${req.url} ${res.statusCode} in ${ms}ms`);
  });

  next();
});

// 🔧 Handle process crashes
process.on("uncaughtException", err => {
  console.error("💥 UNCAUGHT EXCEPTION:", err);
  process.exit(1);
});
process.on("unhandledRejection", reason => {
  console.error("💥 UNHANDLED REJECTION:", reason);
  process.exit(1);
});

// 🚀 Start everything
(async () => {
  try {
    console.log("🔧 Initializing...");

    console.table({
      NODE_ENV: process.env.NODE_ENV || 'development',
      DATABASE_URL: process.env.DATABASE_URL ? "✅ Set" : "❌ Missing",
      SESSION_SECRET: process.env.SESSION_SECRET ? "✅ Set" : "❌ Missing",
      ALGOLIA_API_KEY: process.env.ALGOLIA_API_KEY ? "✅ Set" : "⚠️ Missing",
      BREVO_API_KEY: process.env.BREVO_API_KEY ? "✅ Set" : "⚠️ Missing"
    });

    try {
      console.log("🔗 Registering routes...");
      await registerRoutes(app);
      console.log("✅ Routes registered");
    } catch (err: any) {
      console.error("❌ Route registration failed:", err.message);
    }

    try {
      console.log("📧 Initializing Brevo...");
      await initializeBrevo();
      console.log("✅ Brevo ready");
    } catch (err: any) {
      console.warn("⚠️ Brevo failed:", err.message);
    }

    // Catch-all
    app.all("*", (req, res) => {
      res.status(404).json({
        error: "Route not found",
        method: req.method,
        path: req.url,
        availableRoutes: ["/cors-check", "/health", "/api/*"],
        timestamp: new Date().toISOString()
      });
    });

    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
    const server = app.listen(port, "0.0.0.0", () => {
      console.log(`✅ Server live at http://0.0.0.0:${port}`);
      console.log(`🌐 Railway: https://probeai-platform-production.up.railway.app`);
    });

    const shutdown = () => {
      console.log("🛑 Shutting down...");
      server.close(() => process.exit(0));
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (err: any) {
    console.error("💥 Startup error:", err.message);
    process.exit(1);
  }
})();
