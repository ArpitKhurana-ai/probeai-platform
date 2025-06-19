var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// ../shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  blogComments: () => blogComments,
  blogs: () => blogs,
  categories: () => categories,
  insertBlogSchema: () => insertBlogSchema,
  insertCategorySchema: () => insertCategorySchema,
  insertNewsSchema: () => insertNewsSchema,
  insertPaymentSchema: () => insertPaymentSchema,
  insertSubscriptionSchema: () => insertSubscriptionSchema,
  insertToolSchema: () => insertToolSchema,
  insertUserLikeSchema: () => insertUserLikeSchema,
  insertVideoSchema: () => insertVideoSchema,
  news: () => news,
  payments: () => payments,
  paymentsRelations: () => paymentsRelations,
  sessions: () => sessions,
  subscriptions: () => subscriptions,
  tools: () => tools,
  toolsRelations: () => toolsRelations,
  userLikes: () => userLikes,
  userLikesRelations: () => userLikesRelations,
  users: () => users,
  usersRelations: () => usersRelations,
  videos: () => videos
});
import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal
} from "drizzle-orm/pg-core";
import { z } from "zod";
import { relations } from "drizzle-orm";
var sessions, users, tools, userLikes, news, blogs, videos, categories, subscriptions, payments, blogComments, usersRelations, toolsRelations, userLikesRelations, paymentsRelations, insertToolSchema, insertNewsSchema, insertBlogSchema, insertVideoSchema, insertSubscriptionSchema, insertPaymentSchema, insertUserLikeSchema, insertCategorySchema;
var init_schema = __esm({
  "../shared/schema.ts"() {
    "use strict";
    sessions = pgTable(
      "sessions",
      {
        sid: varchar("sid").primaryKey(),
        sess: jsonb("sess").notNull(),
        expire: timestamp("expire").notNull()
      },
      (table) => [index("IDX_session_expire").on(table.expire)]
    );
    users = pgTable("users", {
      id: varchar("id").primaryKey().notNull(),
      email: varchar("email").unique(),
      firstName: varchar("first_name"),
      lastName: varchar("last_name"),
      profileImageUrl: varchar("profile_image_url"),
      isAdmin: boolean("is_admin").default(false),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    tools = pgTable("tools", {
      id: serial("id").primaryKey(),
      name: varchar("name", { length: 255 }).notNull(),
      description: text("description").notNull(),
      shortDescription: varchar("short_description", { length: 500 }),
      website: varchar("website", { length: 500 }),
      logoUrl: varchar("logo_url", { length: 500 }),
      category: varchar("category", { length: 100 }).notNull(),
      tags: text("tags").array(),
      keyFeatures: text("key_features").array(),
      useCases: text("use_cases").array(),
      faqs: jsonb("faqs"),
      // Array of {question, answer}
      pricingType: varchar("pricing_type", { length: 50 }),
      // Free, Freemium, Paid, Open Source
      accessType: varchar("access_type", { length: 50 }),
      // Web App, API, Chrome Extension, etc.
      aiTech: varchar("ai_tech", { length: 50 }),
      // GPT-4, SDXL, etc.
      audience: varchar("audience", { length: 50 }),
      // Developers, Marketers, etc.
      isFeatured: boolean("is_featured").default(false),
      isHot: boolean("is_hot").default(false),
      featuredUntil: timestamp("featured_until"),
      likes: integer("likes").default(0),
      submittedBy: varchar("submitted_by"),
      isApproved: boolean("is_approved").default(false),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    userLikes = pgTable("user_likes", {
      id: serial("id").primaryKey(),
      userId: varchar("user_id").notNull(),
      toolId: integer("tool_id").notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    news = pgTable("news", {
      id: serial("id").primaryKey(),
      title: varchar("title", { length: 500 }).notNull(),
      excerpt: text("excerpt"),
      source: varchar("source", { length: 100 }).notNull(),
      sourceUrl: varchar("source_url", { length: 500 }).notNull(),
      publishDate: timestamp("publish_date").notNull(),
      category: varchar("category", { length: 100 }),
      submittedBy: varchar("submitted_by"),
      isApproved: boolean("is_approved").default(false),
      createdAt: timestamp("created_at").defaultNow()
    });
    blogs = pgTable("blogs", {
      id: serial("id").primaryKey(),
      title: varchar("title", { length: 500 }).notNull(),
      slug: varchar("slug", { length: 500 }).notNull().unique(),
      content: text("content").notNull(),
      excerpt: text("excerpt"),
      imageUrl: varchar("image_url", { length: 500 }),
      author: varchar("author", { length: 100 }).notNull(),
      tags: text("tags").array(),
      metaTitle: varchar("meta_title", { length: 500 }),
      metaDescription: varchar("meta_description", { length: 500 }),
      ogTitle: varchar("og_title", { length: 500 }),
      ogDescription: varchar("og_description", { length: 500 }),
      readTime: integer("read_time"),
      // in minutes
      isPublished: boolean("is_published").default(false),
      publishDate: timestamp("publish_date"),
      submittedBy: varchar("submitted_by"),
      isApproved: boolean("is_approved").default(false),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    videos = pgTable("videos", {
      id: serial("id").primaryKey(),
      title: varchar("title", { length: 500 }).notNull(),
      description: text("description"),
      videoUrl: varchar("video_url", { length: 500 }).notNull(),
      // YouTube/Vimeo URL
      thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
      channel: varchar("channel", { length: 100 }),
      duration: varchar("duration", { length: 20 }),
      // e.g., "15:42"
      views: varchar("views", { length: 20 }),
      // e.g., "45K views"
      category: varchar("category", { length: 100 }),
      tags: text("tags").array(),
      submittedBy: varchar("submitted_by"),
      isApproved: boolean("is_approved").default(false),
      createdAt: timestamp("created_at").defaultNow()
    });
    categories = pgTable("categories", {
      id: serial("id").primaryKey(),
      name: varchar("name", { length: 100 }).notNull().unique(),
      slug: varchar("slug", { length: 100 }).notNull().unique(),
      description: text("description"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    subscriptions = pgTable("subscriptions", {
      id: serial("id").primaryKey(),
      email: varchar("email", { length: 255 }).notNull().unique(),
      name: varchar("name", { length: 255 }),
      isActive: boolean("is_active").default(true),
      source: varchar("source", { length: 100 }),
      // e.g., "homepage", "blog"
      createdAt: timestamp("created_at").defaultNow()
    });
    payments = pgTable("payments", {
      id: serial("id").primaryKey(),
      toolId: integer("tool_id").notNull(),
      userId: varchar("user_id").notNull(),
      amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
      currency: varchar("currency", { length: 3 }).default("INR"),
      razorpayPaymentId: varchar("razorpay_payment_id", { length: 100 }),
      razorpayOrderId: varchar("razorpay_order_id", { length: 100 }),
      status: varchar("status", { length: 50 }).default("pending"),
      // pending, completed, failed
      featuredDays: integer("featured_days").default(30),
      createdAt: timestamp("created_at").defaultNow()
    });
    blogComments = pgTable("blog_comments", {
      id: serial("id").primaryKey(),
      blogId: integer("blog_id").notNull(),
      userId: varchar("user_id").notNull(),
      content: text("content").notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    usersRelations = relations(users, ({ many }) => ({
      likes: many(userLikes),
      submittedTools: many(tools),
      payments: many(payments)
    }));
    toolsRelations = relations(tools, ({ many, one }) => ({
      likes: many(userLikes),
      submitter: one(users, {
        fields: [tools.submittedBy],
        references: [users.id]
      }),
      payments: many(payments)
    }));
    userLikesRelations = relations(userLikes, ({ one }) => ({
      user: one(users, {
        fields: [userLikes.userId],
        references: [users.id]
      }),
      tool: one(tools, {
        fields: [userLikes.toolId],
        references: [tools.id]
      })
    }));
    paymentsRelations = relations(payments, ({ one }) => ({
      tool: one(tools, {
        fields: [payments.toolId],
        references: [tools.id]
      }),
      user: one(users, {
        fields: [payments.userId],
        references: [users.id]
      })
    }));
    insertToolSchema = z.object({
      name: z.string().min(1),
      description: z.string().min(1),
      url: z.string().url(),
      imageUrl: z.string().url().optional(),
      category: z.string().min(1),
      pricing: z.string().min(1),
      features: z.array(z.string()).default([]),
      tags: z.array(z.string()).default([]),
      submittedBy: z.string().optional(),
      approved: z.boolean().default(false),
      featured: z.boolean().default(false),
      hot: z.boolean().default(false)
    });
    insertNewsSchema = z.object({
      title: z.string().min(1),
      content: z.string().min(1),
      url: z.string().url(),
      imageUrl: z.string().url().optional(),
      source: z.string().min(1),
      submittedBy: z.string().optional(),
      approved: z.boolean().default(false)
    });
    insertBlogSchema = z.object({
      title: z.string().min(1),
      content: z.string().min(1),
      slug: z.string().min(1),
      excerpt: z.string().optional(),
      imageUrl: z.string().url().optional(),
      tags: z.array(z.string()).default([]),
      author: z.string().min(1),
      submittedBy: z.string().optional(),
      approved: z.boolean().default(false)
    });
    insertVideoSchema = z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      url: z.string().url(),
      thumbnailUrl: z.string().url().optional(),
      duration: z.string().optional(),
      submittedBy: z.string().optional(),
      approved: z.boolean().default(false)
    });
    insertSubscriptionSchema = z.object({
      email: z.string().email(),
      name: z.string().optional()
    });
    insertPaymentSchema = z.object({
      orderId: z.string().min(1),
      paymentId: z.string().optional(),
      amount: z.string().min(1),
      currency: z.string().min(1),
      status: z.string().min(1),
      userId: z.string().min(1)
    });
    insertUserLikeSchema = z.object({
      userId: z.string().min(1),
      toolId: z.number().int().positive()
    });
    insertCategorySchema = z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      slug: z.string().min(1),
      color: z.string().optional()
    });
  }
});

// db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
var pool, db;
var init_db = __esm({
  "db.ts"() {
    "use strict";
    init_schema();
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle(pool, { schema: schema_exports });
  }
});

// storage.ts
var storage_exports = {};
__export(storage_exports, {
  DatabaseStorage: () => DatabaseStorage,
  storage: () => storage
});
import { eq, desc, asc, and, or, sql, count } from "drizzle-orm";
var DatabaseStorage, storage;
var init_storage = __esm({
  "storage.ts"() {
    "use strict";
    init_schema();
    init_db();
    DatabaseStorage = class {
      // User operations (mandatory for Replit Auth)
      async getUser(id) {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user;
      }
      async upsertUser(userData) {
        const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
          target: users.id,
          set: {
            ...userData,
            updatedAt: /* @__PURE__ */ new Date()
          }
        }).returning();
        return user;
      }
      // Tool operations
      async getTools(options) {
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
          db.select().from(tools).where(and(...conditions)).orderBy(orderBy).limit(options.limit).offset(options.offset),
          db.select({ count: count() }).from(tools).where(and(...conditions))
        ]);
        return {
          items,
          total: totalResult[0]?.count || 0
        };
      }
      async getToolById(id) {
        const [tool] = await db.select().from(tools).where(and(eq(tools.id, id), eq(tools.isApproved, true)));
        return tool;
      }
      async getToolBySlug(slug) {
        const allTools = await db.select().from(tools).where(eq(tools.isApproved, true));
        const tool = allTools.find((tool2) => {
          const toolSlug = tool2.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          return toolSlug === slug;
        });
        return tool;
      }
      async searchTools(options) {
        const searchQuery = options.query.toLowerCase();
        const allTools = await db.select().from(tools).where(eq(tools.isApproved, true));
        const matchingTools = allTools.filter((tool) => {
          const searchableContent = [
            tool.name,
            tool.category,
            tool.shortDescription,
            tool.description,
            ...tool.keyFeatures || [],
            ...tool.useCases || [],
            ...tool.tags || [],
            tool.aiTech,
            tool.audience,
            tool.accessType,
            tool.pricingType
          ].filter(Boolean).join(" ").toLowerCase();
          let faqContent = "";
          if (tool.faqs && Array.isArray(tool.faqs)) {
            faqContent = tool.faqs.map((faq) => `${faq.question} ${faq.answer}`).join(" ").toLowerCase();
          }
          const queryWords = searchQuery.split(" ").filter((word) => word.length > 0);
          return queryWords.some(
            (word) => searchableContent.includes(word) || faqContent.includes(word)
          );
        });
        const sortedTools = matchingTools.sort((a, b) => {
          const aNameMatch = a.name.toLowerCase().includes(searchQuery);
          const bNameMatch = b.name.toLowerCase().includes(searchQuery);
          if (aNameMatch && !bNameMatch) return -1;
          if (!aNameMatch && bNameMatch) return 1;
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return 0;
        });
        const total = sortedTools.length;
        const items = sortedTools.slice(options.offset, options.offset + options.limit);
        return { items, total };
      }
      async createTool(tool) {
        const [created] = await db.insert(tools).values(tool).returning();
        return created;
      }
      async updateTool(id, tool) {
        const [updated] = await db.update(tools).set({ ...tool, updatedAt: /* @__PURE__ */ new Date() }).where(eq(tools.id, id)).returning();
        return updated;
      }
      async getSimilarTools(toolId) {
        const tool = await this.getToolById(toolId);
        if (!tool) return [];
        const similarTools = await db.select().from(tools).where(
          and(
            eq(tools.isApproved, true),
            or(
              tool.category ? eq(tools.category, tool.category) : sql`1=0`,
              tool.pricingType ? eq(tools.pricingType, tool.pricingType) : sql`1=0`,
              tool.aiTech ? eq(tools.aiTech, tool.aiTech) : sql`1=0`
            )
          )
        ).limit(6);
        return similarTools.filter((t) => t.id !== toolId);
      }
      async setToolFeatured(toolId, featured, days = 30) {
        const featuredUntil = featured ? new Date(Date.now() + days * 24 * 60 * 60 * 1e3) : null;
        await db.update(tools).set({
          isFeatured: featured,
          featuredUntil,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(tools.id, toolId));
      }
      async setToolHot(toolId, hot) {
        await db.update(tools).set({
          isHot: hot,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(tools.id, toolId));
      }
      // User likes
      async toggleToolLike(userId, toolId) {
        const existingLike = await db.select().from(userLikes).where(and(eq(userLikes.userId, userId), eq(userLikes.toolId, toolId))).limit(1);
        if (existingLike.length > 0) {
          await db.delete(userLikes).where(and(eq(userLikes.userId, userId), eq(userLikes.toolId, toolId)));
          await db.update(tools).set({ likes: sql`${tools.likes} - 1` }).where(eq(tools.id, toolId));
        } else {
          await db.insert(userLikes).values({ userId, toolId });
          await db.update(tools).set({ likes: sql`${tools.likes} + 1` }).where(eq(tools.id, toolId));
        }
      }
      async getUserLikedTools(userId) {
        const likedTools = await db.select({
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
          updatedAt: tools.updatedAt
        }).from(userLikes).innerJoin(tools, eq(userLikes.toolId, tools.id)).where(eq(userLikes.userId, userId));
        return likedTools;
      }
      async getUserSubmissions(userId) {
        const [userTools, userNews, userBlogs, userVideos] = await Promise.all([
          db.select().from(tools).where(eq(tools.submittedBy, userId)),
          db.select().from(news).where(eq(news.submittedBy, userId)),
          db.select().from(blogs).where(eq(blogs.submittedBy, userId)),
          db.select().from(videos).where(eq(videos.submittedBy, userId))
        ]);
        return {
          tools: userTools,
          news: userNews,
          blogs: userBlogs,
          videos: userVideos
        };
      }
      // News operations
      async getNews(options) {
        const [items, totalResult] = await Promise.all([
          db.select().from(news).where(eq(news.isApproved, true)).orderBy(desc(news.publishDate)).limit(options.limit).offset(options.offset),
          db.select({ count: count() }).from(news).where(eq(news.isApproved, true))
        ]);
        return {
          items,
          total: totalResult[0]?.count || 0
        };
      }
      async createNews(newsItem) {
        const [created] = await db.insert(news).values(newsItem).returning();
        return created;
      }
      // Blog operations
      async getBlogs(options) {
        const [items, totalResult] = await Promise.all([
          db.select().from(blogs).where(and(eq(blogs.isApproved, true), eq(blogs.isPublished, true))).orderBy(desc(blogs.publishDate)).limit(options.limit).offset(options.offset),
          db.select({ count: count() }).from(blogs).where(and(eq(blogs.isApproved, true), eq(blogs.isPublished, true)))
        ]);
        return {
          items,
          total: totalResult[0]?.count || 0
        };
      }
      async getBlogBySlug(slug) {
        const [blog] = await db.select().from(blogs).where(
          and(
            eq(blogs.slug, slug),
            eq(blogs.isApproved, true),
            eq(blogs.isPublished, true)
          )
        );
        return blog;
      }
      async createBlog(blog) {
        const [created] = await db.insert(blogs).values(blog).returning();
        return created;
      }
      // Video operations
      async getVideos(options) {
        const [items, totalResult] = await Promise.all([
          db.select().from(videos).where(eq(videos.isApproved, true)).orderBy(desc(videos.createdAt)).limit(options.limit).offset(options.offset),
          db.select({ count: count() }).from(videos).where(eq(videos.isApproved, true))
        ]);
        return {
          items,
          total: totalResult[0]?.count || 0
        };
      }
      async createVideo(video) {
        const [created] = await db.insert(videos).values(video).returning();
        return created;
      }
      // Newsletter operations
      async createSubscription(subscription) {
        const [created] = await db.insert(subscriptions).values(subscription).returning();
        return created;
      }
      // Category operations
      async getCategories() {
        const categories2 = await db.select({
          name: tools.category,
          count: count()
        }).from(tools).where(eq(tools.isApproved, true)).groupBy(tools.category).orderBy(desc(count()));
        return categories2.map((cat) => ({ name: cat.name, count: cat.count }));
      }
      // Admin operations
      async getPendingSubmissions() {
        const [pendingTools, pendingNews, pendingBlogs, pendingVideos] = await Promise.all([
          db.select().from(tools).where(eq(tools.isApproved, false)),
          db.select().from(news).where(eq(news.isApproved, false)),
          db.select().from(blogs).where(eq(blogs.isApproved, false)),
          db.select().from(videos).where(eq(videos.isApproved, false))
        ]);
        return {
          tools: pendingTools,
          news: pendingNews,
          blogs: pendingBlogs,
          videos: pendingVideos
        };
      }
      async approveSubmission(type, id, approved) {
        switch (type) {
          case "tools":
            await db.update(tools).set({ isApproved: approved, updatedAt: /* @__PURE__ */ new Date() }).where(eq(tools.id, id));
            break;
          case "news":
            await db.update(news).set({ isApproved: approved }).where(eq(news.id, id));
            break;
          case "blogs":
            await db.update(blogs).set({ isApproved: approved, updatedAt: /* @__PURE__ */ new Date() }).where(eq(blogs.id, id));
            break;
          case "videos":
            await db.update(videos).set({ isApproved: approved }).where(eq(videos.id, id));
            break;
        }
      }
      // Payment operations
      async createPayment(payment) {
        const [created] = await db.insert(payments).values(payment).returning();
        return created;
      }
      async completePayment(orderId, paymentId) {
        const paymentRecord = await db.select().from(payments).where(eq(payments.razorpayOrderId, orderId)).limit(1);
        if (paymentRecord.length > 0) {
          const payment = paymentRecord[0];
          await db.update(payments).set({
            status: "completed",
            razorpayPaymentId: paymentId
          }).where(eq(payments.id, payment.id));
          await this.setToolFeatured(payment.toolId, true, payment.featuredDays ?? 30);
        }
      }
      // Category operations
      async getAllCategories() {
        return await db.select().from(categories).orderBy(asc(categories.name));
      }
      async getCategoryById(id) {
        const [category] = await db.select().from(categories).where(eq(categories.id, id));
        return category;
      }
      async createCategory(category) {
        const [newCategory] = await db.insert(categories).values(category).returning();
        return newCategory;
      }
      async updateCategory(id, category) {
        const [updatedCategory] = await db.update(categories).set({ ...category, updatedAt: /* @__PURE__ */ new Date() }).where(eq(categories.id, id)).returning();
        return updatedCategory;
      }
      async deleteCategory(id) {
        await db.delete(categories).where(eq(categories.id, id));
      }
      // Admin delete operations
      async deleteTool(id) {
        await db.delete(userLikes).where(eq(userLikes.toolId, id));
        await db.delete(tools).where(eq(tools.id, id));
      }
      async deleteNews(id) {
        await db.delete(news).where(eq(news.id, id));
      }
      async deleteBlog(id) {
        await db.delete(blogs).where(eq(blogs.id, id));
      }
      async deleteVideo(id) {
        await db.delete(videos).where(eq(videos.id, id));
      }
      async getAllUsers() {
        return await db.select().from(users).orderBy(desc(users.createdAt));
      }
      async toggleUserAdmin(userId) {
        const [user] = await db.select().from(users).where(eq(users.id, userId));
        if (user) {
          await db.update(users).set({ isAdmin: !user.isAdmin, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, userId));
        }
      }
      async getBlogComments(blogId) {
        const commentsResult = await db.select({
          id: blogComments.id,
          content: blogComments.content,
          createdAt: blogComments.createdAt,
          user: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            profileImageUrl: users.profileImageUrl
          }
        }).from(blogComments).leftJoin(users, eq(blogComments.userId, users.id)).where(eq(blogComments.blogId, blogId)).orderBy(desc(blogComments.createdAt));
        return commentsResult;
      }
      async createBlogComment(comment) {
        const [newComment] = await db.insert(blogComments).values(comment).returning();
        return newComment;
      }
    };
    storage = new DatabaseStorage();
  }
});

// health.ts
var health_exports = {};
__export(health_exports, {
  healthCheck: () => healthCheck
});
import { sql as sql2 } from "drizzle-orm";
async function healthCheck(req, res) {
  try {
    await db.execute(sql2`SELECT 1`);
    res.json({
      status: "healthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      database: "connected",
      environment: process.env.NODE_ENV || "development"
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      database: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
var init_health = __esm({
  "health.ts"() {
    "use strict";
    init_db();
  }
});

// initialize-algolia.ts
var initialize_algolia_exports = {};
__export(initialize_algolia_exports, {
  getQuerySuggestions: () => getQuerySuggestions,
  initializeAlgolia: () => initializeAlgolia,
  searchTools: () => searchTools
});
async function initializeAlgolia() {
  if (!process.env.ALGOLIA_APP_ID || !process.env.ALGOLIA_API_KEY) {
    console.log("Using database search - Algolia credentials not configured");
    return true;
  }
  try {
    const settingsResponse = await fetch(
      `https://${process.env.ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/tools/settings`,
      {
        method: "PUT",
        headers: {
          "X-Algolia-API-Key": process.env.ALGOLIA_API_KEY,
          "X-Algolia-Application-Id": process.env.ALGOLIA_APP_ID,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          searchableAttributes: ["name", "description", "shortDescription", "category", "tags"],
          attributesForFaceting: ["category"],
          customRanking: ["desc(featured)", "desc(hot)"],
          // Enable query suggestions
          attributesToSnippet: ["description:20"],
          attributesToHighlight: ["name", "category"],
          typoTolerance: true,
          minWordSizefor1Typo: 4,
          minWordSizefor2Typos: 8
        })
      }
    );
    if (!settingsResponse.ok) {
      throw new Error(`Settings API failed: ${settingsResponse.statusText}`);
    }
    const allTools = await storage.getTools({ limit: 1e3, offset: 0 });
    if (allTools.items.length > 0) {
      const algoliaObjects = allTools.items.map((tool) => ({
        objectID: tool.id.toString(),
        name: tool.name,
        description: tool.description,
        shortDescription: tool.shortDescription,
        category: tool.category,
        tags: tool.tags || [],
        website: tool.website,
        logoUrl: tool.logoUrl,
        featured: tool.isFeatured || false,
        hot: tool.isHot || false
      }));
      const indexResponse = await fetch(
        `https://${process.env.ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/tools/batch`,
        {
          method: "POST",
          headers: {
            "X-Algolia-API-Key": process.env.ALGOLIA_API_KEY,
            "X-Algolia-Application-Id": process.env.ALGOLIA_APP_ID,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            requests: algoliaObjects.map((obj) => ({
              action: "addObject",
              body: obj
            }))
          })
        }
      );
      if (!indexResponse.ok) {
        throw new Error(`Index API failed: ${indexResponse.statusText}`);
      }
      console.log(`Algolia search initialized successfully. Indexed ${allTools.items.length} tools.`);
      useAlgolia = true;
    }
    return true;
  } catch (error) {
    console.error("Algolia initialization failed:", error);
    console.log("Falling back to database search");
    return false;
  }
}
async function searchTools(query, options = {}) {
  const { page = 0, hitsPerPage = 20 } = options;
  if (useAlgolia && process.env.ALGOLIA_APP_ID && process.env.ALGOLIA_SEARCH_KEY) {
    try {
      const searchResponse = await fetch(
        `https://${process.env.ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/tools/query`,
        {
          method: "POST",
          headers: {
            "X-Algolia-API-Key": process.env.ALGOLIA_SEARCH_KEY,
            "X-Algolia-Application-Id": process.env.ALGOLIA_APP_ID,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            query: query.trim(),
            page,
            hitsPerPage,
            filters: options.filters,
            facetFilters: options.facetFilters
          })
        }
      );
      if (searchResponse.ok) {
        const searchResults = await searchResponse.json();
        return {
          items: searchResults.hits.map((hit) => ({
            id: parseInt(hit.objectID),
            name: hit.name,
            description: hit.description,
            shortDescription: hit.shortDescription,
            category: hit.category,
            tags: hit.tags,
            website: hit.website,
            logoUrl: hit.logoUrl,
            isFeatured: hit.featured,
            isHot: hit.hot
          })),
          total: searchResults.nbHits,
          totalPages: searchResults.nbPages,
          currentPage: page,
          query: query.trim()
        };
      }
    } catch (error) {
      console.error("Algolia search error, falling back to database:", error);
    }
  }
  const offset = page * hitsPerPage;
  const result = await storage.searchTools({
    query: query.trim(),
    limit: hitsPerPage,
    offset
  });
  return {
    items: result.items,
    total: result.total,
    totalPages: Math.ceil(result.total / hitsPerPage),
    currentPage: page,
    query: query.trim()
  };
}
async function getQuerySuggestions(query, limit = 5) {
  if (!query.trim() || query.length < 2) {
    return [];
  }
  if (useAlgolia && process.env.ALGOLIA_APP_ID && process.env.ALGOLIA_SEARCH_KEY) {
    try {
      const searchResponse = await fetch(
        `https://${process.env.ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/tools/query`,
        {
          method: "POST",
          headers: {
            "X-Algolia-API-Key": process.env.ALGOLIA_SEARCH_KEY,
            "X-Algolia-Application-Id": process.env.ALGOLIA_APP_ID,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            query: query.trim(),
            hitsPerPage: limit,
            attributesToRetrieve: ["name", "category"],
            attributesToHighlight: ["name"]
          })
        }
      );
      if (searchResponse.ok) {
        const searchResults = await searchResponse.json();
        return searchResults.hits.map((hit) => ({
          query: hit.name,
          category: hit.category,
          highlighted: hit._highlightResult?.name?.value || hit.name
        }));
      }
    } catch (error) {
      console.error("Algolia suggestions error:", error);
    }
  }
  const result = await storage.searchTools({
    query: query.trim(),
    limit,
    offset: 0
  });
  return result.items.map((tool) => ({
    query: tool.name,
    category: tool.category,
    highlighted: tool.name
  }));
}
var useAlgolia;
var init_initialize_algolia = __esm({
  "initialize-algolia.ts"() {
    "use strict";
    init_storage();
    useAlgolia = false;
  }
});

// index.ts
import express2 from "express";

// routes.ts
init_storage();
import { createServer } from "http";

// replitAuth.ts
init_storage();
import * as client from "openid-client";
import { Strategy as OpenIDStrategy } from "openid-client";
import passport from "passport";
import session from "express-session";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
var REPLIT_DOMAINS = process.env.REPLIT_DOMAINS;
if (!REPLIT_DOMAINS) {
  console.warn("REPLIT_DOMAINS not found - Replit Auth will be disabled for external deployments");
}
var getOidcConfig = memoize(
  async () => {
    try {
      const issuerUrl = new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc");
      const config = await client.discovery(issuerUrl, process.env.REPL_ID);
      return config;
    } catch (error) {
      console.error("OpenID Discovery failed:", error);
      throw error;
    }
  },
  { maxAge: 3600 * 1e3 }
);
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions"
  });
  return session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl
    }
  });
}
function updateUserSession(user, tokens) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}
async function upsertUser(claims) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"]
  });
}
async function setupAuth(app2) {
  if (!REPLIT_DOMAINS || process.env.NODE_ENV === "development" || process.env.NODE_ENV === "production" && !process.env.REPL_ID) {
    console.warn("\u26A0\uFE0F  Authentication disabled - continuing without auth setup");
    return;
  }
  app2.set("trust proxy", 1);
  app2.use(getSession());
  app2.use(passport.initialize());
  app2.use(passport.session());
  const config = await getOidcConfig();
  const verify = async (tokens, verified) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };
  for (const domain of REPLIT_DOMAINS.split(",")) {
    const strategy = new OpenIDStrategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`
      },
      verify
    );
    passport.use(strategy);
  }
  passport.serializeUser((user, cb) => cb(null, user));
  passport.deserializeUser((user, cb) => cb(null, user));
  app2.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"]
    })(req, res, next);
  });
  app2.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login"
    })(req, res, next);
  });
  app2.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`
        }).href
      );
    });
  });
}
var isAuthenticated = async (req, res, next) => {
  if (!REPLIT_DOMAINS || process.env.NODE_ENV === "production" && !process.env.REPL_ID) {
    return next();
  }
  const user = req.user;
  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const now = Math.floor(Date.now() / 1e3);
  if (now <= user.expires_at) {
    return next();
  }
  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
var isAdmin = async (req, res, next) => {
  if (process.env.NODE_ENV === "development" || !REPLIT_DOMAINS || process.env.NODE_ENV === "production" && !process.env.REPL_ID) {
    return next();
  }
  const user = req.user;
  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const now = Math.floor(Date.now() / 1e3);
  if (now > user.expires_at) {
    const refreshToken = user.refresh_token;
    if (!refreshToken) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    try {
      const config = await getOidcConfig();
      const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
      updateUserSession(user, tokenResponse);
    } catch (error) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
  }
  try {
    const { storage: storage2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const userId = user.claims.sub;
    const dbUser = await storage2.getUser(userId);
    if (!dbUser || !dbUser.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    return next();
  } catch (error) {
    console.error("Error checking admin status:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

// brevo.ts
function initializeBrevo() {
  if (!process.env.BREVO_API_KEY) {
    console.warn("BREVO_API_KEY not found. Newsletter functionality will be disabled.");
    return;
  }
  console.log("Brevo API key configured");
}
async function subscribeToNewsletter(email, name) {
  if (!process.env.BREVO_API_KEY) {
    throw new Error("Brevo API not configured. Please check BREVO_API_KEY.");
  }
  try {
    const contactData = {
      email,
      attributes: name ? { FIRSTNAME: name } : {},
      ...process.env.BREVO_LIST_ID && { listIds: [parseInt(process.env.BREVO_LIST_ID)] }
    };
    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY
      },
      body: JSON.stringify(contactData)
    });
    if (response.status === 400) {
      const updateResponse = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.BREVO_API_KEY
        },
        body: JSON.stringify({
          attributes: name ? { FIRSTNAME: name } : {},
          ...process.env.BREVO_LIST_ID && { listIds: [parseInt(process.env.BREVO_LIST_ID)] }
        })
      });
      if (!updateResponse.ok) {
        throw new Error(`Failed to update contact: ${updateResponse.statusText}`);
      }
      console.log("Existing contact updated successfully");
      return { updated: true };
    }
    if (!response.ok) {
      throw new Error(`Failed to create contact: ${response.statusText}`);
    }
    const result = await response.json();
    console.log("Contact created successfully:", result);
    return result;
  } catch (error) {
    console.error("Error with newsletter subscription:", error);
    throw error;
  }
}
async function sendWelcomeEmail(email, name) {
  if (!process.env.BREVO_API_KEY || !process.env.BREVO_SENDER_EMAIL) {
    console.warn("Brevo not configured for sending emails");
    return;
  }
  try {
    const emailData = {
      sender: {
        email: process.env.BREVO_SENDER_EMAIL,
        name: process.env.BREVO_SENDER_NAME || "Probe AI"
      },
      to: [{ email, name: name || email }],
      subject: "Welcome to Probe AI Newsletter!",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to Probe AI!</h2>
          <p>Hi ${name || "there"},</p>
          <p>Thank you for subscribing to our newsletter! You'll now receive:</p>
          <ul>
            <li>Latest AI tool discoveries</li>
            <li>Exclusive industry insights</li>
            <li>Expert reviews and comparisons</li>
            <li>Early access to new features</li>
          </ul>
          <p>Stay tuned for amazing AI content!</p>
          <p>Best regards,<br>The Probe AI Team</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">
            You received this email because you subscribed to our newsletter at Probe AI.
          </p>
        </div>
      `
    };
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY
      },
      body: JSON.stringify(emailData)
    });
    if (!response.ok) {
      throw new Error(`Failed to send email: ${response.statusText}`);
    }
    const result = await response.json();
    console.log("Welcome email sent:", result);
    return result;
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
}

// routes.ts
init_schema();
async function registerRoutes(app2) {
  const { healthCheck: healthCheck2 } = await Promise.resolve().then(() => (init_health(), health_exports));
  app2.get("/health", healthCheck2);
  await setupAuth(app2);
  app2.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.get("/api/tools", async (req, res) => {
    try {
      const { category, featured, hot, limit = 20, offset = 0 } = req.query;
      const tools2 = await storage.getTools({
        category,
        featured: featured === "true",
        hot: hot === "true",
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      res.json(tools2);
    } catch (error) {
      console.error("Error fetching tools:", error);
      res.status(500).json({ message: "Failed to fetch tools" });
    }
  });
  app2.get("/api/search", async (req, res) => {
    const query = req.query.q;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const pricingType = req.query.pricingType;
    if (!query || query.trim().length === 0) {
      return res.json({ items: [], total: 0, query: "" });
    }
    try {
      const { searchTools: searchTools2 } = await Promise.resolve().then(() => (init_initialize_algolia(), initialize_algolia_exports));
      const offset = (page - 1) * limit;
      const results = await searchTools2(query, {
        page: page - 1,
        // Algolia uses 0-based pages
        hitsPerPage: limit,
        filters: category ? `category:"${category}"` : void 0
      });
      res.json(results);
    } catch (error) {
      console.error("Search failed:", error);
      res.status(500).json({ message: "Search failed" });
    }
  });
  app2.get("/api/search/suggestions", async (req, res) => {
    try {
      const query = req.query.q;
      const limit = parseInt(req.query.limit) || 5;
      if (!query || query.trim().length < 2) {
        return res.json([]);
      }
      const { getQuerySuggestions: getQuerySuggestions2 } = await Promise.resolve().then(() => (init_initialize_algolia(), initialize_algolia_exports));
      const suggestions = await getQuerySuggestions2(query, limit);
      res.json(suggestions);
    } catch (error) {
      console.error("Suggestions error:", error);
      res.status(500).json({ message: "Suggestions failed" });
    }
  });
  app2.get("/api/tools/:id", async (req, res) => {
    try {
      const param = req.params.id;
      let tool;
      if (/^\d+$/.test(param)) {
        const toolId = parseInt(param);
        tool = await storage.getToolById(toolId);
      } else {
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
  app2.post("/api/tools", isAuthenticated, async (req, res) => {
    try {
      const toolData = insertToolSchema.parse({
        ...req.body,
        submittedBy: req.user.claims.sub,
        isApproved: false
      });
      const tool = await storage.createTool(toolData);
      res.json(tool);
    } catch (error) {
      console.error("Error creating tool:", error);
      res.status(500).json({ message: "Failed to create tool" });
    }
  });
  app2.get("/api/tools/:id/similar", async (req, res) => {
    try {
      const param = req.params.id;
      let tool;
      if (/^\d+$/.test(param)) {
        const toolId = parseInt(param);
        tool = await storage.getToolById(toolId);
      } else {
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
  app2.post("/api/tools/:id/like", isAuthenticated, async (req, res) => {
    try {
      const param = req.params.id;
      let tool;
      if (/^\d+$/.test(param)) {
        const toolId = parseInt(param);
        tool = await storage.getToolById(toolId);
      } else {
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
  app2.get("/api/user/likes", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const likedTools = await storage.getUserLikedTools(userId);
      res.json(likedTools);
    } catch (error) {
      console.error("Error fetching liked tools:", error);
      res.status(500).json({ message: "Failed to fetch liked tools" });
    }
  });
  app2.get("/api/user/submissions", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const submissions = await storage.getUserSubmissions(userId);
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching user submissions:", error);
      res.status(500).json({ message: "Failed to fetch user submissions" });
    }
  });
  app2.get("/api/news", async (req, res) => {
    try {
      const { limit = 20, offset = 0 } = req.query;
      const news2 = await storage.getNews({
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      res.json(news2);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });
  app2.post("/api/news", isAuthenticated, async (req, res) => {
    try {
      const newsData = insertNewsSchema.parse({
        ...req.body,
        submittedBy: req.user.claims.sub,
        isApproved: false
      });
      const newsItem = await storage.createNews(newsData);
      res.json(newsItem);
    } catch (error) {
      console.error("Error creating news:", error);
      res.status(500).json({ message: "Failed to create news" });
    }
  });
  app2.get("/api/blogs", async (req, res) => {
    try {
      const { limit = 20, offset = 0 } = req.query;
      const blogs2 = await storage.getBlogs({
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      res.json(blogs2);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      res.status(500).json({ message: "Failed to fetch blogs" });
    }
  });
  app2.get("/api/blogs/:slug", async (req, res) => {
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
  app2.post("/api/blogs", isAuthenticated, async (req, res) => {
    try {
      const blogData = insertBlogSchema.parse({
        ...req.body,
        submittedBy: req.user.claims.sub,
        isApproved: false
      });
      const blog = await storage.createBlog(blogData);
      res.json(blog);
    } catch (error) {
      console.error("Error creating blog:", error);
      res.status(500).json({ message: "Failed to create blog" });
    }
  });
  app2.get("/api/videos", async (req, res) => {
    try {
      const { limit = 20, offset = 0 } = req.query;
      const videos2 = await storage.getVideos({
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      res.json(videos2);
    } catch (error) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });
  app2.post("/api/videos", isAuthenticated, async (req, res) => {
    try {
      const videoData = insertVideoSchema.parse({
        ...req.body,
        submittedBy: req.user.claims.sub,
        isApproved: false
      });
      const video = await storage.createVideo(videoData);
      res.json(video);
    } catch (error) {
      console.error("Error creating video:", error);
      res.status(500).json({ message: "Failed to create video" });
    }
  });
  app2.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      console.log("Newsletter subscription request body:", req.body);
      const subscriptionData = insertSubscriptionSchema.parse(req.body);
      console.log("Parsed subscription data:", subscriptionData);
      const dbResult = await storage.createSubscription(subscriptionData);
      console.log("Database subscription created:", dbResult);
      if (process.env.BREVO_API_KEY) {
        console.log("Adding to Brevo with email:", subscriptionData.email, "name:", subscriptionData.name);
        try {
          const brevoResult = await subscribeToNewsletter(subscriptionData.email, subscriptionData.name);
          console.log("Brevo subscription result:", brevoResult);
          if (process.env.BREVO_SENDER_EMAIL) {
            console.log("Sending welcome email to:", subscriptionData.email);
            const emailResult = await sendWelcomeEmail(subscriptionData.email, subscriptionData.name);
            console.log("Welcome email result:", emailResult);
          }
        } catch (brevoError) {
          console.error("Brevo integration error:", brevoError);
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
  app2.get("/api/categories", async (req, res) => {
    try {
      const categories2 = await storage.getCategories();
      res.json(categories2);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  app2.get("/api/admin/pending", isAuthenticated, async (req, res) => {
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
  app2.post("/api/admin/approve/:type/:id", isAuthenticated, async (req, res) => {
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
  app2.post("/api/admin/tools/:id/featured", isAuthenticated, async (req, res) => {
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
  app2.post("/api/admin/tools/:id/hot", isAuthenticated, async (req, res) => {
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
  app2.post("/api/payments/create-order", isAuthenticated, async (req, res) => {
    try {
      const { toolId, amount = 1e4 } = req.body;
      const userId = req.user.claims.sub;
      const payment = await storage.createPayment({
        toolId,
        userId,
        amount: (amount / 100).toString(),
        // Convert paise to rupees
        status: "pending"
      });
      res.json({
        orderId: `order_${payment.id}`,
        // This would be the actual Razorpay order ID
        amount,
        currency: "INR"
      });
    } catch (error) {
      console.error("Error creating payment order:", error);
      res.status(500).json({ message: "Failed to create payment order" });
    }
  });
  app2.post("/api/payments/verify", isAuthenticated, async (req, res) => {
    try {
      const { paymentId, orderId, signature } = req.body;
      await storage.completePayment(orderId, paymentId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({ message: "Failed to verify payment" });
    }
  });
  app2.get("/api/admin/categories", isAdmin, async (req, res) => {
    try {
      const categories2 = await storage.getAllCategories();
      res.json(categories2);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  app2.post("/api/admin/categories", isAdmin, async (req, res) => {
    try {
      const data = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(data);
      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      if (error.name === "ZodError") {
        res.status(400).json({ message: "Invalid category data" });
      } else {
        res.status(500).json({ message: "Failed to create category" });
      }
    }
  });
  app2.put("/api/admin/categories/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, data);
      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      if (error.name === "ZodError") {
        res.status(400).json({ message: "Invalid category data" });
      } else {
        res.status(500).json({ message: "Failed to update category" });
      }
    }
  });
  app2.delete("/api/admin/categories/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCategory(id);
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });
  app2.get("/api/admin/tools", isAdmin, async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const offset = (page - 1) * limit;
      const tools2 = await storage.getTools({
        limit,
        offset,
        category: req.query.category,
        featured: req.query.featured === "true",
        hot: req.query.hot === "true",
        sort: req.query.sort
      });
      res.json(tools2);
    } catch (error) {
      console.error("Error fetching tools:", error);
      res.status(500).json({ message: "Failed to fetch tools" });
    }
  });
  app2.delete("/api/admin/tools/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTool(id);
      res.json({ message: "Tool deleted successfully" });
    } catch (error) {
      console.error("Error deleting tool:", error);
      res.status(500).json({ message: "Failed to delete tool" });
    }
  });
  app2.delete("/api/admin/news/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteNews(id);
      res.json({ message: "News deleted successfully" });
    } catch (error) {
      console.error("Error deleting news:", error);
      res.status(500).json({ message: "Failed to delete news" });
    }
  });
  app2.delete("/api/admin/blogs/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBlog(id);
      res.json({ message: "Blog deleted successfully" });
    } catch (error) {
      console.error("Error deleting blog:", error);
      res.status(500).json({ message: "Failed to delete blog" });
    }
  });
  app2.delete("/api/admin/videos/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteVideo(id);
      res.json({ message: "Video deleted successfully" });
    } catch (error) {
      console.error("Error deleting video:", error);
      res.status(500).json({ message: "Failed to delete video" });
    }
  });
  app2.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      res.json(users2);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.put("/api/admin/users/:id/admin", isAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      await storage.toggleUserAdmin(userId);
      res.json({ message: "User admin status updated" });
    } catch (error) {
      console.error("Error updating user admin status:", error);
      res.status(500).json({ message: "Failed to update user admin status" });
    }
  });
  app2.get("/api/admin/pending", isAdmin, async (req, res) => {
    try {
      const pending = await storage.getPendingSubmissions();
      res.json(pending);
    } catch (error) {
      console.error("Error fetching pending submissions:", error);
      res.status(500).json({ message: "Failed to fetch pending submissions" });
    }
  });
  app2.put("/api/admin/approve/:type/:id", isAdmin, async (req, res) => {
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
  app2.get("/api/blogs/:id/comments", async (req, res) => {
    try {
      const blogId = parseInt(req.params.id);
      const comments = await storage.getBlogComments(blogId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching blog comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });
  app2.post("/api/blogs/:id/comments", isAuthenticated, async (req, res) => {
    try {
      const blogId = parseInt(req.params.id);
      const userId = req.user?.claims?.sub;
      const { content } = req.body;
      const comment = await storage.createBlogComment({
        blogId,
        userId,
        content
      });
      res.json(comment);
    } catch (error) {
      console.error("Error creating blog comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// ../vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// index.ts
console.log("\u{1F680} Starting ProbeAI backend server...");
console.log("Environment:", process.env.NODE_ENV || "development");
console.log("Platform:", process.platform);
console.log("Node version:", process.version);
console.log("\u2705 All imports loaded successfully");
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
console.log("\u{1F4E6} Express app configured");
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
process.on("uncaughtException", (error) => {
  console.error("\u{1F4A5} UNCAUGHT EXCEPTION - Server will exit:");
  console.error("Error name:", error.name);
  console.error("Error message:", error.message);
  console.error("Stack trace:", error.stack);
  process.exit(1);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("\u{1F4A5} UNHANDLED PROMISE REJECTION - Server will exit:");
  console.error("Promise:", promise);
  console.error("Reason:", reason);
  process.exit(1);
});
(async () => {
  try {
    console.log("\u{1F527} Starting server initialization...");
    console.log("\u{1F50D} Checking environment variables...");
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? "\u2705 Set" : "\u274C Missing",
      SESSION_SECRET: process.env.SESSION_SECRET ? "\u2705 Set" : "\u274C Missing",
      REPLIT_DOMAINS: process.env.REPLIT_DOMAINS ? "\u2705 Set" : "\u26A0\uFE0F  Missing (Optional)",
      ALGOLIA_API_KEY: process.env.ALGOLIA_API_KEY ? "\u2705 Set" : "\u26A0\uFE0F  Missing",
      BREVO_API_KEY: process.env.BREVO_API_KEY ? "\u2705 Set" : "\u26A0\uFE0F  Missing"
    };
    console.table(envVars);
    console.log("\u{1F517} Registering routes and setting up authentication...");
    const server = await registerRoutes(app);
    console.log("\u2705 Routes registered successfully");
    console.log("\u{1F50D} Initializing Algolia search...");
    try {
      const { initializeAlgolia: initializeAlgolia2 } = await Promise.resolve().then(() => (init_initialize_algolia(), initialize_algolia_exports));
      await initializeAlgolia2();
      console.log("\u2705 Algolia initialized successfully");
    } catch (error) {
      console.warn("\u26A0\uFE0F  Algolia initialization failed:", error.message);
    }
    console.log("\u{1F4E7} Initializing Brevo email service...");
    try {
      initializeBrevo();
      console.log("\u2705 Brevo initialized successfully");
    } catch (error) {
      console.warn("\u26A0\uFE0F  Brevo initialization failed:", error.message);
    }
    app.use((err, _req, res, _next) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error("\u{1F6A8} Express error handler caught:");
      console.error("Status:", status);
      console.error("Message:", message);
      console.error("Stack:", err.stack);
      res.status(status).json({ message });
    });
    const port = 5e3;
    console.log(`\u{1F310} Setting up server on port ${port}...`);
    if (process.env.NODE_ENV === "development") {
      console.log("\u{1F527} Development mode: Setting up Vite");
      await setupVite(app, server);
    } else {
      console.log("\u{1F4E6} Production mode: Setting up static file serving");
      try {
        serveStatic(app);
        console.log("\u2705 Static files configured successfully");
      } catch (error) {
        console.warn("\u26A0\uFE0F  Static file serving failed, running as backend-only:", error.message);
        console.log("\u{1F4C4} Frontend should be deployed separately (e.g., on Vercel)");
        app.get("/", (_req, res) => {
          res.send(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>ProbeAI Backend API</title>
                <meta charset="utf-8">
                <style>
                  body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
                  code { background: #f5f5f5; padding: 2px 4px; border-radius: 3px; }
                </style>
              </head>
              <body>
                <h1>ProbeAI Backend API Server</h1>
                <p>\u2705 Backend API is running successfully!</p>
                <p>\u{1F310} Frontend is deployed separately on Vercel.</p>
                <h3>Available API Endpoints:</h3>
                <ul>
                  <li><code>GET /api/tools</code> - AI tools directory</li>
                  <li><code>GET /api/news</code> - Latest AI news</li>
                  <li><code>GET /api/blogs</code> - Blog articles</li>
                  <li><code>GET /api/videos</code> - Video content</li>
                  <li><code>GET /api/auth/user</code> - User authentication</li>
                </ul>
              </body>
            </html>
          `);
        });
        app.get("*", (req, res) => {
          if (!req.path.startsWith("/api")) {
            res.status(404).json({
              error: "Frontend not found",
              message: "Frontend is deployed on Vercel. This is the backend API server."
            });
          }
        });
      }
    }
    console.log(`\u{1F680} Starting server on 0.0.0.0:${port}...`);
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true
    }, () => {
      console.log("\u2705 ProbeAI backend server running successfully!");
      console.log(`\u{1F4CD} Server listening on http://0.0.0.0:${port}`);
      log(`serving on port ${port}`);
    });
  } catch (error) {
    console.error("\u{1F4A5} CRITICAL ERROR - Failed to start server:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Stack trace:", error.stack);
    console.error("Environment debug info:");
    console.error("- NODE_ENV:", process.env.NODE_ENV);
    console.error("- Platform:", process.platform);
    console.error("- Working directory:", process.cwd());
    process.exit(1);
  }
})();
