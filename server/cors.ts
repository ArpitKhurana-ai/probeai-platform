// server/cors.ts
import { Request, Response, NextFunction } from "express";

export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin || "NO_ORIGIN_HEADER";
  const method = req.method;
  const path = req.path;

  const allowedOrigins = [
    "http://localhost:5000",
    "https://probeai-platform.vercel.app"
  ];
  const vercelPreviewRegex = /^https:\/\/probeai-platform(?:-[\w\d]+)?\.vercel\.app$/;

  const isAllowed = allowedOrigins.includes(origin) || vercelPreviewRegex.test(origin);

  res.setHeader("X-Debug-CORS-Check", "YES");
  console.log(`🧪 CORS DEBUG → ${method} ${path}`);
  console.log("   ↪ Origin:", origin);
  console.log("   ↪ Match Allowed:", isAllowed);

  if (isAllowed) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  } else {
    res.setHeader("Access-Control-Allow-Origin", "BLOCKED");
  }

  if (method === "OPTIONS") {
    console.log("⚙️ Preflight OPTIONS request handled");
    return res.status(204).end();
  }

  next();
};
