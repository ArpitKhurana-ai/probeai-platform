import { Router } from "express";
import { db } from "../db";
import { videos } from "../shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

// ----------------------------------------
// Types
// ----------------------------------------
interface IncomingVideo {
  title: string;
  slug: string;
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
  stats: {
    total: number;
    inserted: number;
    updated: number;
    errors: number;
  };
  errors?: string[];
}

// ----------------------------------------
// Slug Helper
// ----------------------------------------
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ----------------------------------------
// Transform & Insert Helper
// ----------------------------------------
function transformVideoItem(item: IncomingVideo) {
  return {
    title: item.title.trim(),
    slug: item.slug ? item.slug : generateSlug(item.title),
    youtubeUrl: item.youtubeUrl,
    publishDate: item.publishDate ? new Date(item.publishDate) : new Date(),
    isApproved: !!item.isApproved,
    isPublished: !!item.isPublished,
    createdAt: new Date(),
  };
}

// ----------------------------------------
// POST /api/videos/sync-from-sheet
// ----------------------------------------
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
        if (!item.title || !item.youtubeUrl) {
          errors.push("❌ Missing title or youtubeUrl in one of the videos.");
          errorsCount++;
          continue;
        }

        const videoSlug = item.slug ? item.slug : generateSlug(item.title);
        const existing = await db
          .select()
          .from(videos)
          .where(eq(videos.slug, videoSlug))
          .limit(1);

        const transformed = transformVideoItem({ ...item, slug: videoSlug });

        if (existing.length > 0) {
          await db
            .update(videos)
            .set({ ...transformed })
            .where(eq(videos.slug, videoSlug));
          updatedCount++;
          console.log(`🔄 Updated: ${videoSlug}`);
        } else {
          await db.insert(videos).values(transformed);
          insertedCount++;
          console.log(`➕ Inserted: ${videoSlug}`);
        }
      } catch (err) {
        console.error(`Error processing video item '${item.title}':`, err);
        errorsCount++;
        errors.push(`❌ ${item.title}: ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    }

    const response: SyncResponse = {
      success: errorsCount === 0,
      message:
        errorsCount === 0
          ? `Successfully synced ${incomingVideos.length} video items`
          : `Synced with ${errorsCount} errors`,
      stats: {
        total: incomingVideos.length,
        inserted: insertedCount,
        updated: updatedCount,
        errors: errorsCount,
      },
      errors: errors.length > 0 ? errors : undefined,
    };

    res.status(errorsCount === 0 ? 200 : 207).json(response);
  } catch (error) {
    console.error("❌ Sync failed:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during sync",
      stats: { total: 0, inserted: 0, updated: 0, errors: 1 },
      errors: [error instanceof Error ? error.message : "Unknown error"],
    });
  }
});

// ----------------------------------------
// GET /api/videos
// ----------------------------------------
router.get("/", async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    const items = await db
      .select()
      .from(videos)
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    res.json({ items, total: items.length });
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ message: "Failed to fetch videos" });
  }
});

export default router;
