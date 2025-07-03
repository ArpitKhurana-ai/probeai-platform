import { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db'; // Adjust path to your db instance
import { tools } from '../shared/schema'; // Adjust path to your schema

// Type definitions
interface IncomingTool {
  name: string;
  slug: string;
  description: string;
  url: string;
  logo: string;
  category: string;
  tags: string;
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
    website: tool.url, // Transform url → website
    logo_url: tool.logo, // Transform logo → logo_url
    category: tool.category,
    tags: tool.tags,
    is_featured: tool.isFeatured,
    is_approved: tool.isPublished, // Transform isPublished → is_approved
    updated_at: now,
  };
}

// Main route handler
export async function syncToolsFromSheet(req: Request, res: Response): Promise<void> {
  try {
    const { tools: incomingTools }: SyncRequest = req.body;

    // Validation
    if (!incomingTools || !Array.isArray(incomingTools)) {
      res.status(400).json({
        success: false,
        message: 'Invalid request: tools array is required',
        stats: { total: 0, inserted: 0, updated: 0, errors: 1 }
      });
      return;
    }

    if (incomingTools.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Invalid request: tools array cannot be empty',
        stats: { total: 0, inserted: 0, updated: 0, errors: 1 }
      });
      return;
    }

    // Validate required fields
    const requiredFields = ['name', 'slug', 'description', 'url', 'logo', 'category'];
    for (const tool of incomingTools) {
      for (const field of requiredFields) {
        if (!tool[field as keyof IncomingTool]) {
          res.status(400).json({
            success: false,
            message: `Invalid tool data: missing required field '${field}' for tool with slug '${tool.slug || 'unknown'}'`,
            stats: { total: incomingTools.length, inserted: 0, updated: 0, errors: 1 }
          });
          return;
        }
      }
    }

    let insertedCount = 0;
    let updatedCount = 0;
    let errorsCount = 0;
    const errors: string[] = [];

    console.log(`🔄 Processing ${incomingTools.length} tools from Google Sheets...`);

    // Process each tool individually to handle upserts properly
    for (const incomingTool of incomingTools) {
      try {
        // Check if tool exists
        const existingTool = await db
          .select()
          .from(tools)
          .where(eq(tools.slug, incomingTool.slug))
          .limit(1);

        const transformedData = transformToolData(incomingTool);

        if (existingTool.length > 0) {
          // Tool exists - UPDATE
          await db
            .update(tools)
            .set(transformedData)
            .where(eq(tools.slug, incomingTool.slug));
          
          updatedCount++;
          console.log(`✅ Updated tool: ${incomingTool.slug}`);
        } else {
          // Tool doesn't exist - INSERT
          const insertData = {
            ...transformedData,
            created_at: new Date(), // Set created_at only for new records
          };

          await db
            .insert(tools)
            .values(insertData);
          
          insertedCount++;
          console.log(`➕ Inserted new tool: ${incomingTool.slug}`);
        }
      } catch (toolError) {
        errorsCount++;
        const errorMessage = `Failed to process tool '${incomingTool.slug}': ${toolError instanceof Error ? toolError.message : 'Unknown error'}`;
        errors.push(errorMessage);
        console.error(`❌ ${errorMessage}`);
      }
    }

    // Response
    const response: SyncResponse = {
      success: errorsCount === 0,
      message: errorsCount === 0 
        ? `Successfully synced ${incomingTools.length} tools`
        : `Synced with ${errorsCount} errors`,
      stats: {
        total: incomingTools.length,
        inserted: insertedCount,
        updated: updatedCount,
        errors: errorsCount
      }
    };

    if (errors.length > 0) {
      response.errors = errors;
    }

    console.log(`🎉 Sync complete: ${insertedCount} inserted, ${updatedCount} updated, ${errorsCount} errors`);

    res.status(errorsCount === 0 ? 200 : 207).json(response); // 207 = Multi-Status for partial success

  } catch (error) {
    console.error('❌ Sync endpoint error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error during sync',
      stats: { total: 0, inserted: 0, updated: 0, errors: 1 },
      errors: [error instanceof Error ? error.message : 'Unknown server error']
    });
  }
}

// Express route registration (add this to your routes file)
// app.post('/api/tools/sync-from-sheet', syncToolsFromSheet);