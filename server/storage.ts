import {
  users,
  tools,
  news,
  blogs,
  videos,
  subscriptions,
  payments,
  userLikes,
  blogComments,
  type User,
  type UpsertUser,
  type Tool,
  type InsertTool,
  type News,
  type InsertNews,
  type Blog,
  type InsertBlog,
  type Video,
  type InsertVideo,
  type Subscription,
  type InsertSubscription,
  type Payment,
  type InsertPayment,
  type UserLike,
  type InsertUserLike,
  categories,
  type Category,
  type InsertCategory,
} from "./shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, or, like, sql, count } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Tool operations
  getTools(options: {
    category?: string;
    featured?: boolean;
    hot?: boolean;
    limit: number;
    offset: number;
    sort?: string;
  }): Promise<{ items: Tool[]; total: number }>;
  getToolById(id: number): Promise<Tool | undefined>;
  getToolBySlug(slug: string): Promise<Tool | undefined>;
  searchTools(options: {
    query: string;
    limit: number;
    offset: number;
  }): Promise<{ items: Tool[]; total: number }>;
  createTool(tool: InsertTool): Promise<Tool>;
  updateTool(id: number, tool: Partial<InsertTool>): Promise<Tool>;
  getSimilarTools(toolId: number): Promise<Tool[]>;
  setToolFeatured(toolId: number, featured: boolean, days?: number): Promise<void>;
  setToolHot(toolId: number, hot: boolean): Promise<void>;

  // User likes
  toggleToolLike(userId: string, toolId: number): Promise<void>;
  getUserLikedTools(userId: string): Promise<Tool[]>;
  getUserSubmissions(userId: string): Promise<{
    tools: Tool[];
    news: News[];
    blogs: Blog[];
    videos: Video[];
  }>;

  // News operations
  getNews(options: { limit: number; offset: number }): Promise<{ items: News[]; total: number }>;
  createNews(news: InsertNews): Promise<News>;

  // Blog operations
  getBlogs(options: { limit: number; offset: number }): Promise<{ items: Blog[]; total: number }>;
  getBlogBySlug(slug: string): Promise<Blog | undefined>;
  createBlog(blog: InsertBlog): Promise<Blog>;

  // Video operations
  getVideos(options: { limit: number; offset: number }): Promise<{ items: Video[]; total: number }>;
  createVideo(video: InsertVideo): Promise<Video>;

  // Newsletter operations
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;

  // Category operations
  getCategories(): Promise<{ name: string; count: number }[]>;

  // Category operations
  getAllCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;

  // Admin operations
  getPendingSubmissions(): Promise<{
    tools: Tool[];
    news: News[];
    blogs: Blog[];
    videos: Video[];
  }>;
  approveSubmission(type: string, id: number, approved: boolean): Promise<void>;
  deleteTool(id: number): Promise<void>;
  deleteNews(id: number): Promise<void>;
  deleteBlog(id: number): Promise<void>;
  deleteVideo(id: number): Promise<void>;
  getAllUsers(): Promise<User[]>;
  toggleUserAdmin(userId: string): Promise<void>;

  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  completePayment(orderId: string, paymentId: string): Promise<void>;

  // Blog comment operations
  getBlogComments(blogId: number): Promise<any[]>;
  createBlogComment(comment: { blogId: number; userId: string; content: string }): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Tool operations
  async getTools(options: {
    category?: string;
    featured?: boolean;
    hot?: boolean;
    limit: number;
    offset: number;
    sort?: string;
  }): Promise<{ items: Tool[]; total: number }> {
    const conditions = [eq(tools.isApproved, true)];
    
    if (options.category) {
      conditions.push(eq(tools.category, options.category));
    }
    if (options.featured) {
      conditions.push(eq(tools.isFeatured, true));
    }
    if (options.hot) {
      conditions.push(eq(tools.isHot, true));
    }

    let orderBy;
    switch (options.sort) {
      case "popular":
        orderBy = desc(tools.likes);
        break;
      case "name":
        orderBy = asc(tools.name);
        break;
      case "likes":
        orderBy = desc(tools.likes);
        break;
      default:
        orderBy = desc(tools.createdAt);
    }

    const [items, totalResult] = await Promise.all([
      db
        .select()
        .from(tools)
        .where(and(...conditions))
        .orderBy(orderBy)
        .limit(options.limit)
        .offset(options.offset),
      db
        .select({ count: count() })
        .from(tools)
        .where(and(...conditions))
    ]);

    return {
      items,
      total: totalResult[0]?.count || 0,
    };
  }

  async getToolById(id: number): Promise<Tool | undefined> {
    const [tool] = await db
      .select()
      .from(tools)
      .where(and(eq(tools.id, id), eq(tools.isApproved, true)));
    return tool;
  }

  async getToolBySlug(slug: string): Promise<Tool | undefined> {
    // Get all approved tools and find matching slug
    const allTools = await db
      .select()
      .from(tools)
      .where(eq(tools.isApproved, true));
    
    const tool = allTools.find(tool => {
      const toolSlug = tool.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return toolSlug === slug;
    });
    
    return tool;
  }

  async searchTools(options: {
    query: string;
    limit: number;
    offset: number;
  }): Promise<{ items: Tool[]; total: number }> {
    const searchQuery = options.query.toLowerCase();
    
    // Get all approved tools
    const allTools = await db
      .select()
      .from(tools)
      .where(eq(tools.isApproved, true));
    
    // Search across multiple fields
    const matchingTools = allTools.filter(tool => {
      const searchableContent = [
        tool.name,
        tool.category,
        tool.shortDescription,
        tool.description,
        ...(tool.keyFeatures || []),
        ...(tool.useCases || []),
        ...(tool.tags || []),
        tool.aiTech,
        tool.audience,
        tool.accessType,
        tool.pricingType
      ].filter(Boolean).join(' ').toLowerCase();
      
      // Also search in FAQs
      let faqContent = '';
      if (tool.faqs && Array.isArray(tool.faqs)) {
        faqContent = tool.faqs.map((faq: any) => `${faq.question} ${faq.answer}`).join(' ').toLowerCase();
      }
      
      // Check if query words match content or FAQs
      const queryWords = searchQuery.split(' ').filter(word => word.length > 0);
      return queryWords.some(word => 
        searchableContent.includes(word) || faqContent.includes(word)
      );
    });
    
    // Sort by relevance (prioritize name matches)
    const sortedTools = matchingTools.sort((a, b) => {
      const aNameMatch = a.name.toLowerCase().includes(searchQuery);
      const bNameMatch = b.name.toLowerCase().includes(searchQuery);
      
      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;
      
      // Secondary sort by featured status
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      
      return 0;
    });
    
    const total = sortedTools.length;
    const items = sortedTools.slice(options.offset, options.offset + options.limit);
    
    return { items, total };
  }

  async createTool(tool: InsertTool): Promise<Tool> {
    const [created] = await db.insert(tools).values(tool).returning();
    return created;
  }

  async updateTool(id: number, tool: Partial<InsertTool>): Promise<Tool> {
    const [updated] = await db
      .update(tools)
      .set({ ...tool, updatedAt: new Date() })
      .where(eq(tools.id, id))
      .returning();
    return updated;
  }

  async getSimilarTools(toolId: number): Promise<Tool[]> {
    const tool = await this.getToolById(toolId);
    if (!tool) return [];

    const similarTools = await db
      .select()
      .from(tools)
      .where(
        and(
          eq(tools.isApproved, true),
          or(
            tool.category ? eq(tools.category, tool.category) : sql`1=0`,
            tool.pricingType ? eq(tools.pricingType, tool.pricingType) : sql`1=0`,
            tool.aiTech ? eq(tools.aiTech, tool.aiTech) : sql`1=0`
          )
        )
      )
      .limit(6);

    return similarTools.filter(t => t.id !== toolId);
  }

  async setToolFeatured(toolId: number, featured: boolean, days = 30): Promise<void> {
    const featuredUntil = featured ? new Date(Date.now() + days * 24 * 60 * 60 * 1000) : null;
    
    await db
      .update(tools)
      .set({ 
        isFeatured: featured,
        featuredUntil,
        updatedAt: new Date()
      })
      .where(eq(tools.id, toolId));
  }

  async setToolHot(toolId: number, hot: boolean): Promise<void> {
    await db
      .update(tools)
      .set({ 
        isHot: hot,
        updatedAt: new Date()
      })
      .where(eq(tools.id, toolId));
  }

  // User likes
  async toggleToolLike(userId: string, toolId: number): Promise<void> {
    const existingLike = await db
      .select()
      .from(userLikes)
      .where(and(eq(userLikes.userId, userId), eq(userLikes.toolId, toolId)))
      .limit(1);

    if (existingLike.length > 0) {
      // Unlike
      await db
        .delete(userLikes)
        .where(and(eq(userLikes.userId, userId), eq(userLikes.toolId, toolId)));
      
      await db
        .update(tools)
        .set({ likes: sql`${tools.likes} - 1` })
        .where(eq(tools.id, toolId));
    } else {
      // Like
      await db.insert(userLikes).values({ userId, toolId });
      
      await db
        .update(tools)
        .set({ likes: sql`${tools.likes} + 1` })
        .where(eq(tools.id, toolId));
    }
  }

  async getUserLikedTools(userId: string): Promise<Tool[]> {
    const likedTools = await db
      .select({
        id: tools.id,
        name: tools.name,
        description: tools.description,
        shortDescription: tools.shortDescription,
        website: tools.website,
        logoUrl: tools.logoUrl,
        category: tools.category,
        tags: tools.tags,
        keyFeatures: tools.keyFeatures,
        faqs: tools.faqs,
        pricingType: tools.pricingType,
        accessType: tools.accessType,
        aiTech: tools.aiTech,
        audience: tools.audience,
        isFeatured: tools.isFeatured,
        isHot: tools.isHot,
        featuredUntil: tools.featuredUntil,
        likes: tools.likes,
        submittedBy: tools.submittedBy,
        isApproved: tools.isApproved,
        createdAt: tools.createdAt,
        updatedAt: tools.updatedAt,
      })
      .from(userLikes)
      .innerJoin(tools, eq(userLikes.toolId, tools.id))
      .where(eq(userLikes.userId, userId));

    return likedTools;
  }

  async getUserSubmissions(userId: string): Promise<{
    tools: Tool[];
    news: News[];
    blogs: Blog[];
    videos: Video[];
  }> {
    const [userTools, userNews, userBlogs, userVideos] = await Promise.all([
      db.select().from(tools).where(eq(tools.submittedBy, userId)),
      db.select().from(news).where(eq(news.submittedBy, userId)),
      db.select().from(blogs).where(eq(blogs.submittedBy, userId)),
      db.select().from(videos).where(eq(videos.submittedBy, userId)),
    ]);

    return {
      tools: userTools,
      news: userNews,
      blogs: userBlogs,
      videos: userVideos,
    };
  }

  // News operations
  async getNews(options: { limit: number; offset: number }): Promise<{ items: News[]; total: number }> {
    const [items, totalResult] = await Promise.all([
      db
        .select()
        .from(news)
        .where(eq(news.isApproved, true))
        .orderBy(desc(news.publishDate))
        .limit(options.limit)
        .offset(options.offset),
      db
        .select({ count: count() })
        .from(news)
        .where(eq(news.isApproved, true))
    ]);

    return {
      items,
      total: totalResult[0]?.count || 0,
    };
  }

  async createNews(newsItem: InsertNews): Promise<News> {
    const [created] = await db.insert(news).values(newsItem).returning();
    return created;
  }

  // Blog operations
  async getBlogs(options: { limit: number; offset: number }): Promise<{ items: Blog[]; total: number }> {
    const [items, totalResult] = await Promise.all([
      db
        .select()
        .from(blogs)
        .where(and(eq(blogs.isApproved, true), eq(blogs.isPublished, true)))
        .orderBy(desc(blogs.publishDate))
        .limit(options.limit)
        .offset(options.offset),
      db
        .select({ count: count() })
        .from(blogs)
        .where(and(eq(blogs.isApproved, true), eq(blogs.isPublished, true)))
    ]);

    return {
      items,
      total: totalResult[0]?.count || 0,
    };
  }

  async getBlogBySlug(slug: string): Promise<Blog | undefined> {
    const [blog] = await db
      .select()
      .from(blogs)
      .where(
        and(
          eq(blogs.slug, slug),
          eq(blogs.isApproved, true),
          eq(blogs.isPublished, true)
        )
      );
    return blog;
  }

  async createBlog(blog: InsertBlog): Promise<Blog> {
    const [created] = await db.insert(blogs).values(blog).returning();
    return created;
  }

  // Video operations
  async getVideos(options: { limit: number; offset: number }): Promise<{ items: Video[]; total: number }> {
    const [items, totalResult] = await Promise.all([
      db
        .select()
        .from(videos)
        .where(eq(videos.isApproved, true))
        .orderBy(desc(videos.createdAt))
        .limit(options.limit)
        .offset(options.offset),
      db
        .select({ count: count() })
        .from(videos)
        .where(eq(videos.isApproved, true))
    ]);

    return {
      items,
      total: totalResult[0]?.count || 0,
    };
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    const [created] = await db.insert(videos).values(video).returning();
    return created;
  }

  // Newsletter operations
  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [created] = await db.insert(subscriptions).values(subscription).returning();
    return created;
  }

  // Category operations
  async getCategories(): Promise<{ name: string; count: number }[]> {
    const categories = await db
      .select({
        name: tools.category,
        count: count()
      })
      .from(tools)
      .where(eq(tools.isApproved, true))
      .groupBy(tools.category)
      .orderBy(desc(count()));

    return categories.map(cat => ({ name: cat.name, count: cat.count }));
  }

  // Admin operations
  async getPendingSubmissions(): Promise<{
    tools: Tool[];
    news: News[];
    blogs: Blog[];
    videos: Video[];
  }> {
    const [pendingTools, pendingNews, pendingBlogs, pendingVideos] = await Promise.all([
      db.select().from(tools).where(eq(tools.isApproved, false)),
      db.select().from(news).where(eq(news.isApproved, false)),
      db.select().from(blogs).where(eq(blogs.isApproved, false)),
      db.select().from(videos).where(eq(videos.isApproved, false)),
    ]);

    return {
      tools: pendingTools,
      news: pendingNews,
      blogs: pendingBlogs,
      videos: pendingVideos,
    };
  }

  async approveSubmission(type: string, id: number, approved: boolean): Promise<void> {
    switch (type) {
      case "tools":
        await db
          .update(tools)
          .set({ isApproved: approved, updatedAt: new Date() })
          .where(eq(tools.id, id));
        break;
      case "news":
        await db
          .update(news)
          .set({ isApproved: approved })
          .where(eq(news.id, id));
        break;
      case "blogs":
        await db
          .update(blogs)
          .set({ isApproved: approved, updatedAt: new Date() })
          .where(eq(blogs.id, id));
        break;
      case "videos":
        await db
          .update(videos)
          .set({ isApproved: approved })
          .where(eq(videos.id, id));
        break;
    }
  }

  // Payment operations
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [created] = await db.insert(payments).values(payment).returning();
    return created;
  }

  async completePayment(orderId: string, paymentId: string): Promise<void> {
    const paymentRecord = await db
      .select()
      .from(payments)
      .where(eq(payments.razorpayOrderId, orderId))
      .limit(1);

    if (paymentRecord.length > 0) {
      const payment = paymentRecord[0];
      
      // Update payment status
      await db
        .update(payments)
        .set({
          status: "completed",
          razorpayPaymentId: paymentId,
        })
        .where(eq(payments.id, payment.id));

      // Set tool as featured
      await this.setToolFeatured(payment.toolId, true, payment.featuredDays ?? 30);
    }
  }

  // Category operations
  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.name));
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values(category)
      .returning();
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category> {
    const [updatedCategory] = await db
      .update(categories)
      .set({ ...category, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Admin delete operations
  async deleteTool(id: number): Promise<void> {
    // First delete associated user likes
    await db.delete(userLikes).where(eq(userLikes.toolId, id));
    // Then delete the tool
    await db.delete(tools).where(eq(tools.id, id));
  }

  async deleteNews(id: number): Promise<void> {
    await db.delete(news).where(eq(news.id, id));
  }

  async deleteBlog(id: number): Promise<void> {
    await db.delete(blogs).where(eq(blogs.id, id));
  }

  async deleteVideo(id: number): Promise<void> {
    await db.delete(videos).where(eq(videos.id, id));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async toggleUserAdmin(userId: string): Promise<void> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (user) {
      await db
        .update(users)
        .set({ isAdmin: !user.isAdmin, updatedAt: new Date() })
        .where(eq(users.id, userId));
    }
  }

  async getBlogComments(blogId: number): Promise<any[]> {
    const commentsResult = await db
      .select({
        id: blogComments.id,
        content: blogComments.content,
        createdAt: blogComments.createdAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(blogComments)
      .leftJoin(users, eq(blogComments.userId, users.id))
      .where(eq(blogComments.blogId, blogId))
      .orderBy(desc(blogComments.createdAt));
    
    return commentsResult;
  }

  async createBlogComment(comment: { blogId: number; userId: string; content: string }): Promise<any> {
    const [newComment] = await db
      .insert(blogComments)
      .values(comment)
      .returning();
    return newComment;
  }
}

export const storage = new DatabaseStorage();
