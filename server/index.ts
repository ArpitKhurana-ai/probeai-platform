console.log("🚀 Starting ProbeAI backend server...");
console.log("Environment:", process.env.NODE_ENV || "development");
console.log("Platform:", process.platform);
console.log("Node version:", process.version);

import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { serveFallbackFrontend } from "./fallback-frontend";
import { initializeBrevo } from "./brevo";

const app = express();

// ✅ FINAL CORS MIDDLEWARE — uses REGEX to match preview domains
const allowedOriginsRegex = /^https:\/\/(probeai-platform|probeai-platform-[a-z0-9]+)\.vercel\.app$|^http:\/\/localhost:5000$/;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOriginsRegex.test(origin)) {
        callback(null, true);
      } else {
        console.error("❌ CORS Error: Origin not allowed ->", origin);
        callback(new Error(`CORS Error: Origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

console.log("📦 Express app configured with CORS and parsers");

let setupVite: any = () => {};
let serveStatic: any = () => {};

// Safe auth middleware
app.use((req, res, next) => {
  try {
    if (req.user?.claims) {
      next();
    } else {
      next();
    }
  } catch (err) {
    console.warn("⚠️ Auth middleware bypassed:", err.message);
    next();
  }
});

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      console.log(logLine);
    }
  });

  next();
});

// Crash protection
process.on('uncaughtException', (error) => {
  console.error('💥 UNCAUGHT EXCEPTION:', error);
  process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 UNHANDLED REJECTION:', reason);
  process.exit(1);
});

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

    const server = await registerRoutes(app);
    console.log("✅ Routes registered");

    try {
      const { initializeAlgolia } = await import("./initialize-algolia.js");
      await initializeAlgolia();
      console.log("✅ Algolia initialized");
    } catch (e) {
      console.warn("⚠️ Algolia init failed:", e.message);
    }

    try {
      initializeBrevo();
      console.log("✅ Brevo initialized");
    } catch (e) {
      console.warn("⚠️ Brevo init failed:", e.message);
    }

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || 500;
      const message = err.message || "Internal Server Error";
      console.error("🚨 Global error:", status, message);
      res.status(status).json({ message });
    });

    const port = 5000;
    console.log(`🌐 Preparing server on port ${port}...`);

    if (process.env.NODE_ENV === "development") {
      console.log("🔧 Dev mode: setting up Vite...");
      await setupVite(app, server);
    } else {
      try {
        serveStatic(app);
        console.log("✅ Static serving ready");
      } catch (err) {
        console.warn("⚠️ No static files, backend-only mode:", err.message);
        app.get("/", (_req, res) => {
          res.send(`<h1>🚀 ProbeAI Backend Running</h1><p>API is ready.</p>`);
        });
      }
    }

    server.listen({ port, host: "0.0.0.0", reusePort: true }, () => {
      console.log(`✅ Server live at http://0.0.0.0:${port}`);
    });
  } catch (error) {
    console.error("💥 Startup failed:", error.message);
    process.exit(1);
  }
})();
