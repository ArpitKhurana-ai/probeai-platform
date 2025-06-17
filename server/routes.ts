import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth";
import { subscribeToNewsletter, sendWelcomeEmail } from "./brevo";
import { z } from "zod";
import { insertToolSchema, insertNewsSchema, insertBlogSchema, insertVideoSchema, insertSubscriptionSchema, insertCategorySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Tools routes
  app.get('/api/tools', async (req, res) => {
    try {
      const { category, featured, hot, limit = 20, offset = 0 } = req.query;
      const tools = await storage.getTools({
        category: category as string,
        featured: featured === 'true',
        hot: hot === 'true',
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      res.json(tools);
    } catch (error) {
      console.error("Error fetching tools:", error);
      res.status(500).json({ message: "Failed to fetch tools" });
    }
  });

  // Search tools
  app.get('/api/search', async (req, res) => {
    const query = req.query.q as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string;
    const pricingType = req.query.pricingType as string;
    
    if (!query || query.trim().length === 0) {
      return res.json({ items: [], total: 0, query: '' });
    }
    
    try {
      // Use Algolia search if available
      const { searchTools } = await import('./initialize-algolia');
      const offset = (page - 1) * limit;
      const results = await searchTools(query, {
        page: page - 1, // Algolia uses 0-based pages
        hitsPerPage: limit,
        filters: category ? `category:"${category}"` : undefined
      });
      
      res.json(results);
    } catch (error) {
      console.error("Search failed:", error);
      res.status(500).json({ message: "Search failed" });
    }
  });

  // Query suggestions route
  app.get('/api/search/suggestions', async (req, res) => {
    try {
      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 5;

      if (!query || query.trim().length < 2) {
        return res.json([]);
      }

      const { getQuerySuggestions } = await import('./initialize-algolia');
      const suggestions = await getQuerySuggestions(query, limit);

      res.json(suggestions);
    } catch (error) {
      console.error('Suggestions error:', error);
      res.status(500).json({ message: 'Suggestions failed' });
    }
  });

  app.get('/api/tools/:id', async (req, res) => {
    try {
      const param = req.params.id;
      let tool;
      
      // Check if param is numeric (ID) or slug
      if (/^\d+$/.test(param)) {
        const toolId = parseInt(param);
        tool = await storage.getToolById(toolId);
      } else {
        // Handle slug lookup
        tool = await storage.getToolBySlug(param);
      }
      
      if (!tool) {
        return res.status(404).json({ message: "Tool not found" });
      }
      res.json(tool);
    } catch (error) {
      console.error("Error fetching tool:", error);
      res.status(500).json({ message: "Failed to fetch tool" });
    }
  });

  app.post('/api/tools', isAuthenticated, async (req: any, res) => {
    try {
      const toolData = insertToolSchema.parse({
        ...req.body,
        submittedBy: req.user.claims.sub,
        isApproved: false,
      });
      const tool = await storage.createTool(toolData);
      res.json(tool);
    } catch (error) {
      console.error("Error creating tool:", error);
      res.status(500).json({ message: "Failed to create tool" });
    }
  });

  app.get('/api/tools/:id/similar', async (req, res) => {
    try {
      const param = req.params.id;
      let tool;
      
      // Check if param is numeric (ID) or slug
      if (/^\d+$/.test(param)) {
        const toolId = parseInt(param);
        tool = await storage.getToolById(toolId);
      } else {
        // Handle slug lookup
        tool = await storage.getToolBySlug(param);
      }
      
      if (!tool) {
        return res.status(404).json({ message: "Tool not found" });
      }
      
      const similarTools = await storage.getSimilarTools(tool.id);
      res.json(similarTools);
    } catch (error) {
      console.error("Error fetching similar tools:", error);
      res.status(500).json({ message: "Failed to fetch similar tools" });
    }
  });

  // User likes
  app.post('/api/tools/:id/like', isAuthenticated, async (req: any, res) => {
    try {
      const param = req.params.id;
      let tool;
      
      // Check if param is numeric (ID) or slug
      if (/^\d+$/.test(param)) {
        const toolId = parseInt(param);
        tool = await storage.getToolById(toolId);
      } else {
        // Handle slug lookup
        tool = await storage.getToolBySlug(param);
      }
      
      if (!tool) {
        return res.status(404).json({ message: "Tool not found" });
      }
      
      const userId = req.user.claims.sub;
      await storage.toggleToolLike(userId, tool.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error toggling like:", error);
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  app.get('/api/user/likes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const likedTools = await storage.getUserLikedTools(userId);
      res.json(likedTools);
    } catch (error) {
      console.error("Error fetching liked tools:", error);
      res.status(500).json({ message: "Failed to fetch liked tools" });
    }
  });

  app.get('/api/user/submissions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const submissions = await storage.getUserSubmissions(userId);
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching user submissions:", error);
      res.status(500).json({ message: "Failed to fetch user submissions" });
    }
  });

  // News routes
  app.get('/api/news', async (req, res) => {
    try {
      const { limit = 20, offset = 0 } = req.query;
      const news = await storage.getNews({
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      res.json(news);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });

  app.post('/api/news', isAuthenticated, async (req: any, res) => {
    try {
      const newsData = insertNewsSchema.parse({
        ...req.body,
        submittedBy: req.user.claims.sub,
        isApproved: false,
      });
      const newsItem = await storage.createNews(newsData);
      res.json(newsItem);
    } catch (error) {
      console.error("Error creating news:", error);
      res.status(500).json({ message: "Failed to create news" });
    }
  });

  // Blog routes
  app.get('/api/blogs', async (req, res) => {
    try {
      const { limit = 20, offset = 0 } = req.query;
      const blogs = await storage.getBlogs({
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      res.json(blogs);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      res.status(500).json({ message: "Failed to fetch blogs" });
    }
  });

  app.get('/api/blogs/:slug', async (req, res) => {
    try {
      const blog = await storage.getBlogBySlug(req.params.slug);
      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }
      res.json(blog);
    } catch (error) {
      console.error("Error fetching blog:", error);
      res.status(500).json({ message: "Failed to fetch blog" });
    }
  });

  app.post('/api/blogs', isAuthenticated, async (req: any, res) => {
    try {
      const blogData = insertBlogSchema.parse({
        ...req.body,
        submittedBy: req.user.claims.sub,
        isApproved: false,
      });
      const blog = await storage.createBlog(blogData);
      res.json(blog);
    } catch (error) {
      console.error("Error creating blog:", error);
      res.status(500).json({ message: "Failed to create blog" });
    }
  });

  // Video routes
  app.get('/api/videos', async (req, res) => {
    try {
      const { limit = 20, offset = 0 } = req.query;
      const videos = await storage.getVideos({
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      res.json(videos);
    } catch (error) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  app.post('/api/videos', isAuthenticated, async (req: any, res) => {
    try {
      const videoData = insertVideoSchema.parse({
        ...req.body,
        submittedBy: req.user.claims.sub,
        isApproved: false,
      });
      const video = await storage.createVideo(videoData);
      res.json(video);
    } catch (error) {
      console.error("Error creating video:", error);
      res.status(500).json({ message: "Failed to create video" });
    }
  });

  // Newsletter subscription
  app.post('/api/newsletter/subscribe', async (req, res) => {
    try {
      console.log("Newsletter subscription request body:", req.body);
      const subscriptionData = insertSubscriptionSchema.parse(req.body);
      console.log("Parsed subscription data:", subscriptionData);
      
      // Store subscription in database
      const dbResult = await storage.createSubscription(subscriptionData);
      console.log("Database subscription created:", dbResult);
      
      // Add to Brevo mailing list if configured
      if (process.env.BREVO_API_KEY) {
        console.log("Adding to Brevo with email:", subscriptionData.email, "name:", subscriptionData.name);
        try {
          const brevoResult = await subscribeToNewsletter(subscriptionData.email, subscriptionData.name);
          console.log("Brevo subscription result:", brevoResult);
          
          // Send welcome email if sender email is configured
          if (process.env.BREVO_SENDER_EMAIL) {
            console.log("Sending welcome email to:", subscriptionData.email);
            const emailResult = await sendWelcomeEmail(subscriptionData.email, subscriptionData.name);
            console.log("Welcome email result:", emailResult);
          }
        } catch (brevoError) {
          console.error("Brevo integration error:", brevoError);
          // Continue with success response even if Brevo fails
        }
      } else {
        console.log("BREVO_API_KEY not configured, skipping Brevo integration");
      }
      
      res.json({ success: true, message: "Successfully subscribed to newsletter" });
    } catch (error) {
      console.error("Error subscribing to newsletter:", error);
      res.status(500).json({ message: "Failed to subscribe to newsletter" });
    }
  });

  // Categories
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Admin routes
  app.get('/api/admin/pending', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const pendingSubmissions = await storage.getPendingSubmissions();
      res.json(pendingSubmissions);
    } catch (error) {
      console.error("Error fetching pending submissions:", error);
      res.status(500).json({ message: "Failed to fetch pending submissions" });
    }
  });

  app.post('/api/admin/approve/:type/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { type, id } = req.params;
      const { approved } = req.body;

      await storage.approveSubmission(type, parseInt(id), approved);
      res.json({ success: true });
    } catch (error) {
      console.error("Error approving submission:", error);
      res.status(500).json({ message: "Failed to approve submission" });
    }
  });

  app.post('/api/admin/tools/:id/featured', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const toolId = parseInt(req.params.id);
      const { featured, days = 30 } = req.body;

      await storage.setToolFeatured(toolId, featured, days);
      res.json({ success: true });
    } catch (error) {
      console.error("Error setting tool featured status:", error);
      res.status(500).json({ message: "Failed to set tool featured status" });
    }
  });

  app.post('/api/admin/tools/:id/hot', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const toolId = parseInt(req.params.id);
      const { hot } = req.body;

      await storage.setToolHot(toolId, hot);
      res.json({ success: true });
    } catch (error) {
      console.error("Error setting tool hot status:", error);
      res.status(500).json({ message: "Failed to set tool hot status" });
    }
  });

  // Payment routes (Razorpay integration placeholder)
  app.post('/api/payments/create-order', isAuthenticated, async (req: any, res) => {
    try {
      const { toolId, amount = 10000 } = req.body; // amount in paise (₹100)
      const userId = req.user.claims.sub;

      // TODO: Integrate with Razorpay
      // const razorpayOrderId = await createRazorpayOrder(amount);
      
      const payment = await storage.createPayment({
        toolId,
        userId: userId as string,
        amount: (amount / 100).toString(), // Convert paise to rupees
        status: "pending",
      });

      res.json({ 
        orderId: `order_${payment.id}`, // This would be the actual Razorpay order ID
        amount,
        currency: "INR"
      });
    } catch (error) {
      console.error("Error creating payment order:", error);
      res.status(500).json({ message: "Failed to create payment order" });
    }
  });

  app.post('/api/payments/verify', isAuthenticated, async (req: any, res) => {
    try {
      const { paymentId, orderId, signature } = req.body;
      
      // TODO: Verify Razorpay payment signature
      // const isValid = verifyRazorpaySignature(paymentId, orderId, signature);
      
      // For now, assume payment is valid
      await storage.completePayment(orderId, paymentId);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({ message: "Failed to verify payment" });
    }
  });

  // Admin routes - Category management
  app.get("/api/admin/categories", isAdmin, async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/admin/categories", isAdmin, async (req, res) => {
    try {
      const data = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(data);
      res.json(category);
    } catch (error: any) {
      console.error("Error creating category:", error);
      if (error.name === "ZodError") {
        res.status(400).json({ message: "Invalid category data" });
      } else {
        res.status(500).json({ message: "Failed to create category" });
      }
    }
  });

  app.put("/api/admin/categories/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, data);
      res.json(category);
    } catch (error: any) {
      console.error("Error updating category:", error);
      if (error.name === "ZodError") {
        res.status(400).json({ message: "Invalid category data" });
      } else {
        res.status(500).json({ message: "Failed to update category" });
      }
    }
  });

  app.delete("/api/admin/categories/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCategory(id);
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Admin routes - Tool management
  app.get("/api/admin/tools", isAdmin, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;
      
      const tools = await storage.getTools({
        limit,
        offset,
        category: req.query.category as string,
        featured: req.query.featured === "true",
        hot: req.query.hot === "true",
        sort: req.query.sort as string,
      });
      res.json(tools);
    } catch (error) {
      console.error("Error fetching tools:", error);
      res.status(500).json({ message: "Failed to fetch tools" });
    }
  });

  app.delete("/api/admin/tools/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTool(id);
      res.json({ message: "Tool deleted successfully" });
    } catch (error) {
      console.error("Error deleting tool:", error);
      res.status(500).json({ message: "Failed to delete tool" });
    }
  });

  // Admin routes - News management
  app.delete("/api/admin/news/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteNews(id);
      res.json({ message: "News deleted successfully" });
    } catch (error) {
      console.error("Error deleting news:", error);
      res.status(500).json({ message: "Failed to delete news" });
    }
  });

  // Admin routes - Blog management
  app.delete("/api/admin/blogs/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBlog(id);
      res.json({ message: "Blog deleted successfully" });
    } catch (error) {
      console.error("Error deleting blog:", error);
      res.status(500).json({ message: "Failed to delete blog" });
    }
  });

  // Admin routes - Video management
  app.delete("/api/admin/videos/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteVideo(id);
      res.json({ message: "Video deleted successfully" });
    } catch (error) {
      console.error("Error deleting video:", error);
      res.status(500).json({ message: "Failed to delete video" });
    }
  });

  // Admin routes - User management
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put("/api/admin/users/:id/admin", isAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      await storage.toggleUserAdmin(userId);
      res.json({ message: "User admin status updated" });
    } catch (error) {
      console.error("Error updating user admin status:", error);
      res.status(500).json({ message: "Failed to update user admin status" });
    }
  });

  // Admin routes - Pending submissions
  app.get("/api/admin/pending", isAdmin, async (req, res) => {
    try {
      const pending = await storage.getPendingSubmissions();
      res.json(pending);
    } catch (error) {
      console.error("Error fetching pending submissions:", error);
      res.status(500).json({ message: "Failed to fetch pending submissions" });
    }
  });

  app.put("/api/admin/approve/:type/:id", isAdmin, async (req, res) => {
    try {
      const type = req.params.type;
      const id = parseInt(req.params.id);
      const { approved } = req.body;
      await storage.approveSubmission(type, id, approved);
      res.json({ message: "Submission status updated" });
    } catch (error) {
      console.error("Error updating submission status:", error);
      res.status(500).json({ message: "Failed to update submission status" });
    }
  });

  // Blog comments routes
  app.get("/api/blogs/:id/comments", async (req, res) => {
    try {
      const blogId = parseInt(req.params.id);
      const comments = await storage.getBlogComments(blogId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching blog comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/blogs/:id/comments", isAuthenticated, async (req: any, res) => {
    try {
      const blogId = parseInt(req.params.id);
      const userId = req.user?.claims?.sub;
      const { content } = req.body;
      
      const comment = await storage.createBlogComment({
        blogId,
        userId,
        content,
      });
      res.json(comment);
    } catch (error) {
      console.error("Error creating blog comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
