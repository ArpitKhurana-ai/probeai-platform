console.log("🚀 Starting ProbeAI backend server...");
console.log("Environment:", process.env.NODE_ENV || "development");
console.log("Platform:", process.platform);
console.log("Node version:", process.version);

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { initializeBrevo } from "./brevo";

const app = express();

/**
 * 🔐 SUPER SIMPLE CORS — works for Vercel previews, production, and localhost
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://probeai-platform.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4173'
  ];
  const isAllowed = origin &&
    (origin.includes('localhost') ||
     origin === 'https://probeai-platform.vercel.app' ||
     /^https:\/\/probeai-platform(-[\w\d]+)?\.vercel\.app$/.test(origin));

  if (isAllowed && origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    console.log(`✅ CORS allowed: ${origin}`);
  } else {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    console.log(`⚠️ CORS fallback used: ${origin}`);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
});

// 🔥 Error handler that still sets CORS headers
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("🚨 ERROR:", err.message);
  if (!res.headersSent) {
    const origin = req.headers.origin;
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
  }
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
console.log("📦 Express configured");

// ✅ CORS test route
app.get("/cors-check", (req, res) => {
  res.json({
    message: "✅ CORS working!",
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

app.use((req, res, next) => {
  const start = Date.now();
  console.log(`➡️ ${req.method} ${req.url}`);
  res.on("finish", () => {
    const ms = Date.now() - start;
    console.log(`⬅️ ${req.method} ${req.url} ${res.statusCode} in ${ms}ms`);
  });
  next();
});

process.on("uncaughtException", (err) => {
  console.error("💥 UNCAUGHT EXCEPTION:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("💥 UNHANDLED REJECTION:", reason);
  process.exit(1);
});

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

    console.log("🔗 Registering routes...");
    await registerRoutes(app);

    console.log("🔍 Initializing Algolia...");
    const { initializeAlgolia } = await import('./initialize-algolia.js');
    await initializeAlgolia();

    console.log("📧 Initializing Brevo...");
    await initializeBrevo();

    app.all("*", (req, res) => {
      res.status(404).json({
        error: "Route not found",
        method: req.method,
        path: req.url,
        availableRoutes: ['/cors-check', '/health', '/api/*'],
        timestamp: new Date().toISOString()
      });
    });

    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
    const server = app.listen(port, "0.0.0.0", () => {
      console.log(`✅ Server running on http://0.0.0.0:${port}`);
    });

    const shutdown = () => {
      console.log('🛑 Shutting down...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (err: any) {
    console.error("💥 Startup failed:", err.message);
    process.exit(1);
  }
})();
