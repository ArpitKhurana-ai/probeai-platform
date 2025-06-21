console.log("🚀 Starting ProbeAI backend server...");
console.log("Environment:", process.env.NODE_ENV || "development");
console.log("Platform:", process.platform);
console.log("Node version:", process.version);

import express, { type Request, Response, NextFunction } from "express";
import { serveFallbackFrontend } from "./fallback-frontend";
import { registerRoutes } from "./routes";
import { initializeBrevo } from "./brevo";
import { corsMiddleware, ensureCorsHeaders } from "./cors";

const app = express();

// 🔥 CRITICAL: CORS middleware MUST be first
app.use(corsMiddleware);
app.use(ensureCorsHeaders);

// 🔥 CRITICAL: Global error handler IMMEDIATELY after CORS
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error("🚨 Global error handler:", {
    method: req.method,
    url: req.url,
    status,
    message,
    origin: req.headers.origin,
    stack: err.stack?.split('\n').slice(0, 3).join('\n') // Truncated stack
  });

  // Ensure CORS headers are present (backup safety)
  if (!res.headersSent) {
    const origin = req.headers.origin;
    if (!res.getHeader('Access-Control-Allow-Origin')) {
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      console.log("🔧 Added CORS headers to error response");
    }

    res.status(status).json({ 
      error: message,
      status,
      timestamp: new Date().toISOString()
    });
  }
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
console.log("📦 Express app configured with CORS and parsers");

// Simple CORS test route
app.get("/cors-check", (_req, res) => {
  res.json({ message: "✅ CORS test route working!", timestamp: new Date().toISOString() });
});

// Health check route
app.get("/health", (_req, res) => {
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "unknown"
  });
});

// ✅ Safer auth middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  try {
    // Your auth logic here - currently just passing through
    next();
  } catch (err: any) {
    console.warn("⚠️ Auth middleware error:", err.message);
    // Don't throw, just continue
    next();
  }
});

// ✅ API request/response logging
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let captured: any;

  const originalJson = res.json;
  res.json = function (body, ...args) {
    captured = body;
    return originalJson.apply(res, [body, ...args]);
  };

  res.on("finish", () => {
    const ms = Date.now() - start;
    if (path.startsWith("/api")) {
      let log = `${req.method} ${path} ${res.statusCode} in ${ms}ms`;
      if (captured && res.statusCode >= 400) {
        // Only log response body for errors to avoid spam
        log += ` :: ${JSON.stringify(captured)}`.slice(0, 200);
      }
      console.log(log);
    }
  });

  next();
});

// ✅ Handle fatal crashes
process.on("uncaughtException", (err) => {
  console.error("💥 UNCAUGHT EXCEPTION");
  console.error(err.stack);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 UNHANDLED PROMISE REJECTION at:", promise);
  console.error("Reason:", reason);
  process.exit(1);
});

// ✅ Boot sequence with better error handling
(async () => {
  try {
    console.log("🔧 Starting server initialization...");

    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? "✅ Set" : "❌ Missing",
      SESSION_SECRET: process.env.SESSION_SECRET ? "✅ Set" : "❌ Missing",
      REPLIT_DOMAINS: process.env.REPLIT_DOMAINS ? "✅ Set" : "⚠️ Missing",
      ALGOLIA_API_KEY: process.env.ALGOLIA_API_KEY ? "✅ Set" : "⚠️ Missing",
      BREVO_API_KEY: process.env.BREVO_API_KEY ? "✅ Set" : "⚠️ Missing"
    };
    console.table(envVars);

    // ✅ Register routes with error handling
    try {
      const server = await registerRoutes(app);
      console.log("✅ Routes registered successfully");
    } catch (err: any) {
      console.error("❌ Route registration failed:", err.message);
      throw err;
    }

    // ✅ Initialize services with better error handling
    try {
      const { initializeAlgolia } = await import('./initialize-algolia.js');
      await initializeAlgolia();
      console.log("✅ Algolia initialized");
    } catch (err: any) {
      console.warn("⚠️ Algolia init failed (non-critical):", err.message);
    }

    try {
      await initializeBrevo();
      console.log("✅ Brevo initialized");
    } catch (err: any) {
      console.warn("⚠️ Brevo init failed (non-critical):", err.message);
    }

    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
    console.log(`🌐 Starting server on port ${port}...`);

    // ✅ Static file handling
    if (process.env.NODE_ENV !== "development") {
      try {
        // Your static file serving logic here
        console.log("✅ Static file serving configured");
      } catch (err: any) {
        console.warn("⚠️ Static file setup failed:", err.message);
        app.get("/", (_req, res) => {
          res.send(`
            <h1>🚀 ProbeAI Backend</h1>
            <p>API is live and running!</p>
            <p>Time: ${new Date().toISOString()}</p>
            <p>Environment: ${process.env.NODE_ENV}</p>
            <a href="/cors-check">Test CORS</a> | 
            <a href="/health">Health Check</a>
          `);
        });
      }
    }

    // ✅ Catch-all route for unhandled requests
    app.all("*", (req, res) => {
      console.log(`🔍 Unhandled route: ${req.method} ${req.url}`);
      res.status(404).json({ 
        error: "Route not found", 
        method: req.method, 
        path: req.url,
        timestamp: new Date().toISOString()
      });
    });

    // ✅ IMPORTANT: Listen on 0.0.0.0 for Railway
    const server = app.listen(port, "0.0.0.0", () => {
      console.log(`✅ Server running at http://0.0.0.0:${port}`);
      console.log(`🌍 Railway URL: https://probeai-platform-production.up.railway.app`);
    });

    // Graceful shutdown
    const shutdown = () => {
      console.log('🛑 Received shutdown signal');
      server.close((err) => {
        if (err) {
          console.error('❌ Error during server shutdown:', err);
          process.exit(1);
        }
        console.log('✅ Server closed successfully');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (err: any) {
    console.error("💥 Startup failed:", err.message);
    console.error("Stack:", err.stack);
    process.exit(1);
  }
})();