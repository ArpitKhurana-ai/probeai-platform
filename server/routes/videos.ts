import { Router } from "express";
import { db } from "../db";
import { videos } from "../shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

interface IncomingVideo {
  title: string;
  slug: string;  // Required now
  youtubeUrl: string;
  publishDate?: string;
  isApproved?: boolean;
  isPublished?: boolean;
}

interface SyncVideoRequest {
  videos: IncomingVideo[];
}

interface SyncResponse {
  success: boolean;
  message: string;
  stats: { total: number; inserted: number; updated: number; errors: number };
  errors?: string[];
}

function transformVideoItem(item: IncomingVideo) {
  if (!item.slug) {
    throw new Error(`Slug is missing for video "${item.title}"`);
  }
  return {
    title: item.title.trim(),
    slug: item.slug.trim(),
    youtubeUrl: item.youtubeUrl,
    publishDate: item.publishDate ? new Date(item.publishDate) : new Date(),
    isApproved: !!item.isApproved,
    isPublished: !!item.isPublished,
    createdAt: new Date(),
  };
}

router.post("/sync-from-sheet", async (req, res) => {
  try {
    const { videos: incomingVideos }: SyncVideoRequest = req.body;
    if (!incomingVideos || !Array.isArray(incomingVideos)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request: 'videos' array is required",
        stats: { total: 0, inserted: 0, updated: 0, errors: 1 },
      });
    }

    let insertedCount = 0;
    let updatedCount = 0;
    let errorsCount = 0;
    const errors: string[] = [];

    for (const item of incomingVideos) {
      try {
        if (!item.title || !item.youtubeUrl || !item.slug) {
          errors.push(`❌ Missing title, youtubeUrl, or slug for: ${item.title}`);
          errorsCount++;
          continue;
        }

        const existing = await db.select().from(videos).where(eq(videos.slug, item.slug)).limit(1);
        const transformed = transformVideoItem(item);

        if (existing.length > 0) {
          await db.update(videos).set(transformed).where(eq(videos.slug, item.slug));
          updatedCount++;
        } else {
          await db.insert(videos).values(transformed);
          insertedCount++;
        }
      } catch (err) {
        errors.push(`❌ ${item.title}: ${err instanceof Error ? err.message : "Unknown error"}`);
        errorsCount++;
      }
    }

    const response: SyncResponse = {
      success: errorsCount === 0,
      message: errorsCount === 0 ? `Synced ${incomingVideos.length} videos` : `Synced with ${errorsCount} errors`,
      stats: { total: incomingVideos.length, inserted: insertedCount, updated: updatedCount, errors: errorsCount },
      errors: errors.length > 0 ? errors : undefined,
    };

    res.status(errorsCount === 0 ? 200 : 207).json(response);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", stats: { total: 0, inserted: 0, updated: 0, errors: 1 } });
  }
});

router.get("/", async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    const items = await db.select().from(videos).limit(parseInt(limit as string)).offset(parseInt(offset as string));
    res.json({ items, total: items.length });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch videos" });
  }
});

export default router;
