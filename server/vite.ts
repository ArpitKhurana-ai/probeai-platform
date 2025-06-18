import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { type Server } from "http";
import { nanoid } from "nanoid";

export function log(message: string, source = "express") {
  const isDev = process.env.NODE_ENV !== "production";
  if (isDev) {
    const timestamp = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    console.log(`${timestamp} [${source}] ${message}`);
  }
}

export async function setupVite(app: Express, server: Server) {
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    try {
      const vite = await import("vite");
      const viteConfigModule = await import("./vite.config.js");
      
      const viteServer = await vite.createServer({
        ...viteConfigModule.default,
        server: { middlewareMode: true },
        appType: "custom",
        customLogger: vite.createLogger(),
      });
      
      app.use(viteServer.ssrFixStacktrace);
      app.use(viteServer.middlewares);
      log("Vite development server configured");
    } catch (error) {
      log("Vite not available, using static serving");
      serveStatic(app);
    }
  }
}

export function serveStatic(app: Express) {
  try {
    const distPath = path.resolve(process.cwd(), "dist/public");
    const indexPath = path.join(distPath, "index.html");
    
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath, { index: false }));
      
      app.get("*", (req, res, next) => {
        if (req.path.startsWith("/api/")) {
          return next();
        }
        
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          res.status(404).send("Application not built");
        }
      });
      
      log("Static files served from dist/public");
    } else {
      log("Static build directory not found");
    }
  } catch (error) {
    log("Error setting up static file serving");
  }
}
