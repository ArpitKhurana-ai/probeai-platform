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

// ✅ FIXED: Robust CORS config
const allowedOrigins = [
  "https://probeai-platform.vercel.app",
  "http://localhost:5000",
];

const dynamicOrigin = (origin: string | undefined, callback: Function) => {
  if (!origin || allowedOrigins.includes(origin) || /^https:\/\/probeai-platform-[a-z0-9]+-arpits-projects-fff6dea9\.vercel\.app$/.test(origin)) {
    callback(null, true);
  } else {
    console.error("❌ CORS Rejected:", origin);
    callback(new Error("Not allowed by CORS"));
  }
};

app.use(cors({
  origin: dynamicOrigin,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.get("/cors-check", (req, res) => {
  res.set("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.json({ message: "CORS check passed", origin: req.headers.origin });
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

console.log("📦 Middleware initialized");

// Safe middleware
app.use((req, _res, next) => {
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

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJson: any;

  const originalJson = res.json;
  res.json = function (body, ...args) {
    capturedJson = body;
    return originalJson.apply(res, [body, ...args]);
  };

  res.on("finish", () => {
    if (path.startsWith("/api")) {
      let log = `${req.method} ${path} ${res.statusCode} in ${Date.now() - start}ms`;
      if (capturedJson) log += ` :: ${JSON.stringify(capturedJson)}`;
      console.log(log.slice(0, 300));
    }
  });

  next();
});

// Error safety
process.on('uncaughtException', (error) => {
  console.error("💥 UNCAUGHT EXCEPTION:", error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, _promise) => {
  console.error("💥 UNHANDLED PROMISE:", reason);
  process.exit(1);
});

(async () => {
  try {
    console.log("🔧 Initializing server...");

    console.table({
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: !!process.env.DATABASE_URL,
      SESSION_SECRET: !!process.env.SESSION_SECRET,
      ALGOLIA_API_KEY: !!process.env.ALGOLIA_API_KEY,
      BREVO_API_KEY: !!process.env.BREVO_API_KEY
    });

    const server = await registerRoutes(app);
    console.log("✅ Routes loaded");

    try {
      const { initializeAlgolia } = await import('./initialize-algolia.js');
      await initializeAlgolia();
      console.log("✅ Algolia initialized");
    } catch (err) {
      console.warn("⚠️ Algolia error:", err.message);
    }

    try {
      initializeBrevo();
      console.log("✅ Brevo initialized");
    } catch (err) {
      console.warn("⚠️ Brevo error:", err.message);
    }

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error("🚨 Global error:", err.message);
      res.status(err.status || 500).json({ message: err.message });
    });

    const port = 5000;
    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
    } else {
      try {
        serveStatic(app);
      } catch {
        app.get("/", (_req, res) => {
          res.send("<h1>🚀 ProbeAI API Ready</h1>");
        });
      }
    }

    server.listen({ port, host: "0.0.0.0" }, () => {
      console.log(`✅ Server ready: http://0.0.0.0:${port}`);
    });

  } catch (err) {
    console.error("💥 Startup error:", err.message);
    process.exit(1);
  }
})();
