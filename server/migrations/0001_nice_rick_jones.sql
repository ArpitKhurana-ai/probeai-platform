ALTER TABLE "tools" ALTER COLUMN "audience" SET DATA TYPE varchar(100)[];--> statement-breakpoint
ALTER TABLE "tools" ADD COLUMN "pros_and_cons" jsonb;--> statement-breakpoint
ALTER TABLE "tools" ADD COLUMN "access" varchar(100)[];--> statement-breakpoint
ALTER TABLE "tools" ADD COLUMN "meta_title" varchar(500);--> statement-breakpoint
ALTER TABLE "tools" ADD COLUMN "meta_description" varchar(500);--> statement-breakpoint
ALTER TABLE "tools" ADD COLUMN "schema" jsonb;--> statement-breakpoint
ALTER TABLE "tools" ADD COLUMN "is_trending" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "tools" DROP COLUMN "access_type";--> statement-breakpoint
ALTER TABLE "tools" DROP COLUMN "ai_tech";--> statement-breakpoint
ALTER TABLE "tools" DROP COLUMN "is_hot";--> statement-breakpoint
ALTER TABLE "tools" DROP COLUMN "featured_until";