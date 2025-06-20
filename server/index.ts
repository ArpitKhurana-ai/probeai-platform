import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { toolsRouter } from "./routes/tools";
import { blogsRouter } from "./routes/blogs";
import { newsRouter } from "./routes/news";
import { videosRouter } from "./routes/videos";
import { authRouter } from "./routes/auth";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://probeai-platform.vercel.app",
  ...Array.from({ length: 1000 }, (_, i) => `https://probeai-platform-${i.toString(36)}-arpits-projects-fff6dea9.vercel.app`)
];

const dynamicOriginMatch = (origin: string | undefined): boolean => {
  if (!origin) return false;
  return (
    origin === "http://localhost:5173" ||
    origin === "https://probeai-platform.vercel.app" ||
    /^https:\/\/probeai-platform-[\w-]+-arpits-projects-fff6dea9\.vercel\.app$/.test(origin)
  );
};

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || dynamicOriginMatch(origin)) {
      callback(null, origin); // Allow request
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

// 🧩 Apply CORS globally
app.use(cors(corsOptions));

// 🪵 Debug middleware
app.use((req, res, next) => {
  res.setHeader("X-Debug-CORS-Check", "YES");
  console.log(`🧪 CORS DEBUG: ${req.method} ${req.path} | Origin: ${req.headers.origin}`);
  next();
});

// 🌐 Middleware
app.use(express.json());
app.use(cookieParser());

// 🚀 Routes
app.use("/api/tools", toolsRouter);
app.use("/api/blogs", blogsRouter);
app.use("/api/news", newsRouter);
app.use("/api/videos", videosRouter);
app.use("/api/auth", authRouter);

// 🔊 Start
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
