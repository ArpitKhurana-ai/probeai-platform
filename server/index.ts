import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { serveFallbackFrontend } from "./fallback-frontend";
import { initializeBrevo } from "./brevo";

console.log("🚀 Starting ProbeAI backend server...");
console.log("Environment:", process.env.NODE_ENV || "development");
console.log("Platform:", process.platform);
console.log("Node version:", process.version);

const app = express();

// ✅ Apply CORS at top level — allow all *.vercel.app and localhost
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isVercelPreview = /^https:\/\/probeai-platform-[a-z0-9]+\.vercel\.app$/.test(origin);
    const isProd = origin === "https://probeai-platform.vercel.app";
    const isLocal = origin.startsWith("http://localhost");
    if (isVercelPreview || isProd || isLocal) {
      return callback(null, true);
    }
    console.warn("❌ CORS blocked:", origin);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health route to test CORS
app.get("/cors-check", (_req, res) => {
  res.json({ message: "CORS working ✅" });
});

// Dummy safe auth middleware
app.use((_req, _res, next) => next());

// Logging
app.use((req, res, next) => {
  const start = Date.now();
  const originalJson = res.json;
  res.json = function (body, ...args) {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    return originalJson.apply(res, [body, ...args]);
  };
  next();
});

// Register routes
(async () => {
  try {
    console.table({
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? "✅" : "❌",
      SESSION_SECRET: process.env.SESSION_SECRET ? "✅" : "❌",
    });

    const server = await registerRoutes(app);

    try {
      const { initializeAlgolia } = await import("./initialize-algolia.js");
      await initializeAlgolia();
      console.log("✅ Algolia initialized");
    } catch (err) {
      console.warn("⚠️ Algolia skipped:", err.message);
    }

    try {
      initializeBrevo();
      console.log("✅ Brevo initialized");
    } catch (err) {
      console.warn("⚠️ Brevo skipped:", err.message);
    }

    // Global error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error("🚨 Global error:", err.message);
      res.status(err.status || 500).json({ message: err.message || "Server error" });
    });

    const port = 5000;
    app.listen({ port, host: "0.0.0.0" }, () =>
      console.log(`✅ Backend live at http://0.0.0.0:${port}`)
    );
  } catch (err) {
    console.error("💥 Startup failed:", err.message);
    process.exit(1);
  }
})();
