import { Router } from 'express';
import { storage } from '../storage'; // Use storage layer
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { tools } from '../shared/schema';
import { syncToolsFromSheet } from '../handlers/sync-tools';

const router = Router();

// GET /api/tools → fetch tools with optional filters
router.get('/', async (req, res) => {
  try {
    const { trending, featured, category, limit = 10, offset = 0, sort } = req.query;

    const options = {
      category: category ? String(category) : undefined,
      featured: featured === 'true',
      isTrending: trending === 'true',
      limit: Number(limit),
      offset: Number(offset),
      sort: sort ? String(sort) : undefined,
    };

    const result = await storage.getTools(options);
    return res.json(result);
  } catch (error) {
    console.error('Error fetching tools:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/tools/:slug → fetch tool by slug
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;
  console.log('Fetching tool with slug:', slug);

  try {
    const result = await db
      .select()
      .from(tools)
      .where(eq(tools.slug, slug.toLowerCase())); // Using eq for a clean match

    if (result.length === 0) {
      return res.status(404).json({ error: 'Tool not found' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error fetching tool:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/tools/sync-from-sheet
router.post('/sync-from-sheet', syncToolsFromSheet);

export default router;
