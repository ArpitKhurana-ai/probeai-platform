import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { initializeBrevo } from "./brevo";

const app = express();

// ✅ Allow Vercel previews using regex
const allowedOrigins = [
  "https://probeai-platform.vercel.app",
  "http://localhost:5000",
];

const dynamicOrigin = (origin: string | undefined, callback: Function) => {
  const vercelPreview = /^https:\/\/probeai-platform-[\w-]+\.vercel\.app$/;
  if (!origin || allowedOrigins.includes(origin) || vercelPreview.test(origin)) {
    callback(null, true);
  } else {
    console.error("❌ CORS Rejected:", origin);
    callback(new Error("CORS blocked: Origin not allowed"));
  }
};

app.use(
  cors({
    origin: dynamicOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Basic setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ✅ Health check route
app.get("/cors-check", (req: Request, res: Response) => {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.status(200).json({ message: "✅ CORS OK", origin: req.headers.origin });
});

// ✅ Error logging
process.on("unhandledRejection", (reason) => {
  console.error("💥 Unhandled Rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err);
  process.exit(1);
});

// ✅ Main async block
(async () => {
  try {
    console.log("🔧 Starting backend...");

    await registerRoutes(app);
    initializeBrevo();

    // ✅ Global error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error("Global Error:", err.message);
      res.status(err.status || 500).json({ message: err.message || "Server error" });
    });

    const port = 5000;
    app.listen(port, () => {
      console.log(`✅ Server listening on http://0.0.0.0:${port}`);
    });
  } catch (err) {
    console.error("💥 Startup Error:", err.message);
    process.exit(1);
  }
})();
