import { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { tools } from '../shared/schema';
import algoliasearch from 'algoliasearch';
import { config } from 'dotenv';
config();

// Algolia setup
const algoliaClient = algoliasearch(
  process.env.ALGOLIA_APP_ID!,
  process.env.ALGOLIA_API_KEY!
);
const algoliaIndex = algoliaClient.initIndex('tools');

interface IncomingTool {
  name: string;
  slug: string;
  url: string;
  logo: string;
  shortDescription?: string;
  description: string;
  howItWorks?: string;
  keyFeatures?: any;
  prosAndCons?: any;
  faqs?: any[];
  useCases?: any;
  category: string;
  tags?: any;
  audience?: any;
  access?: any;
  pricingType?: string;
  metaTitle?: string;
  metaDescription?: string;
  schema?: any;
  isTrending?: boolean;
  isFeatured?: boolean;
  isPublished?: boolean;
  isApproved?: boolean;
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

// FIX: Do not split on commas
function normalizeArrayField(input: any): string[] {
  if (Array.isArray(input)) return input.map((s) => String(s).trim()).filter(Boolean);

  if (typeof input === "string") {
    return input
      .split(/\r?\n|;/) // split only on newlines or semicolons
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

// FIX: Do not split on commas, only newlines or leading dashes
function parseBulletPoints(input: any): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input.map((s) => String(s).trim());

  // Split only at newlines or when a dash starts a new bullet
  return input
    .split(/\s*-\s+/) // split only at dash + space
    .map((s: string) => s.trim())
    .filter((s) => s.length > 0);
}



function safeJsonParse(data: any, fallback: any = null) {
  try {
    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch {
    return fallback;
  }
}

function transformToolData(tool: IncomingTool) {
  const now = new Date();
  return {
    slug: tool.slug,
    name: tool.name,
    description: tool.description,
    shortDescription: tool.shortDescription || null,
    website: tool.url,
    logoUrl: tool.logo,
    category: tool.category,
    tags: normalizeArrayField(tool.tags),
    keyFeatures: parseBulletPoints(tool.keyFeatures), // FIXED
    useCases: parseBulletPoints(tool.useCases),       // FIXED
    faqs: safeJsonParse(tool.faqs, []),
    prosAndCons: safeJsonParse(tool.prosAndCons, { pros: [], cons: [] }),
    pricingType: tool.pricingType || null,
    audience: normalizeArrayField(tool.audience),
    access: normalizeArrayField(tool.access),
    howItWorks: tool.howItWorks || null,
    metaTitle: tool.metaTitle || null,
    metaDescription: tool.metaDescription || null,
    schema: safeJsonParse(tool.schema, {}),
    isFeatured: !!tool.isFeatured,
    isTrending: !!tool.isTrending,
    isApproved: !!tool.isPublished || !!tool.isApproved,
    updatedAt: now,
  };
}

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

        // Debug log for Algolia payload
        const algoliaPayload = {
          objectID: tool.slug,
          slug: tool.slug,
          name: tool.name,
          description: tool.description,
          shortDescription: tool.shortDescription || "",
          logo: tool.logo || tool.logoUrl || "",
          howItWorks: tool.howItWorks || "",
          keyFeatures: parseBulletPoints(tool.keyFeatures), // FIXED
          useCases: parseBulletPoints(tool.useCases),       // FIXED
          prosAndCons: safeJsonParse(tool.prosAndCons, { pros: [], cons: [] }),
          faqs: safeJsonParse(tool.faqs, []),
          category: tool.category,
          tags: normalizeArrayField(tool.tags),
          audience: normalizeArrayField(tool.audience),
          access: normalizeArrayField(tool.access),
          pricingType: tool.pricingType || "",
          metaTitle: tool.metaTitle || "",
          metaDescription: tool.metaDescription || "",
          isFeatured: !!tool.isFeatured,
          isTrending: !!tool.isTrending,
          _searchData: [
            tool.name,
            tool.description,
            tool.shortDescription,
            tool.howItWorks,
            (tool.keyFeatures || []).join(" "),
            (tool.useCases || []).join(" "),
            (tool.tags || []).join(" "),
            (tool.audience || []).join(" "),
            (tool.access || []).join(" "),
            tool.metaTitle,
            tool.metaDescription,
          ]
          .filter(Boolean)
          .join(" "),
        };

        console.log("🚀 Sending to Algolia:", algoliaPayload);
        await algoliaIndex.saveObject(algoliaPayload);

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
