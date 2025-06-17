// Frontend types - inferred from backend schema without database imports

export interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  isAdmin: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface Tool {
  id: number;
  name: string;
  description: string;
  shortDescription: string | null;
  website: string;
  logoUrl: string | null;
  category: string;
  tags: string[] | null;
  keyFeatures: string[] | null;
  useCases: string[] | null;
  pricingType: string | null;
  pricingDetails: string | null;
  accessType: string | null;
  aiTech: string | null;
  audience: string | null;
  isFeatured: boolean;
  isHot: boolean;
  likes: number;
  isApproved: boolean;
  submittedBy: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface News {
  id: number;
  title: string;
  summary: string;
  content: string | null;
  url: string | null;
  imageUrl: string | null;
  source: string | null;
  isApproved: boolean;
  submittedBy: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface Blog {
  id: number;
  title: string;
  content: string;
  excerpt: string | null;
  slug: string;
  imageUrl: string | null;
  isApproved: boolean;
  submittedBy: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface Video {
  id: number;
  title: string;
  description: string;
  url: string;
  thumbnailUrl: string | null;
  duration: string | null;
  isApproved: boolean;
  submittedBy: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  slug: string;
  isActive: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface Subscription {
  id: number;
  email: string;
  name: string | null;
  createdAt: Date | null;
}

export interface Payment {
  id: number;
  userId: string;
  amount: number;
  currency: string;
  orderId: string;
  paymentId: string | null;
  status: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

// Zod schemas for frontend form validation
import { z } from "zod";

export const insertToolSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  shortDescription: z.string().optional(),
  website: z.string().url("Must be a valid URL"),
  logoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).optional(),
  keyFeatures: z.array(z.string()).optional(),
  useCases: z.array(z.string()).optional(),
  pricingType: z.string().optional(),
  pricingDetails: z.string().optional(),
  accessType: z.string().optional(),
  aiTech: z.string().optional(),
  audience: z.string().optional(),
});

export const insertNewsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  summary: z.string().min(1, "Summary is required"),
  content: z.string().optional(),
  url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  source: z.string().optional(),
});

export const insertBlogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  slug: z.string().min(1, "Slug is required"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export const insertVideoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  url: z.string().url("Must be a valid URL"),
  thumbnailUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  duration: z.string().optional(),
});

export const insertCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  slug: z.string().min(1, "Slug is required"),
  isActive: z.boolean().default(true),
});

export const insertSubscriptionSchema = z.object({
  email: z.string().email("Must be a valid email"),
  name: z.string().optional(),
});
