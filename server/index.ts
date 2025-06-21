import express from "express";
import dotenv from "dotenv";
import { db } from "./db";
import { registerRoutes } from "./routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ✅ Debug route to test CORS quickly
app.get("/cors-check", (req, res) => {
  res.json({ message: "✅ CORS check passed" });
});

// ✅ Register all API routes
async function startServer() {
  try {
    // ✅ No connectToDatabase — db is already imported
    registerRoutes(app);

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
