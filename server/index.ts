import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { initializeBrevo } from "./brevo";

const app = express();

// ✅ Set CORS FIRST
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // SSR requests, curl, etc.

    const vercelPreview = /^https:\/\/probeai-platform(-[\w\d]+)?\.vercel\.app$/;
    const allowlist = [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://probeai-platform.vercel.app"
    ];

    if (vercelPreview.test(origin) || allowlist.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("❌ CORS blocked:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Optional test route
app.get("/cors-check", (_req, res) => {
  res.json({ ok: true });
});

// Log requests
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    console.log(`${req.method} ${req.url} ${res.statusCode} - ${ms}ms`);
  });
  next();
});

(async () => {
  try {
    console.table({
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? "✅" : "❌",
      SESSION_SECRET: process.env.SESSION_SECRET ? "✅" : "❌",
      ALGOLIA_API_KEY: process.env.ALGOLIA_API_KEY ? "✅" : "⚠️",
      BREVO_API_KEY: process.env.BREVO_API_KEY ? "✅" : "⚠️"
    });

    const server = await registerRoutes(app);
    console.log("✅ Routes registered");

    initializeBrevo();

    // Global error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || 500;
      res.status(status).json({ message: err.message || "Server error" });
    });

    const port = 5000;
    server.listen({ port, host: "0.0.0.0", reusePort: true }, () => {
      console.log(`🚀 Server live at http://0.0.0.0:${port}`);
    });
  } catch (err: any) {
    console.error("💥 Startup failed:", err.message);
    process.exit(1);
  }
})();
