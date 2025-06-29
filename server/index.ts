import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { db } from "./db";
import { registerRoutes } from "./routes";
import { initializeAlgolia } from "./algoliaSync";
import { createServer } from "http";

dotenv.config();

const app = express();

// ✅ Fail fast if PORT not set (important for production on Railway)
const PORT = process.env.PORT ? Number(process.env.PORT) : 8787;
const HOST = "0.0.0.0";

// ✅ CORS setup
const allowedOrigins = [
  "http://localhost:3000",
  "https://probeai.vercel.app",
  /\.vercel\.app$/,
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        /\.vercel\.app$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());

// ✅ Health route
app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "✅ ProbeAI backend root is alive." });
});

// ✅ CORS debug route
app.get("/cors-check", (_req, res) => {
  res.json({ message: "✅ CORS check passed" });
});

async function startServer() {
  try {
    console.log("\n===============================");
    console.log("🚀 Booting ProbeAI Backend...");
    console.log(`🌐 PORT: ${PORT}`);
    console.log(`🌍 ENV: ${process.env.NODE_ENV}`);
    console.log("===============================\n");

    await initializeAlgolia();
    console.log("🔁 Algolia sync initialized");

    await registerRoutes(app);
    console.log("📦 Routes registered");

    // ✅ Catch-all must be last
    app.get("*", (_req, res) => {
      res.status(404).json({ error: "Route not found" });
    });

    const httpServer = createServer(app);
    httpServer.listen(PORT, HOST, () => {
      console.log("✅ ProbeAI backend server running successfully!");
      console.log(`🔗 Listening on http://${HOST}:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
