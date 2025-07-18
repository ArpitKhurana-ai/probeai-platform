import { Router, type Request, type Response } from "express";
import algoliasearch from "algoliasearch";
import dotenv from "dotenv";

dotenv.config();

const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID!;
const ALGOLIA_API_KEY = process.env.ALGOLIA_API_KEY!;
const ALGOLIA_INDEX_NAME = "tools";

const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);
const index = client.initIndex(ALGOLIA_INDEX_NAME);

const router = Router();

// Main search route
router.get("/", async (req: Request, res: Response) => {
  const query = (req.query.q as string) || "";
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  if (!query || query.trim().length === 0) {
    return res.json({ items: [], total: 0, query: "" });
  }

  try {
    const algoliaRes = await index.search(query, {
      page: page - 1,
      hitsPerPage: limit,
      attributesToRetrieve: ['name', 'slug', 'category', 'logo', 'shortDescription'], // ✅ Ensure slug & logo
    });

    console.log("🔍 Search Query:", query);
    console.log("🧠 Results:", algoliaRes.hits.map((hit: any) => hit.name));

    res.json({
      items: algoliaRes.hits,
      total: algoliaRes.nbHits,
      query,
    });
  } catch (error: any) {
    console.error("Algolia search failed:", error.message);
    res.status(500).json({ error: "Search failed", details: error.message });
  }
});

// Suggestions route
router.get("/suggestions", async (req: Request, res: Response) => {
  const query = (req.query.q as string) || "";
  const limit = parseInt(req.query.limit as string) || 5;

  if (!query || query.trim().length < 2) {
    return res.json([]);
  }

  try {
    const algoliaRes = await index.search(query, {
      hitsPerPage: limit,
      attributesToRetrieve: ['name', 'slug', 'category'], // ✅ Added slug
      attributesToHighlight: ['name'],
    });

    const suggestions = algoliaRes.hits.map((hit: any) => ({
      name: hit.name,
      slug: hit.slug, // ✅ Include slug
      category: hit.category,
      highlighted: hit._highlightResult?.name?.value || hit.name
    }));

    res.json(suggestions);
  } catch (error: any) {
    console.error("Algolia suggestions failed:", error.message);
    res.status(500).json({ error: "Suggestions failed", details: error.message });
  }
});

export default router;
