import type { Express } from "express";
import { storage } from "./storage";
import { setupAuth } from "./replitAuth";
import searchRoutes from "./routes/search";

export async function registerRoutes(app: Express): Promise<void> {
  const { healthCheck } = await import("./health.js");
  app.get("/health", healthCheck);

  await setupAuth(app);

  app.get("/api/auth/user", async (req: any, res) => {
    try {
      if (!req.user || !req.user.claims) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get("/api/tools", async (req, res) => {
    try {
      const { category, featured, hot, limit = 20, offset = 0 } = req.query;
      const tools = await storage.getTools({
        category: category as string,
        featured: featured === "true",
        hot: hot === "true",
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      });
      res.json(tools);
    } catch (error) {
      console.error("Error fetching tools:", error);
      res.status(500).json({ message: "Failed to fetch tools" });
    }
  });

  app.get("/api/news", async (req, res) => {
    try {
      const { limit = 10, offset = 0 } = req.query;
      const news = await storage.getNews({
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      });
      res.json(news);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });

  app.get("/api/blogs", async (req, res) => {
    try {
      const { limit = 10, offset = 0 } = req.query;
      const blogs = await storage.getBlogs({
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      });
      res.json(blogs);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      res.status(500).json({ message: "Failed to fetch blogs" });
    }
  });

  app.get("/api/videos", async (req, res) => {
    try {
      const { limit = 10, offset = 0 } = req.query;
      const videos = await storage.getVideos({
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      });
      res.json(videos);
    } catch (error) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  // ✅ Mount Algolia search and suggestions
  app.use("/api/search", searchRoutes);

  console.log("✅ All API routes registered.");
}
