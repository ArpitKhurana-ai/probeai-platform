var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
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
  "shared/schema.ts"() {
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
      slug: varchar("slug", { length: 255 }),
      description: text("description").notNull(),
      shortDescription: varchar("short_description", { length: 500 }),
      howItWorks: text("how_it_works"),
      website: varchar("website", { length: 500 }),
      logoUrl: varchar("logo_url", { length: 500 }),
      category: varchar("category", { length: 100 }).notNull(),
      tags: text("tags").array(),
      keyFeatures: text("key_features").array(),
      useCases: text("use_cases").array(),
      faqs: jsonb("faqs"),
      // Array of {question, answer}
      prosAndCons: jsonb("pros_and_cons"),
      // JSON with { pros: [], cons: [] }
      pricingType: varchar("pricing_type", { length: 50 }),
      audience: varchar("audience", { length: 100 }).array(),
      access: varchar("access", { length: 100 }).array(),
      metaTitle: varchar("meta_title", { length: 500 }),
      metaDescription: varchar("meta_description", { length: 500 }),
      schema: jsonb("schema"),
      isFeatured: boolean("is_featured").default(false),
      isTrending: boolean("is_trending").default(false),
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
      isTrending: z.boolean().default(false)
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
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
var pool, db;
var init_db = __esm({
  "db.ts"() {
    "use strict";
    init_schema();
    dotenv.config();
    pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
    db = drizzle(pool, { schema: schema_exports });
  }
});

// storage.ts
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
        if (options.isTrending) {
          conditions.push(eq(tools.isTrending, true));
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
        const normalizedSlug = slug.toLowerCase();
        const [tool] = await db.select().from(tools).where(
          and(
            eq(tools.isApproved, true),
            sql`lower(regexp_replace(${tools.name}, '[^a-z0-9]+', '-', 'g')) = ${normalizedSlug}`
          )
        ).limit(1);
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
          if (aNameMatch && !bNameMatch)
            return -1;
          if (!aNameMatch && bNameMatch)
            return 1;
          if (a.isFeatured && !b.isFeatured)
            return -1;
          if (!a.isFeatured && b.isFeatured)
            return 1;
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
        if (!tool)
          return [];
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
      async setToolHot(toolId, isTrending) {
        await db.update(tools).set({
          isTrending,
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
          isTrending: tools.isTrending,
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

// index.ts
import express from "express";
import dotenv3 from "dotenv";
import cors from "cors";

// routes.ts
init_storage();

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
      const config2 = await client.discovery(issuerUrl, process.env.REPL_ID);
      return config2;
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
  const config2 = await getOidcConfig();
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
        config: config2,
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
        client.buildEndSessionUrl(config2, {
          client_id: process.env.REPL_ID,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`
        }).href
      );
    });
  });
}

// routes/search.ts
import { Router } from "express";
import algoliasearch from "algoliasearch";
import dotenv2 from "dotenv";
dotenv2.config();
var ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID;
var ALGOLIA_API_KEY = process.env.ALGOLIA_API_KEY;
var ALGOLIA_INDEX_NAME = "tools";
var client2 = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);
var index2 = client2.initIndex(ALGOLIA_INDEX_NAME);
var router = Router();
router.get("/", async (req, res) => {
  const query = req.query.q || "";
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  if (!query || query.trim().length === 0) {
    return res.json({ items: [], total: 0, query: "" });
  }
  try {
    const algoliaRes = await index2.search(query, {
      page: page - 1,
      hitsPerPage: limit,
      attributesToRetrieve: [
        "name",
        "slug",
        "category",
        "logo",
        "shortDescription",
        "description"
      ]
      // Ensure all required fields
    });
    console.log("\u{1F50D} Search Query:", query);
    console.log("\u{1F9E0} Results:", algoliaRes.hits.map((hit) => hit.name));
    res.json({
      items: algoliaRes.hits,
      total: algoliaRes.nbHits,
      query
    });
  } catch (error) {
    console.error("Algolia search failed:", error.message);
    res.status(500).json({ error: "Search failed", details: error.message });
  }
});
router.get("/suggestions", async (req, res) => {
  const query = req.query.q || "";
  const limit = parseInt(req.query.limit) || 5;
  if (!query || query.trim().length < 2) {
    return res.json([]);
  }
  try {
    const algoliaRes = await index2.search(query, {
      hitsPerPage: limit,
      attributesToRetrieve: ["name", "slug", "category", "logo"],
      // Added logo
      attributesToHighlight: ["name"]
    });
    const suggestions = algoliaRes.hits.map((hit) => ({
      name: hit.name,
      slug: hit.slug,
      category: hit.category,
      logo: hit.logo,
      highlighted: hit._highlightResult?.name?.value || hit.name
    }));
    res.json(suggestions);
  } catch (error) {
    console.error("Algolia suggestions failed:", error.message);
    res.status(500).json({ error: "Suggestions failed", details: error.message });
  }
});
var search_default = router;

// routes/tools.ts
init_storage();
init_db();
init_schema();
import { Router as Router2 } from "express";
import { eq as eq3 } from "drizzle-orm";

// handlers/sync-tools.ts
init_db();
init_schema();
import { eq as eq2 } from "drizzle-orm";
import algoliasearch2 from "algoliasearch";
import { config } from "dotenv";
config();
var algoliaClient = algoliasearch2(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_API_KEY
);
var algoliaIndex = algoliaClient.initIndex("tools");
function normalizeArrayField(input) {
  if (Array.isArray(input))
    return input;
  if (typeof input === "string") {
    const cleaned = input.replace(/^\{|\}$/g, "").replace(/"/g, "").split(",").map((s) => s.trim()).filter(Boolean);
    return cleaned;
  }
  return [];
}
function safeJsonParse(data, fallback = null) {
  try {
    return typeof data === "string" ? JSON.parse(data) : data;
  } catch {
    return fallback;
  }
}
function transformToolData(tool) {
  const now = /* @__PURE__ */ new Date();
  return {
    slug: tool.slug,
    name: tool.name,
    description: tool.description,
    shortDescription: tool.shortDescription || null,
    website: tool.url,
    logoUrl: tool.logo,
    category: tool.category,
    tags: normalizeArrayField(tool.tags),
    keyFeatures: normalizeArrayField(tool.keyFeatures),
    useCases: normalizeArrayField(tool.useCases),
    faqs: safeJsonParse(tool.faqs, []),
    prosAndCons: safeJsonParse(tool.prosAndCons, { pros: [], cons: [] }),
    pricingType: tool.pricingType || null,
    audience: normalizeArrayField(tool.audience),
    access: normalizeArrayField(tool.access),
    howItWorks: tool.howItWorks || null,
    metaTitle: tool.metaTitle || null,
    metaDescription: tool.metaDescription || null,
    schema: safeJsonParse(tool.schema, {}),
    isFeatured: !!tool.isFeatured,
    isTrending: !!tool.isTrending,
    isApproved: !!tool.isPublished || !!tool.isApproved,
    updatedAt: now
  };
}
async function syncToolsFromSheet(req, res) {
  try {
    const { tools: incomingTools } = req.body;
    if (!incomingTools || !Array.isArray(incomingTools)) {
      res.status(400).json({
        success: false,
        message: "Invalid request: tools array is required",
        stats: { total: 0, inserted: 0, updated: 0, errors: 1 }
      });
      return;
    }
    const requiredFields = ["name", "slug", "description", "url", "logo", "category"];
    for (const tool of incomingTools) {
      for (const field of requiredFields) {
        if (!tool[field]) {
          res.status(400).json({
            success: false,
            message: `Missing field '${field}' in tool '${tool.slug || "unknown"}'`,
            stats: { total: incomingTools.length, inserted: 0, updated: 0, errors: 1 }
          });
          return;
        }
      }
    }
    let insertedCount = 0;
    let updatedCount = 0;
    let errorsCount = 0;
    const errors = [];
    for (const tool of incomingTools) {
      try {
        const exists = await db.select().from(tools).where(eq2(tools.slug, tool.slug)).limit(1);
        const transformed = transformToolData(tool);
        if (exists.length > 0) {
          await db.update(tools).set(transformed).where(eq2(tools.slug, tool.slug));
          updatedCount++;
          console.log(`\u2705 Updated: ${tool.slug}`);
        } else {
          await db.insert(tools).values({
            ...transformed,
            created_at: /* @__PURE__ */ new Date()
          });
          insertedCount++;
          console.log(`\u2795 Inserted: ${tool.slug}`);
        }
        const algoliaPayload = {
          objectID: tool.slug,
          slug: tool.slug,
          name: tool.name,
          description: tool.description,
          shortDescription: tool.shortDescription || "",
          logo: tool.logo || tool.logoUrl || "",
          howItWorks: tool.howItWorks || "",
          keyFeatures: normalizeArrayField(tool.keyFeatures),
          useCases: normalizeArrayField(tool.useCases),
          prosAndCons: safeJsonParse(tool.prosAndCons, { pros: [], cons: [] }),
          faqs: safeJsonParse(tool.faqs, []),
          category: tool.category,
          tags: normalizeArrayField(tool.tags),
          audience: normalizeArrayField(tool.audience),
          access: normalizeArrayField(tool.access),
          pricingType: tool.pricingType || "",
          metaTitle: tool.metaTitle || "",
          metaDescription: tool.metaDescription || "",
          isFeatured: !!tool.isFeatured,
          isTrending: !!tool.isTrending,
          _searchData: [
            tool.name,
            tool.description,
            tool.shortDescription,
            tool.howItWorks,
            (tool.keyFeatures || []).join(" "),
            (tool.useCases || []).join(" "),
            (tool.tags || []).join(" "),
            (tool.audience || []).join(" "),
            (tool.access || []).join(" "),
            tool.metaTitle,
            tool.metaDescription
          ].filter(Boolean).join(" ")
        };
        console.log("\u{1F680} Sending to Algolia:", algoliaPayload);
        await algoliaIndex.saveObject(algoliaPayload);
      } catch (err) {
        errorsCount++;
        errors.push(`\u274C ${tool.slug}: ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    }
    const response = {
      success: errorsCount === 0,
      message: errorsCount === 0 ? `Successfully synced ${incomingTools.length} tools` : `Synced with ${errorsCount} errors`,
      stats: {
        total: incomingTools.length,
        inserted: insertedCount,
        updated: updatedCount,
        errors: errorsCount
      }
    };
    if (errors.length > 0) {
      response.errors = errors;
    }
    res.status(errorsCount === 0 ? 200 : 207).json(response);
  } catch (error) {
    console.error("\u274C Sync failed:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during sync",
      stats: { total: 0, inserted: 0, updated: 0, errors: 1 },
      errors: [error instanceof Error ? error.message : "Unknown error"]
    });
  }
}

// routes/tools.ts
var router2 = Router2();
router2.get("/", async (req, res) => {
  try {
    const { trending, featured, category, limit = 10, offset = 0, sort } = req.query;
    const isTrending = trending === "true";
    const isFeatured = featured === "true";
    const options = {
      category: category ? String(category) : void 0,
      featured: isFeatured,
      isTrending,
      limit: Number(limit),
      offset: Number(offset),
      sort: sort ? String(sort) : void 0
    };
    const result = await storage.getTools(options);
    if (isTrending) {
      const trendingOnly = result.items.filter((tool) => tool.isTrending);
      if (trendingOnly.length === 0) {
        return res.json({ items: [], total: 0 });
      }
      return res.json({ items: trendingOnly, total: trendingOnly.length });
    }
    return res.json(result);
  } catch (error) {
    console.error("Error fetching tools:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.get("/:slug", async (req, res) => {
  const { slug } = req.params;
  console.log("Fetching tool with slug:", slug);
  try {
    const result = await db.select().from(tools).where(eq3(tools.slug, slug.toLowerCase()));
    if (result.length === 0) {
      return res.status(404).json({ error: "Tool not found" });
    }
    res.json(result[0]);
  } catch (error) {
    console.error("Error fetching tool:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.post("/sync-from-sheet", syncToolsFromSheet);
var tools_default = router2;

// routes.ts
async function registerRoutes(app2) {
  const { healthCheck: healthCheck2 } = await Promise.resolve().then(() => (init_health(), health_exports));
  app2.get("/health", healthCheck2);
  await setupAuth(app2);
  app2.get("/api/auth/user", async (req, res) => {
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
  app2.get("/api/tools", async (req, res) => {
    try {
      const { category, featured, trending, limit = 20, offset = 0 } = req.query;
      const tools2 = await storage.getTools({
        category,
        featured: featured === "true",
        isTrending: trending === "true",
        // ✅ Fix trending filter
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      res.json(tools2);
    } catch (error) {
      console.error("Error fetching tools:", error);
      res.status(500).json({ message: "Failed to fetch tools" });
    }
  });
  app2.get("/api/news", async (req, res) => {
    try {
      const { limit = 10, offset = 0 } = req.query;
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
  app2.get("/api/blogs", async (req, res) => {
    try {
      const { limit = 10, offset = 0 } = req.query;
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
  app2.get("/api/videos", async (req, res) => {
    try {
      const { limit = 10, offset = 0 } = req.query;
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
  app2.use("/api/search", search_default);
  app2.use("/api/tools", tools_default);
  console.log("\u2705 All API routes registered.");
}

// algoliaSync.ts
init_storage();
import algoliasearch3 from "algoliasearch";
var ALGOLIA_APP_ID2 = process.env.ALGOLIA_APP_ID;
var ALGOLIA_API_KEY2 = process.env.ALGOLIA_API_KEY;
var ALGOLIA_INDEX_NAME2 = "tools";
var client3 = algoliasearch3(ALGOLIA_APP_ID2, ALGOLIA_API_KEY2);
var index3 = client3.initIndex(ALGOLIA_INDEX_NAME2);
async function initializeAlgolia() {
  if (!ALGOLIA_APP_ID2 || !ALGOLIA_API_KEY2) {
    console.log("Algolia credentials not set \u2013 skipping sync.");
    return;
  }
  try {
    console.log("\u{1F9F9} Clearing existing Algolia index...");
    await index3.clearObjects();
    await index3.setSettings({
      searchableAttributes: [
        "name",
        "description",
        "shortDescription",
        "category",
        "tags",
        "logo",
        "logoUrl"
      ],
      attributesForFaceting: ["category"],
      customRanking: ["desc(featured)", "desc(hot)"],
      attributesToSnippet: ["description:20"],
      attributesToHighlight: ["name", "category"],
      typoTolerance: true,
      minWordSizefor1Typo: 4,
      minWordSizefor2Typos: 8
    });
    const allTools = await storage.getTools({ limit: 1e3, offset: 0 });
    const records = allTools.items.map((tool) => ({
      objectID: tool.slug || tool.name.toLowerCase().replace(/\s+/g, "-"),
      slug: tool.slug,
      name: tool.name,
      description: tool.description,
      shortDescription: tool.shortDescription,
      category: tool.category,
      tags: tool.tags || [],
      website: tool.website,
      logo: tool.logo || tool.logoUrl || "",
      logoUrl: tool.logoUrl || "",
      featured: tool.isFeatured || false,
      hot: tool.isTrending || false
    }));
    await index3.saveObjects(records);
    console.log(`\u2705 Synced ${records.length} tools to Algolia (with logo).`);
  } catch (err) {
    console.error("Algolia sync failed:", err.message);
  }
}

// index.ts
import { createServer } from "http";
dotenv3.config();
var app = express();
var PORT = process.env.PORT ? Number(process.env.PORT) : 8787;
var HOST = "0.0.0.0";
var allowedOrigins = [
  "http://localhost:3000",
  "https://probeai.vercel.app",
  /\.vercel\.app$/
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin)
        return callback(null, true);
      if (allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);
app.use(express.json());
app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "\u2705 ProbeAI backend root is alive." });
});
app.get("/cors-check", (_req, res) => {
  res.json({ message: "\u2705 CORS check passed" });
});
async function startServer() {
  try {
    console.log("\n===============================");
    console.log("\u{1F680} Booting ProbeAI Backend...");
    console.log(`\u{1F310} PORT: ${PORT}`);
    console.log(`\u{1F30D} ENV: ${process.env.NODE_ENV}`);
    console.log("===============================\n");
    await initializeAlgolia();
    console.log("\u{1F501} Algolia sync initialized");
    await registerRoutes(app);
    console.log("\u{1F4E6} Routes registered");
    app.get("*", (_req, res) => {
      res.status(404).json({ error: "Route not found" });
    });
    const httpServer = createServer(app);
    httpServer.listen(PORT, HOST, () => {
      console.log("\u2705 ProbeAI backend server running successfully!");
      console.log(`\u{1F517} Listening on http://${HOST}:${PORT}`);
    });
  } catch (err) {
    console.error("\u274C Failed to start server:", err);
    process.exit(1);
  }
}
startServer();
