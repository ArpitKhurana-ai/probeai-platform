console.log("🚀 Starting ProbeAI backend server...");
console.log("Environment:", process.env.NODE_ENV || "development");
console.log("Platform:", process.platform);
console.log("Node version:", process.version);

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeBrevo } from "./brevo";

console.log("✅ All imports loaded successfully");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

console.log("📦 Express app configured");

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 UNCAUGHT EXCEPTION - Server will exit:');
  console.error('Error name:', error.name);
  console.error('Error message:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 UNHANDLED PROMISE REJECTION - Server will exit:');
  console.error('Promise:', promise);
  console.error('Reason:', reason);
  process.exit(1);
});

(async () => {
  try {
    console.log("🔧 Starting server initialization...");
    
    // Environment variable checks
    console.log("🔍 Checking environment variables...");
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? "✅ Set" : "❌ Missing",
      SESSION_SECRET: process.env.SESSION_SECRET ? "✅ Set" : "❌ Missing", 
      REPLIT_DOMAINS: process.env.REPLIT_DOMAINS ? "✅ Set" : "⚠️  Missing (Optional)",
      ALGOLIA_API_KEY: process.env.ALGOLIA_API_KEY ? "✅ Set" : "⚠️  Missing",
      BREVO_API_KEY: process.env.BREVO_API_KEY ? "✅ Set" : "⚠️  Missing"
    };
    
    console.table(envVars);

    console.log("🔗 Registering routes and setting up authentication...");
    const server = await registerRoutes(app);
    console.log("✅ Routes registered successfully");
  
    // Initialize Algolia search index
    console.log("🔍 Initializing Algolia search...");
    try {
      const { initializeAlgolia } = await import('./initialize-algolia.js');
      await initializeAlgolia();
      console.log("✅ Algolia initialized successfully");
    } catch (error) {
      console.warn("⚠️  Algolia initialization failed:", error.message);
    }

    // Initialize Brevo email service
    console.log("📧 Initializing Brevo email service...");
    try {
      initializeBrevo();
      console.log("✅ Brevo initialized successfully");
    } catch (error) {
      console.warn("⚠️  Brevo initialization failed:", error.message);
    }

    // Global error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      
      console.error("🚨 Express error handler caught:");
      console.error("Status:", status);
      console.error("Message:", message);
      console.error("Stack:", err.stack);

      res.status(status).json({ message });
    });

    const port = 5000;
    console.log(`🌐 Setting up server on port ${port}...`);

    // Setup vite in development, serve static files in production
    if (process.env.NODE_ENV === "development") {
      console.log("🔧 Development mode: Setting up Vite");
      await setupVite(app, server);
    } else {
      console.log("📦 Production mode: Serving static files");
      serveStatic(app);
    }

    console.log(`🚀 Starting server on 0.0.0.0:${port}...`);
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      console.log("✅ ProbeAI backend server running successfully!");
      console.log(`📍 Server listening on http://0.0.0.0:${port}`);
      log(`serving on port ${port}`);
    });
  } catch (error) {
    console.error("💥 CRITICAL ERROR - Failed to start server:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Stack trace:", error.stack);
    
    // Log environment info for debugging
    console.error("Environment debug info:");
    console.error("- NODE_ENV:", process.env.NODE_ENV);
    console.error("- Platform:", process.platform);
    console.error("- Working directory:", process.cwd());
    
    process.exit(1);
  }
})();
