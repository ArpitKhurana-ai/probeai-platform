import { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { tools } from '../shared/schema';
import algoliasearch from 'algoliasearch';
import { config } from 'dotenv';
config();

// ✅ Algolia setup — renamed index from 'probeai_tools' → 'tools'
const algoliaClient = algoliasearch(
  process.env.ALGOLIA_APP_ID!,
  process.env.ALGOLIA_API_KEY!
);
const algoliaIndex = algoliaClient.initIndex('tools');

// Type definitions
interface IncomingTool {
  name: string;
  slug: string;
  description: string;
  url: string;
  logo: string;
  category: string;
  tags: string[];
  isFeatured: boolean;
  isPublished: boolean;
}

interface SyncRequest {
  tools: IncomingTool[];
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

// Transform incoming tool data to match DB schema
function transformToolData(tool: IncomingTool) {
  const now = new Date();

  return {
    slug: tool.slug,
    name: tool.name,
    description: tool.description,
    website: tool.url,
    logo_url: tool.logo,
    category: tool.category,
    tags: tool.tags,
    is_featured: tool.isFeatured,
    is_approved: tool.isPublished,
    updated_at: now,
  };
}

// Main route handler
export async function syncToolsFromSheet(req: Request, res: Response): Promise<void> {
  try {
    const { tools: incomingTools }: SyncRequest = req.body;

    if (!incomingTools || !Array.isArray(incomingTools)) {
      res.status(400).json({
        success: false,
        message: 'Invalid request: tools array is required',
        stats: { total: 0, inserted: 0, updated: 0, errors: 1 },
      });
      return;
    }

    if (incomingTools.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Invalid request: tools array cannot be empty',
        stats: { total: 0, inserted: 0, updated: 0, errors: 1 },
      });
      return;
    }

    const requiredFields = ['name', 'slug', 'description', 'url', 'logo', 'category'];
    for (const tool of incomingTools) {
      for (const field of requiredFields) {
        if (!tool[field as keyof IncomingTool]) {
          res.status(400).json({
            success: false,
            message: `Missing field '${field}' in tool '${tool.slug || 'unknown'}'`,
            stats: { total: incomingTools.length, inserted: 0, updated: 0, errors: 1 },
          });
          return;
        }
      }
    }

    let insertedCount = 0;
    let updatedCount = 0;
    let errorsCount = 0;
    const errors: string[] = [];

    for (const tool of incomingTools) {
      try {
        const exists = await db.select().from(tools).where(eq(tools.slug, tool.slug)).limit(1);
        const transformed = transformToolData(tool);

        if (exists.length > 0) {
          await db.update(tools).set(transformed).where(eq(tools.slug, tool.slug));
          updatedCount++;
          console.log(`✅ Updated: ${tool.slug}`);
        } else {
          await db.insert(tools).values({
            ...transformed,
            created_at: new Date(),
          });
          insertedCount++;
          console.log(`➕ Inserted: ${tool.slug}`);
        }

        // ✅ Push to Algolia (now on 'tools' index)
        await algoliaIndex.saveObject({
          objectID: tool.slug,
          ...tool,
        });

      } catch (err) {
        errorsCount++;
        errors.push(`❌ ${tool.slug}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    const response: SyncResponse = {
      success: errorsCount === 0,
      message:
        errorsCount === 0
          ? `Successfully synced ${incomingTools.length} tools`
          : `Synced with ${errorsCount} errors`,
      stats: {
        total: incomingTools.length,
        inserted: insertedCount,
        updated: updatedCount,
        errors: errorsCount,
      },
    };

    if (errors.length > 0) {
      response.errors = errors;
    }

    res.status(errorsCount === 0 ? 200 : 207).json(response);
  } catch (error) {
    console.error('❌ Sync failed:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during sync',
      stats: { total: 0, inserted: 0, updated: 0, errors: 1 },
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    });
  }
}
