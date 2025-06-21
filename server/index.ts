import express, { type Request, type Response, type NextFunction } from "express";
import { registerRoutes } from "./routes";
import { initializeBrevo } from "./brevo";

const app = express();

// ✅ CORS middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  console.log(`🔗 CORS - ${req.method} ${req.url} - Origin: ${origin}`);
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// ✅ JSON parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

// ✅ CORS check route — must come before dynamic route registration
app.get("/cors-check", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "CORS headers applied ✅",
    origin: req.headers.origin,
    headers: req.headers,
    timestamp: new Date().toISOString(),
  });
});

// ✅ Health route
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    time: new Date().toISOString(),
  });
});

// ✅ Route logging
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.url}`);
  next();
});

// 🔧 Init everything
(async () => {
  try {
    console.log("🔧 Registering routes...");
    await registerRoutes(app);
    await initializeBrevo();

    app.all("*", (req, res) => {
      res.status(404).json({
        error: "Route not found",
        method: req.method,
        path: req.url,
        timestamp: new Date().toISOString(),
      });
    });

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`✅ Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("❌ Startup error:", err);
    process.exit(1);
  }
})();
