/ server/index.ts (with debug-only changes)
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

// === CORS Debugging Middleware ===
const allowedOrigins = [
  "https://probeai-platform.vercel.app",
  /^https:\/\/probeai-platform-[a-z0-9\-]+\.vercel\.app$/
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const method = req.method;

  console.log("🟡 Incoming Request:", {
    method,
    origin,
    path: req.path,
    headers: req.headers,
  });

  const isAllowed = origin && allowedOrigins.some(o =>
    typeof o === "string" ? o === origin : o.test(origin)
  );

  if (isAllowed) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    console.log("✅ Allowed CORS for:", origin);
  } else {
    console.warn("❌ BLOCKED CORS for:", origin);
    res.setHeader("Access-Control-Allow-Origin", "BLOCKED");
  }

  if (method === "OPTIONS") {
    return res.status(204).end();
  }

  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/tools", toolsRouter);
app.use("/api/blogs", blogsRouter);
app.use("/api/news", newsRouter);
app.use("/api/videos", videosRouter);
app.use("/api/auth", authRouter);

app.use(express.static(path.join(__dirname, "../client/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});