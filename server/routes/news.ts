import { Router } from "express";
import { db } from "../db";
import { news } from "../shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

// ----------------------------------------
// Types
// ----------------------------------------
interface IncomingNews {
  title: string;
  source?: string;
  sourceUrl?: string;
  publishDate?: string;
  isApproved?: boolean;
  isPublished?: boolean;
}

interface SyncNewsRequest {
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

// ----------------------------------------
// Transform & Insert Helper
// ----------------------------------------
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

// ----------------------------------------
// POST /api/news/sync-from-sheet
// ----------------------------------------
router.post("/sync-from-sheet", async (req, res) => {
  try {
    const { news: incomingNews }: SyncNewsRequest = req.body;

    if (!incomingNews || !Array.isArray(incomingNews)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request: 'news' array is required",
        stats: { total: 0, inserted: 0, updated: 0, errors: 1 },
      });
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
          await db
            .update(news)
            .set({ ...transformed })
            .where(eq(news.title, item.title));
          updatedCount++;
          console.log(`🔄 Updated: ${item.title}`);
        } else {
          await db.insert(news).values(transformed);
          insertedCount++;
          console.log(`➕ Inserted: ${item.title}`);
        }
      } catch (err) {
        console.error(`Error processing news item '${item.title}':`, err);
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
// GET /api/news
// ----------------------------------------
router.get("/", async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    const items = await db
      .select()
      .from(news)
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    res.json({ items, total: items.length });
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({ message: "Failed to fetch news" });
  }
});

export default router;
