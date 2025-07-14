CREATE TABLE "blog_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"blog_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "blogs" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(500) NOT NULL,
	"slug" varchar(500) NOT NULL,
	"content" text NOT NULL,
	"excerpt" text,
	"image_url" varchar(500),
	"author" varchar(100) NOT NULL,
	"tags" text[],
	"meta_title" varchar(500),
	"meta_description" varchar(500),
	"og_title" varchar(500),
	"og_description" varchar(500),
	"read_time" integer,
	"is_published" boolean DEFAULT false,
	"publish_date" timestamp,
	"submitted_by" varchar,
	"is_approved" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "blogs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "categories_name_unique" UNIQUE("name"),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "news" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(500) NOT NULL,
	"excerpt" text,
	"source" varchar(100) NOT NULL,
	"source_url" varchar(500) NOT NULL,
	"publish_date" timestamp NOT NULL,
	"category" varchar(100),
	"submitted_by" varchar,
	"is_approved" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"tool_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'INR',
	"razorpay_payment_id" varchar(100),
	"razorpay_order_id" varchar(100),
	"status" varchar(50) DEFAULT 'pending',
	"featured_days" integer DEFAULT 30,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"is_active" boolean DEFAULT true,
	"source" varchar(100),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "subscriptions_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "tools" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255),
	"description" text NOT NULL,
	"short_description" varchar(500),
	"how_it_works" text,
	"website" varchar(500),
	"logo_url" varchar(500),
	"category" varchar(100) NOT NULL,
	"tags" text[],
	"key_features" text[],
	"use_cases" text[],
	"faqs" jsonb,
	"pricing_type" varchar(50),
	"access_type" varchar(50),
	"ai_tech" varchar(50),
	"audience" varchar(50),
	"is_featured" boolean DEFAULT false,
	"is_hot" boolean DEFAULT false,
	"featured_until" timestamp,
	"likes" integer DEFAULT 0,
	"submitted_by" varchar,
	"is_approved" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_likes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"tool_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"is_admin" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "videos" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"video_url" varchar(500) NOT NULL,
	"thumbnail_url" varchar(500),
	"channel" varchar(100),
	"duration" varchar(20),
	"views" varchar(20),
	"category" varchar(100),
	"tags" text[],
	"submitted_by" varchar,
	"is_approved" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");