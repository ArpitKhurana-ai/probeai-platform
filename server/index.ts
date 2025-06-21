import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectToDatabase } from "./db";
import { seedDatabase } from "./seed";
import { registerRoutes } from "./routes";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// ✅ CORS setup
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow undefined (like curl or Postman), or any Vercel preview or localhost
      if (
        !origin ||
        origin.includes("vercel.app") ||
        origin.includes("localhost") ||
        origin.includes("127.0.0.1")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// ✅ Debug route to test CORS quickly
app.get("/cors-check", (req, res) => {
  res.json({ message: "✅ CORS check passed" });
});

// ✅ Register all API routes
async function startServer() {
  try {
    const db = connectToDatabase(); // ❗ Removed `await`
    await seedDatabase(db);
    registerRoutes(app);

    app.listen(PORT, () => {
      console.log("✅ ProbeAI backend server running successfully!");
      console.log(`🌐 Listening on http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
