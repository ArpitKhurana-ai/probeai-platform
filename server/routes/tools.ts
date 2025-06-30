import { Router } from 'express';
import db from '../db';
import { eq } from 'drizzle-orm';
import { tools } from '../db-init'; // Adjust this path if `tools` model is elsewhere

const router = Router();

// GET /api/tools/:slug → fetch tool by slug
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;

  try {
    const result = await db
      .select()
      .from(tools)
      .where(eq(tools.slug, slug));

    if (result.length === 0) {
      return res.status(404).json({ error: 'Tool not found' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error fetching tool by slug:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
