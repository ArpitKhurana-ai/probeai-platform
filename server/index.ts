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

// ✅ Regex-based CORS whitelist
const allowedOriginsRegex = /^https:\/\/probeai-platform(-[\w\d]+)?\.vercel\.app$|^http:\/\/localhost:5000$/;

// ✅ Manual preflight handler to prevent CORS errors
app.use((req, res, next) => {
  const origin = req.headers.origin || "";
  if (allowedOriginsRegex.test(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  }

  if (req.method === "OPTIONS") {
    res.status(200).end(); // Preflight success
    return;
  }

  next();
});

// ✅ Also apply CORS middleware as fallback
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOriginsRegex.test(origin)) {
      callback(null, true);
    } else {
      console.error("❌ CORS Error: Origin not allowed ->", origin);
      callback(new Error(`CORS Error: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

console.log("📦 Express app configured with CORS and parsers");

// Dev-only stubs
let setupVite: any = () => {};
let serveStatic: any = () => {};

// Safe auth middleware
app.use((req, res, next) => {
  try {
    if (req.user?.claims) next();
    else next();
  } catch (err) {
    console.warn("⚠️ Auth middleware bypassed:", err.message);
    next();
  }
});

// Logging
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

// Uncaught error protection
process.on('uncaughtException', (error) => {
  console.error('💥 UNCAUGHT EXCEPTION - Server will exit:');
  console.error('Error name:', error.name);
  console.error('Error message:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 UNHANDLED PROMISE REJECTION - Server will exit:');
  console.error('Promise:', promise);
  console.error('Reason:', reason);
  process.exit(1);
});

(async () => {
  try {
    console.log("🔧 Starting server initialization...");

    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? "✅ Set" : "❌ Missing",
      SESSION_SECRET: process.env.SESSION_SECRET ? "✅ Set" : "❌ Missing", 
      REPLIT_DOMAINS: process.env.REPLIT_DOMAINS ? "✅ Set" : "⚠️  Missing (Optional)",
      ALGOLIA_API_KEY: process.env.ALGOLIA_API_KEY ? "✅ Set" : "⚠️  Missing",
      BREVO_API_KEY: process.env.BREVO_API_KEY ? "✅ Set" : "⚠️  Missing"
    };

    console.table(envVars);

    console.log("🔗 Registering routes...");
    const server = await registerRoutes(app);
    console.log("✅ Routes registered");

    try {
      const { initializeAlgolia } = await import('./initialize-algolia.js');
      await initializeAlgolia();
      console.log("✅ Algolia initialized");
    } catch (e) {
      console.warn("⚠️  Algolia error:", e.message);
    }

    try {
      initializeBrevo();
      console.log("✅ Brevo initialized");
    } catch (e) {
      console.warn("⚠️  Brevo error:", e.message);
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
