import { Router } from 'express';
import { db } from '../db';
import { sql, eq } from 'drizzle-orm';
import { tools } from '../shared/schema';
import { syncToolsFromSheet } from '../handlers/sync-tools';

const router = Router();

// GET /api/tools/:slug → fetch tool by slug
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const result = await db
      .select()
      .from(tools)
      .where(eq(sql`LOWER(${tools.slug})`, slug.toLowerCase()));

    if (result.length === 0) return res.status(404).json({ error: 'Tool not found' });
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/tools/sync-from-sheet
router.post('/sync-from-sheet', syncToolsFromSheet);

export default router;
