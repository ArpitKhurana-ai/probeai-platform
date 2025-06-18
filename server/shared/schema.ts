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
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Tools
export const tools = pgTable("tools", {
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
  faqs: jsonb("faqs"), // Array of {question, answer}
  pricingType: varchar("pricing_type", { length: 50 }), // Free, Freemium, Paid, Open Source
  accessType: varchar("access_type", { length: 50 }), // Web App, API, Chrome Extension, etc.
  aiTech: varchar("ai_tech", { length: 50 }), // GPT-4, SDXL, etc.
  audience: varchar("audience", { length: 50 }), // Developers, Marketers, etc.
  isFeatured: boolean("is_featured").default(false),
  isHot: boolean("is_hot").default(false),
  featuredUntil: timestamp("featured_until"),
  likes: integer("likes").default(0),
  submittedBy: varchar("submitted_by"),
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User likes for tools
export const userLikes = pgTable("user_likes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  toolId: integer("tool_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// News articles
export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  excerpt: text("excerpt"),
  source: varchar("source", { length: 100 }).notNull(),
  sourceUrl: varchar("source_url", { length: 500 }).notNull(),
  publishDate: timestamp("publish_date").notNull(),
  category: varchar("category", { length: 100 }),
  submittedBy: varchar("submitted_by"),
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Blog posts
export const blogs = pgTable("blogs", {
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
  readTime: integer("read_time"), // in minutes
  isPublished: boolean("is_published").default(false),
  publishDate: timestamp("publish_date"),
  submittedBy: varchar("submitted_by"),
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Videos
export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  videoUrl: varchar("video_url", { length: 500 }).notNull(), // YouTube/Vimeo URL
  thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
  channel: varchar("channel", { length: 100 }),
  duration: varchar("duration", { length: 20 }), // e.g., "15:42"
  views: varchar("views", { length: 20 }), // e.g., "45K views"
  category: varchar("category", { length: 100 }),
  tags: text("tags").array(),
  submittedBy: varchar("submitted_by"),
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Newsletter subscriptions
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  isActive: boolean("is_active").default(true),
  source: varchar("source", { length: 100 }), // e.g., "homepage", "blog"
  createdAt: timestamp("created_at").defaultNow(),
});

// Payment records for featured listings
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  toolId: integer("tool_id").notNull(),
  userId: varchar("user_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("INR"),
  razorpayPaymentId: varchar("razorpay_payment_id", { length: 100 }),
  razorpayOrderId: varchar("razorpay_order_id", { length: 100 }),
  status: varchar("status", { length: 50 }).default("pending"), // pending, completed, failed
  featuredDays: integer("featured_days").default(30),
  createdAt: timestamp("created_at").defaultNow(),
});

export const blogComments = pgTable("blog_comments", {
  id: serial("id").primaryKey(),
  blogId: integer("blog_id").notNull(),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  likes: many(userLikes),
  submittedTools: many(tools),
  payments: many(payments),
}));

export const toolsRelations = relations(tools, ({ many, one }) => ({
  likes: many(userLikes),
  submitter: one(users, {
    fields: [tools.submittedBy],
    references: [users.id],
  }),
  payments: many(payments),
}));

export const userLikesRelations = relations(userLikes, ({ one }) => ({
  user: one(users, {
    fields: [userLikes.userId],
    references: [users.id],
  }),
  tool: one(tools, {
    fields: [userLikes.toolId],
    references: [tools.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  tool: one(tools, {
    fields: [payments.toolId],
    references: [tools.id],
  }),
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
}));

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type Tool = typeof tools.$inferSelect;
export type InsertTool = typeof tools.$inferInsert;
export const insertToolSchema = createInsertSchema(tools).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type News = typeof news.$inferSelect;
export type InsertNews = typeof news.$inferInsert;
export const insertNewsSchema = createInsertSchema(news).omit({
  id: true,
  createdAt: true,
});

export type Blog = typeof blogs.$inferSelect;
export type InsertBlog = typeof blogs.$inferInsert;
export const insertBlogSchema = createInsertSchema(blogs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Video = typeof videos.$inferSelect;
export type InsertVideo = typeof videos.$inferInsert;
export const insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
  createdAt: true,
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;
export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export type UserLike = typeof userLikes.$inferSelect;
export type InsertUserLike = typeof userLikes.$inferInsert;
export const insertUserLikeSchema = createInsertSchema(userLikes).omit({
  id: true,
  createdAt: true,
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;
export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
