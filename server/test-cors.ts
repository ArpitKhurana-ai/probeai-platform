import express from "express";

const app = express();

// ✅ Minimal working CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin || "NO_ORIGIN";
  const allowed = /^https:\/\/probeai-platform.*\.vercel\.app$/.test(origin);

  console.log("🧪 CORS CHECK:", origin, "Allowed?", allowed);
  res.setHeader("X-Debug-CORS-Check", "YES");

  if (allowed) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  }

  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.get("/api/test", (_req, res) => {
  res.json({ message: "✅ Test successful" });
});

// ✅ Use Replit public port
const port = parseInt(process.env.PORT || "3000", 10);
app.listen(port, () => {
  console.log(`🧪 Test CORS server running at http://localhost:${port}`);
});
