import express from "express";
import cors from "cors";
import path from "path";
import { toolsRouter } from "./routes/tools";
import { blogsRouter } from "./routes/blogs";
import { newsRouter } from "./routes/news";
import { videosRouter } from "./routes/videos";
import { authRouter } from "./routes/auth";

const app = express();
const PORT = process.env.PORT || 3000;

// === CORS SETUP WITH DEBUGGING ===
const allowedOrigins = [
  "https://probeai-platform.vercel.app",
  /^https:\/\/probeai-platform-[a-z0-9\-]+\.vercel\.app$/,
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const method = req.method;

  let isAllowed = false;
  if (origin && typeof origin === "string") {
    isAllowed = allowedOrigins.some((o) =>
      typeof o === "string" ? o === origin : o.test(origin)
    );
  }

  if (isAllowed) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    console.log("✅ CORS Allowed Origin:", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "BLOCKED");
    console.log("❌ CORS Blocked Origin:", origin);
  }

  res.setHeader("X-Debug-CORS-Check", "YES");
  console.log(`🧪 CORS DEBUG → Method: ${method} | Origin: ${origin}`);

  if (method === "OPTIONS") {
    console.log("⚙️ Preflight OPTIONS handled");
    return res.status(204).end();
  }

  next();
});

// === BASE MIDDLEWARE ===
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === ROUTES ===
app.use("/api/tools", toolsRouter);
app.use("/api/blogs", blogsRouter);
app.use("/api/news", newsRouter);
app.use("/api/videos", videosRouter);
app.use("/api/auth", authRouter);

// === STATIC FRONTEND ===
app.use(express.static(path.join(__dirname, "../client/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

// === START SERVER ===
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
