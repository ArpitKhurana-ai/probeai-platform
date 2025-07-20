import algoliasearch from "algoliasearch";
import { storage } from "./storage";

const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID!;
const ALGOLIA_API_KEY = process.env.ALGOLIA_API_KEY!;
const ALGOLIA_INDEX_NAME = "tools";

const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);
const index = client.initIndex(ALGOLIA_INDEX_NAME);

export async function initializeAlgolia() {
  if (!ALGOLIA_APP_ID || !ALGOLIA_API_KEY) {
    console.log("Algolia credentials not set – skipping sync.");
    return;
  }

  try {
    console.log("🧹 Clearing existing Algolia index...");
    await index.clearObjects();

    // Setup attributes and ranking
    await index.setSettings({
      searchableAttributes: [
        "name",
        "description",
        "shortDescription",
        "category",
        "tags",
        "logo",
        "logoUrl"
      ],
      attributesForFaceting: ["category"],
      customRanking: ["desc(featured)", "desc(hot)"],
      attributesToSnippet: ["description:20"],
      attributesToHighlight: ["name", "category"],
      typoTolerance: true,
      minWordSizefor1Typo: 4,
      minWordSizefor2Typos: 8
    });

    // Fetch all tools from DB
    const allTools = await storage.getTools({ limit: 1000, offset: 0 });

    const records = allTools.items.map((tool) => ({
      objectID: tool.slug || tool.name.toLowerCase().replace(/\s+/g, "-"),
      slug: tool.slug,
      name: tool.name,
      description: tool.description,
      shortDescription: tool.shortDescription,
      category: tool.category,
      tags: tool.tags || [],
      website: tool.website,
      logo: tool.logo || tool.logoUrl || "",
      logoUrl: tool.logoUrl || "",
      featured: tool.isFeatured || false,
      hot: tool.isTrending || false
    }));

    await index.saveObjects(records);

    console.log(`✅ Synced ${records.length} tools to Algolia (with logo).`);
  } catch (err: any) {
    console.error("Algolia sync failed:", err.message);
  }
}

export async function syncSingleToolToAlgoliaByName(toolName: string) {
  const allTools = await storage.getTools({ limit: 1000, offset: 0 });
  const tool = allTools.items.find(
    (t) => t.name.toLowerCase() === toolName.toLowerCase()
  );

  if (!tool) {
    throw new Error(`Tool with name "${toolName}" not found`);
  }

  const record = {
    objectID: tool.slug || tool.name.toLowerCase().replace(/\s+/g, "-"),
    slug: tool.slug,
    name: tool.name,
    description: tool.description,
    shortDescription: tool.shortDescription,
    category: tool.category,
    tags: tool.tags || [],
    website: tool.website,
    logo: tool.logo || tool.logoUrl || "",
    logoUrl: tool.logoUrl || "",
    featured: tool.isFeatured || false,
    hot: tool.isTrending || false
  };

  await index.saveObject(record);
  console.log(`🔄 Synced tool "${tool.name}" to Algolia (with logo).`);
}
