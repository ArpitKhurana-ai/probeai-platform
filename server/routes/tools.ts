import { Router } from 'express';
import { db } from '../db';
import { sql, eq } from 'drizzle-orm';
import { tools } from '../shared/schema';

const router = Router();

// GET /api/tools/:slug → fetch tool by slug
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;
  console.log('🔍 Requested tool slug:', slug);

  try {
    const result = await db
      .select()
      .from(tools)
      .where(sql`LOWER(${tools.slug}) = LOWER(${slug})`);

    if (result.length === 0) {
      console.warn('⚠️ Tool not found for slug:', slug);
      return res.status(404).json({ error: 'Tool not found' });
    }

    console.log('✅ Tool found:', result[0].name);
    res.json(result[0]);
  } catch (error) {
    console.error('❌ FULL ERROR fetching tool by slug:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ POST /api/tools/sync-from-sheet
router.post('/sync-from-sheet', async (req, res) => {
  try {
    const { tools: incomingTools } = req.body;

    if (!Array.isArray(incomingTools)) {
      return res.status(400).json({ error: 'Invalid payload. Expected an array of tools.' });
    }

    const results = [];

    for (const tool of incomingTools) {
      const {
        name,
        slug,
        description,
        logo,
        url,
        category,
        tags,
        isFeatured,
        isPublished
      } = tool;

      const logo_url = logo;
      const website = url;

      const existing = await db.select().from(tools).where(eq(tools.slug, slug));

      if (existing.length > 0) {
        // ✅ UPDATE existing tool
        await db
          .update(tools)
          .set({
            name,
            description,
            logo_url,
            website,
            category,
            tags,
            is_featured: isFeatured,
            is_approved: isPublished,
            updated_at: new Date(),
          })
          .where(eq(tools.slug, slug));

        results.push({ slug, status: 'updated' });
      } else {
        // ✅ INSERT new tool
        await db.insert(tools).values({
          name,
          slug,
          description,
          logo_url,
          website,
          category,
          tags,
          is_featured: isFeatured,
          is_approved: isPublished,
          created_at: new Date(),
          updated_at: new Date(),
        });

        results.push({ slug, status: 'inserted' });
      }
    }

    res.json({ success: true, results });
  } catch (err) {
    console.error('❌ Error in sync-from-sheet:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
