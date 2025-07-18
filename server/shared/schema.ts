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
  faqs: jsonb("faqs"), // Array of {question, answer}
  prosAndCons: jsonb("pros_and_cons"), // JSON with { pros: [], cons: [] }
  pricingType: varchar("pricing_type", { length: 50 }),
  audience: varchar("audience", { length: 100 }).array(),
  access: varchar("audience", { length: 100 }).array(),
  metaTitle: varchar("meta_title", { length: 500 }),
  metaDescription: varchar("meta_description", { length: 500 }),
  schema: jsonb("schema"),
  isFeatured: boolean("is_featured").default(false),
  isTrending: boolean("is_trending").default(false),
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
export const insertToolSchema = z.object({
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
  isTrending: z.boolean().default(false),
});

export type News = typeof news.$inferSelect;
export type InsertNews = typeof news.$inferInsert;
export const insertNewsSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  url: z.string().url(),
  imageUrl: z.string().url().optional(),
  source: z.string().min(1),
  submittedBy: z.string().optional(),
  approved: z.boolean().default(false),
});

export type Blog = typeof blogs.$inferSelect;
export type InsertBlog = typeof blogs.$inferInsert;
export const insertBlogSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().optional(),
  imageUrl: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
  author: z.string().min(1),
  submittedBy: z.string().optional(),
  approved: z.boolean().default(false),
});

export type Video = typeof videos.$inferSelect;
export type InsertVideo = typeof videos.$inferInsert;
export const insertVideoSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  duration: z.string().optional(),
  submittedBy: z.string().optional(),
  approved: z.boolean().default(false),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;
export const insertSubscriptionSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
export const insertPaymentSchema = z.object({
  orderId: z.string().min(1),
  paymentId: z.string().optional(),
  amount: z.string().min(1),
  currency: z.string().min(1),
  status: z.string().min(1),
  userId: z.string().min(1),
});

export type UserLike = typeof userLikes.$inferSelect;
export type InsertUserLike = typeof userLikes.$inferInsert;
export const insertUserLikeSchema = z.object({
  userId: z.string().min(1),
  toolId: z.number().int().positive(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;
export const insertCategorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  slug: z.string().min(1),
  color: z.string().optional(),
});
