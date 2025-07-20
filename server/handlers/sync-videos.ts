import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { videos } from "../shared/schema";

interface IncomingVideo {
  title: string;
  slug: string; // Required now
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

// ------------------------------
// Transform Google Sheet row into DB-friendly object
// ------------------------------
function transformVideo(item: IncomingVideo) {
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

// ------------------------------
// POST /api/videos/sync-from-sheet
// ------------------------------
export async function syncVideosFromSheet(req: Request, res: Response): Promise<void> {
  try {
    const { videos: incomingVideos }: SyncVideoRequest = req.body;

    if (!incomingVideos || !Array.isArray(incomingVideos)) {
      res.status(400).json({
        success: false,
        message: "Invalid request: 'videos' array is required",
        stats: { total: 0, inserted: 0, updated: 0, errors: 1 },
      });
      return;
    }

    let insertedCount = 0;
    let updatedCount = 0;
    let errorsCount = 0;
    const errors: string[] = [];

    for (const video of incomingVideos) {
      try {
        if (!video.title || !video.youtubeUrl || !video.slug) {
          errors.push(`❌ Missing required fields (title/youtubeUrl/slug) for: ${video.title || "unknown"}`);
          errorsCount++;
          continue;
        }

        const existing = await db.select().from(videos).where(eq(videos.slug, video.slug)).limit(1);
        const transformed = transformVideo(video);

        if (existing.length > 0) {
          await db.update(videos).set(transformed).where(eq(videos.slug, video.slug));
          updatedCount++;
          console.log(`🔄 Updated video: ${video.title}`);
        } else {
          await db.insert(videos).values(transformed);
          insertedCount++;
          console.log(`➕ Inserted video: ${video.title}`);
        }
      } catch (err) {
        console.error(`Error processing video '${video.title}':`, err);
        errorsCount++;
        errors.push(`❌ ${video.title}: ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    }

    const response: SyncResponse = {
      success: errorsCount === 0,
      message:
        errorsCount === 0
          ? `Successfully synced ${incomingVideos.length} videos`
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
    console.error("❌ Sync videos failed:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during sync",
      stats: { total: 0, inserted: 0, updated: 0, errors: 1 },
      errors: [error instanceof Error ? error.message : "Unknown error"],
    });
  }
}
