import { Request, Response } from "express";
import { db } from "../db";
import { news } from "../shared/schema";
import { eq } from "drizzle-orm";

interface IncomingNews {
  title: string;
  source?: string;
  sourceUrl?: string;
  publishDate?: string;
  isApproved?: boolean;
  isPublished?: boolean;
}

interface SyncRequest {
  news: IncomingNews[];
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

/**
 * Transform incoming Google Sheet data into DB-ready structure
 */
function transformNewsItem(item: IncomingNews) {
  return {
    title: item.title.trim(),
    source: item.source || null,
    sourceUrl: item.sourceUrl || null,
    publishDate: item.publishDate ? new Date(item.publishDate) : new Date(),
    isApproved: !!item.isApproved,
    isPublished: !!item.isPublished,
    createdAt: new Date(),
  };
}

/**
 * POST /api/news/sync-from-sheet
 * Handles bulk news sync from Google Sheets
 */
export async function syncNewsFromSheet(req: Request, res: Response): Promise<void> {
  try {
    const { news: incomingNews }: SyncRequest = req.body;

    if (!incomingNews || !Array.isArray(incomingNews)) {
      res.status(400).json({
        success: false,
        message: "Invalid request: 'news' array is required",
        stats: { total: 0, inserted: 0, updated: 0, errors: 1 },
      });
      return;
    }

    let insertedCount = 0;
    let updatedCount = 0;
    let errorsCount = 0;
    const errors: string[] = [];

    for (const item of incomingNews) {
      try {
        if (!item.title) {
          errors.push("❌ Missing title in one of the news items.");
          errorsCount++;
          continue;
        }

        const existing = await db
          .select()
          .from(news)
          .where(eq(news.title, item.title))
          .limit(1);

        const transformed = transformNewsItem(item);

        if (existing.length > 0) {
          await db.update(news).set(transformed).where(eq(news.title, item.title));
          updatedCount++;
          console.log(`🔄 Updated news: ${item.title}`);
        } else {
          await db.insert(news).values(transformed);
          insertedCount++;
          console.log(`➕ Inserted news: ${item.title}`);
        }
      } catch (err) {
        errorsCount++;
        errors.push(`❌ ${item.title}: ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    }

    const response: SyncResponse = {
      success: errorsCount === 0,
      message:
        errorsCount === 0
          ? `Successfully synced ${incomingNews.length} news items`
          : `Synced with ${errorsCount} errors`,
      stats: {
        total: incomingNews.length,
        inserted: insertedCount,
        updated: updatedCount,
        errors: errorsCount,
      },
      errors: errors.length > 0 ? errors : undefined,
    };

    res.status(errorsCount === 0 ? 200 : 207).json(response);
  } catch (error) {
    console.error("❌ News sync failed:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during news sync",
      stats: { total: 0, inserted: 0, updated: 0, errors: 1 },
      errors: [error instanceof Error ? error.message : "Unknown error"],
    });
  }
}
