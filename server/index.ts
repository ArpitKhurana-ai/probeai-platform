import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { db } from "./db";
import { registerRoutes } from "./routes";
import { initializeAlgolia } from "./algoliaSync";
import { createServer } from "http";

dotenv.config();

const app = express();

// ✅ Fail fast if PORT not injected
if (!process.env.PORT) {
  throw new Error("❌ Missing PORT in environment variables. Railway must inject this.");
}
const PORT = Number(process.env.PORT);
const HOST = "0.0.0.0"; // ✅ Required for Railway

// ✅ Allow specific origins
const allowedOrigins = [
  "http://localhost:3000",
  "https://probeai.vercel.app",
  /\.vercel\.app$/,
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());

// ✅ Root health route
app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "✅ ProbeAI backend root is alive." });
});

// ✅ CORS test
app.get("/cors-check", (_req, res) => {
  res.json({ message: "✅ CORS check passed" });
});

// ✅ Start Server
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

    // ✅ Add catch-all route LAST
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
