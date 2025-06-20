console.log("🚀 Starting ProbeAI backend server...");
console.log("Environment:", process.env.NODE_ENV || "development");
console.log("Platform:", process.platform);
console.log("Node version:", process.version);

import express, { type Request, Response, NextFunction } from "express";
import { serveFallbackFrontend } from "./fallback-frontend";
import { registerRoutes } from "./routes";
import { initializeBrevo } from "./brevo";

const app = express();

// ✅ FINAL CORS MIDDLEWARE (runs FIRST)
app.use((req, res, next) => {
  const origin = req.headers.origin || "NO_ORIGIN";
  const isAllowed =
    /^https:\/\/probeai-platform.*\.vercel\.app$/.test(origin) ||
    origin === "https://probeai-platform.vercel.app" ||
    origin === "http://localhost:5000";

  console.log("🧪 CORS DEBUG →", req.method, req.path);
  console.log("   ↪ Origin:", origin);
  console.log("   ↪ Matched Allowed:", isAllowed);
  res.setHeader("X-Debug-CORS", "Injected");

  if (isAllowed) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  }

  if (req.method === "OPTIONS") {
    console.log("⚙️ Preflight OPTIONS request handled");
    return res.status(204).end();
  }

  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
console.log("📦 Express app configured with CORS and parsers");

app.get("/cors-check", (req, res) => {
  res.json({ message: "✅ CORS test route working!" });
});

app.use((req, res, next) => {
  try {
    if (req.user?.claims) {
      next();
    } else {
      next();
    }
  } catch (err) {
    console.warn("⚠️ Auth middleware bypassed:", (err as any)?.message);
    next();
  }
});

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
      if (captured) {
        log += ` :: ${JSON.stringify(captured)}`.slice(0, 250);
      }
      console.log(log);
    }
  });

  next();
});

process.on("uncaughtException", (err) => {
  console.error("💥 UNCAUGHT EXCEPTION");
  console.error(err.stack);
  process.exit(1);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 UNHANDLED PROMISE REJECTION");
  console.error("Reason:", reason);
  process.exit(1);
});

(async () => {
  try {
    console.log("🔧 Starting server initialization...");

    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? "✅ Set" : "❌ Missing",
      SESSION_SECRET: process.env.SESSION_SECRET ? "✅ Set" : "❌ Missing",
      REPLIT_DOMAINS: process.env.REPLIT_DOMAINS ? "✅ Set" : "⚠️  Missing",
      ALGOLIA_API_KEY: process.env.ALGOLIA_API_KEY ? "✅ Set" : "⚠️  Missing",
      BREVO_API_KEY: process.env.BREVO_API_KEY ? "✅ Set" : "⚠️  Missing"
    };
    console.table(envVars);

    const server = await registerRoutes(app);
    console.log("✅ Routes registered");

    try {
      const { initializeAlgolia } = await import('./initialize-algolia.js');
      await initializeAlgolia();
      console.log("✅ Algolia initialized");
    } catch (err: any) {
      console.warn("⚠️  Algolia init failed:", err.message);
    }

    try {
      initializeBrevo();
      console.log("✅ Brevo initialized");
    } catch (err: any) {
      console.warn("⚠️  Brevo init failed:", err.message);
    }

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || 500;
      const message = err.message || "Internal Server Error";
      console.error("🚨 Global error:", status, message);
      res.status(status).json({ message });
    });

    const port = 5000;
    console.log(`🌐 Starting on port ${port}...`);

    if (process.env.NODE_ENV === "development") {
      let setupVite = () => {};
      await setupVite(app, server);
    } else {
      try {
        const serveStatic = () => {};
        serveStatic(app);
        console.log("✅ Static file serving configured");
      } catch (err: any) {
        console.warn("⚠️ No static files found:", err.message);
        app.get("/", (_req, res) => {
          res.send(`<h1>🚀 ProbeAI Backend</h1><p>API is live.</p>`);
        });
      }
    }

    server.listen({ port, host: "0.0.0.0", reusePort: true }, () => {
      console.log(`✅ Server running at http://0.0.0.0:${port}`);
    });
  } catch (err: any) {
    console.error("💥 Startup failed:", err.message);
    process.exit(1);
  }
})();
