import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { db } from "./db";
import { registerRoutes } from "./routes";
import { initializeAlgolia } from "./algoliaSync"; // ✅ ADD THIS

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8787;

// ✅ Add CORS middleware
const allowedOrigins = [
  "http://localhost:3000",
  "https://probeai.vercel.app",
  /\.vercel\.app$/, // Allow all Vercel Preview URLs
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

// ✅ Debug route
app.get("/cors-check", (req, res) => {
  res.json({ message: "✅ CORS check passed" });
});

// ✅ Register routes + sync Algolia
async function startServer() {
  try {
    await initializeAlgolia(); // ✅ SYNC ALGOLIA ON STARTUP
    await registerRoutes(app);
    app.listen(PORT, () => {
      console.log("✅ ProbeAI backend server running successfully!");
      console.log(`🚀 Listening on http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
