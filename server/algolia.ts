import * as algoliasearch from 'algoliasearch';
import type { Tool } from '@shared/schema';

if (!process.env.ALGOLIA_APP_ID || !process.env.ALGOLIA_API_KEY) {
  throw new Error('Algolia credentials not found. Please set ALGOLIA_APP_ID and ALGOLIA_API_KEY');
}

const client = algoliasearch.default(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_API_KEY);
const toolsIndex = client.initIndex('tools');

// Configure index settings for optimal search
export async function configureIndex() {
  try {
    await toolsIndex.setSettings({
      searchableAttributes: [
        'name',
        'unordered(description)',
        'unordered(shortDescription)',
        'unordered(category)',
        'unordered(tags)',
        'unordered(keyFeatures)',
        'unordered(useCases)',
        'unordered(pricingType)',
        'unordered(accessType)',
        'unordered(aiTech)',
        'unordered(audience)'
      ],
      attributesForFaceting: [
        'category',
        'pricingType',
        'accessType',
        'aiTech',
        'audience',
        'isFeatured',
        'isHot'
      ],
      customRanking: [
        'desc(isFeatured)',
        'desc(isHot)',
        'desc(likes)'
      ],
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>',
      snippetEllipsisText: '…',
      hitsPerPage: 20
    });
    console.log('✓ Algolia index configured successfully');
  } catch (error) {
    console.error('✗ Failed to configure Algolia index:', error);
  }
}

// Transform tool data for Algolia
function transformToolForAlgolia(tool: Tool) {
  return {
    objectID: tool.id.toString(),
    name: tool.name,
    description: tool.description,
    shortDescription: tool.shortDescription,
    website: tool.website,
    logoUrl: tool.logoUrl,
    category: tool.category,
    tags: tool.tags || [],
    keyFeatures: tool.keyFeatures || [],
    useCases: tool.useCases || [],
    pricingType: tool.pricingType,
    accessType: tool.accessType,
    aiTech: tool.aiTech,
    audience: tool.audience,
    isFeatured: tool.isFeatured,
    isHot: tool.isHot,
    likes: tool.likes || 0,
    createdAt: tool.createdAt
  };
}

// Index a single tool
export async function indexTool(tool: Tool) {
  try {
    const algoliaObject = transformToolForAlgolia(tool);
    await toolsIndex.saveObject(algoliaObject);
    console.log(`✓ Indexed tool: ${tool.name}`);
  } catch (error) {
    console.error(`✗ Failed to index tool ${tool.name}:`, error);
  }
}

// Index multiple tools
export async function indexTools(tools: Tool[]) {
  try {
    const algoliaObjects = tools.map(transformToolForAlgolia);
    await toolsIndex.saveObjects(algoliaObjects);
    console.log(`✓ Indexed ${tools.length} tools to Algolia`);
  } catch (error) {
    console.error('✗ Failed to index tools:', error);
  }
}

// Remove a tool from index
export async function removeToolFromIndex(toolId: number) {
  try {
    await toolsIndex.deleteObject(toolId.toString());
    console.log(`✓ Removed tool ${toolId} from index`);
  } catch (error) {
    console.error(`✗ Failed to remove tool ${toolId} from index:`, error);
  }
}

// Search tools using Algolia
export async function searchTools(query: string, options: {
  page?: number;
  hitsPerPage?: number;
  filters?: string;
  facetFilters?: string[];
} = {}) {
  try {
    const { page = 0, hitsPerPage = 20, filters, facetFilters } = options;
    
    const searchOptions: any = {
      page,
      hitsPerPage,
      attributesToHighlight: ['name', 'description', 'shortDescription'],
      attributesToSnippet: ['description:50']
    };

    if (filters) {
      searchOptions.filters = filters;
    }

    if (facetFilters) {
      searchOptions.facetFilters = facetFilters;
    }

    const result = await toolsIndex.search(query, searchOptions);
    
    return {
      items: result.hits,
      total: result.nbHits,
      totalPages: result.nbPages,
      currentPage: result.page,
      query: result.query
    };
  } catch (error) {
    console.error('✗ Algolia search failed:', error);
    throw error;
  }
}

// Clear and rebuild entire index
export async function rebuildIndex(tools: Tool[]) {
  try {
    console.log('🔄 Rebuilding Algolia index...');
    await toolsIndex.clearObjects();
    await indexTools(tools);
    console.log('✓ Algolia index rebuilt successfully');
  } catch (error) {
    console.error('✗ Failed to rebuild index:', error);
  }
}

export { toolsIndex };