import { Router } from 'express';
import { storage } from '../storage';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { tools } from '../shared/schema';
import { syncToolsFromSheet } from '../handlers/sync-tools';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { trending, featured, category, limit = 10, offset = 0, sort } = req.query;

    const isTrending = trending === 'true';
    const isFeatured = featured === 'true';

    const options = {
      category: category ? String(category) : undefined,
      featured: isFeatured,
      isTrending: isTrending,
      limit: Number(limit),
      offset: Number(offset),
      sort: sort ? String(sort) : undefined,
    };

    const result = await storage.getTools(options);

    // Force empty if trending requested but no trending tools
    if (isTrending) {
      const trendingOnly = result.items.filter(tool => tool.isTrending);
      if (trendingOnly.length === 0) {
        return res.json({ items: [], total: 0 });
      }
      return res.json({ items: trendingOnly, total: trendingOnly.length });
    }

    return res.json(result);
  } catch (error) {
    console.error('Error fetching tools:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:slug', async (req, res) => {
  const { slug } = req.params;
  console.log('Fetching tool with slug:', slug);

  try {
    const result = await db
      .select()
      .from(tools)
      .where(eq(tools.slug, slug.toLowerCase()));

    if (result.length === 0) {
      return res.status(404).json({ error: 'Tool not found' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error fetching tool:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/sync-from-sheet', syncToolsFromSheet);

export default router;
