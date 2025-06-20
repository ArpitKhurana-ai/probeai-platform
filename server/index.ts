console.log("🚀 Starting ProbeAI backend server...");

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { initializeBrevo } from "./brevo";

const app = express();

// ✅ Robust CORS config
const allowedOrigins = [
  "https://probeai-platform.vercel.app",
  "http://localhost:5000",
];

const dynamicOrigin = (origin: string | undefined, callback: Function) => {
  const previewRegex = /^https:\/\/probeai-platform-[a-z0-9]+-arpits-projects-fff6dea9\.vercel\.app$/;
  if (!origin || allowedOrigins.includes(origin) || previewRegex.test(origin)) {
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

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ✅ Debug route
app.get("/cors-check", (req, res) => {
  res.set("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.json({ message: "✅ CORS check passed", origin: req.headers.origin });
});

// ✅ Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const time = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} in ${time}ms`);
  });
  next();
});

// ✅ Error protection
process.on("unhandledRejection", (reason) => {
  console.error("💥 Unhandled Rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err);
  process.exit(1);
});

(async () => {
  try {
    await registerRoutes(app);
    initializeBrevo();

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      res.status(err.status || 500).json({ message: err.message });
    });

    const port = 5000;
    app.listen(port, () => {
      console.log(`✅ Server ready on http://0.0.0.0:${port}`);
    });
  } catch (err) {
    console.error("💥 Startup error:", err.message);
    process.exit(1);
  }
})();
