import { Router } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm'; // ✅ FIXED: Added this import
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

export default router;
