import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { connectToDatabase } from "./db";
import { registerRoutes } from "./routes";
import { seedDatabase } from "./seed.ts"; // ✅ FIXED extension

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ----------------------
// Inline CORS Middleware
// ----------------------
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    "https://probeai-platform.vercel.app",
    "https://probeai-platform-production.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ];

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());

app.get("/cors-check", (req, res) => {
  res.json({ message: "CORS is working!" });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.join(__dirname, "../client/dist");

if (process.env.NODE_ENV === "production") {
  app.use(express.static(publicPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(publicPath, "index.html"));
  });
}

function printRegisteredRoutes(app: express.Application) {
  console.log("🛣️ Registered Routes:");
  const routes: { method: string; path: string }[] = [];

  app._router.stack.forEach((middleware: any) => {
    if (middleware.route) {
      const methods = Object.keys(middleware.route.methods)
        .map((m) => m.toUpperCase())
        .join(",");
      routes.push({ method: methods, path: middleware.route.path });
    } else if (middleware.name === "router") {
      middleware.handle.stack.forEach((handler: any) => {
        const route = handler.route;
        if (route) {
          const methods = Object.keys(route.methods)
            .map((m) => m.toUpperCase())
            .join(",");
          routes.push({ method: methods, path: route.path });
        }
      });
    }
  });

  routes.forEach((r) => {
    console.log(`➡️ ${r.method} ${r.path}`);
  });
}

(async () => {
  try {
    await connectToDatabase();
    await seedDatabase();
    await registerRoutes(app);
    printRegisteredRoutes(app);

    app.listen(PORT, () => {
      console.log(`✅ ProbeAI backend server running successfully!`);
      console.log(`📍 Server listening on http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
})();
