import { storage } from './storage';

let algoliaClient: any = null;
let algoliaIndex: any = null;
let useAlgolia = false;

// Initialize Algolia search
export async function initializeAlgolia() {
  if (!process.env.ALGOLIA_APP_ID || !process.env.ALGOLIA_API_KEY) {
    console.log('Using database search - Algolia credentials not configured');
    return true;
  }

  try {
    // Configure Algolia index settings via HTTP API
    const settingsResponse = await fetch(
      `https://${process.env.ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/tools/settings`,
      {
        method: 'PUT',
        headers: {
          'X-Algolia-API-Key': process.env.ALGOLIA_API_KEY,
          'X-Algolia-Application-Id': process.env.ALGOLIA_APP_ID,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          searchableAttributes: ['name', 'description', 'shortDescription', 'category', 'tags'],
          attributesForFaceting: ['category'],
          customRanking: ['desc(featured)', 'desc(hot)'],
          // Enable query suggestions
          attributesToSnippet: ['description:20'],
          attributesToHighlight: ['name', 'category'],
          typoTolerance: true,
          minWordSizefor1Typo: 4,
          minWordSizefor2Typos: 8
        })
      }
    );

    if (!settingsResponse.ok) {
      throw new Error(`Settings API failed: ${settingsResponse.statusText}`);
    }

    // Get all tools from database and index them
    const allTools = await storage.getTools({ limit: 1000, offset: 0 });
    
    if (allTools.items.length > 0) {
      const algoliaObjects = allTools.items.map(tool => ({
        objectID: tool.id.toString(),
        name: tool.name,
        description: tool.description,
        shortDescription: tool.shortDescription,
        category: tool.category,
        tags: tool.tags || [],
        website: tool.website,
        logoUrl: tool.logoUrl,
        featured: tool.isFeatured || false,
        hot: tool.isHot || false
      }));

      // Upload objects to Algolia via HTTP API
      const indexResponse = await fetch(
        `https://${process.env.ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/tools/batch`,
        {
          method: 'POST',
          headers: {
            'X-Algolia-API-Key': process.env.ALGOLIA_API_KEY,
            'X-Algolia-Application-Id': process.env.ALGOLIA_APP_ID,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            requests: algoliaObjects.map(obj => ({
              action: 'addObject',
              body: obj
            }))
          })
        }
      );

      if (!indexResponse.ok) {
        throw new Error(`Index API failed: ${indexResponse.statusText}`);
      }

      console.log(`Algolia search initialized successfully. Indexed ${allTools.items.length} tools.`);
      useAlgolia = true;
    }
    
    return true;
  } catch (error) {
    console.error('Algolia initialization failed:', error);
    console.log('Falling back to database search');
    return false;
  }
}

// Search function that uses Algolia HTTP API if available, otherwise database
export async function searchTools(query: string, options: {
  page?: number;
  hitsPerPage?: number;
  filters?: string;
  facetFilters?: string[];
} = {}) {
  const { page = 0, hitsPerPage = 20 } = options;

  // Use Algolia HTTP API if configured
  if (useAlgolia && process.env.ALGOLIA_APP_ID && process.env.ALGOLIA_SEARCH_KEY) {
    try {
      const searchResponse = await fetch(
        `https://${process.env.ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/tools/query`,
        {
          method: 'POST',
          headers: {
            'X-Algolia-API-Key': process.env.ALGOLIA_SEARCH_KEY,
            'X-Algolia-Application-Id': process.env.ALGOLIA_APP_ID,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query: query.trim(),
            page,
            hitsPerPage,
            filters: options.filters,
            facetFilters: options.facetFilters
          })
        }
      );

      if (searchResponse.ok) {
        const searchResults = await searchResponse.json();
        return {
          items: searchResults.hits.map((hit: any) => ({
            id: parseInt(hit.objectID),
            name: hit.name,
            description: hit.description,
            shortDescription: hit.shortDescription,
            category: hit.category,
            tags: hit.tags,
            website: hit.website,
            logoUrl: hit.logoUrl,
            isFeatured: hit.featured,
            isHot: hit.hot
          })),
          total: searchResults.nbHits,
          totalPages: searchResults.nbPages,
          currentPage: page,
          query: query.trim()
        };
      }
    } catch (error) {
      console.error('Algolia search error, falling back to database:', error);
    }
  }

  // Fallback to database search
  const offset = page * hitsPerPage;
  const result = await storage.searchTools({
    query: query.trim(),
    limit: hitsPerPage,
    offset,
  });
  
  return {
    items: result.items,
    total: result.total,
    totalPages: Math.ceil(result.total / hitsPerPage),
    currentPage: page,
    query: query.trim()
  };
}

// Get query suggestions from Algolia
export async function getQuerySuggestions(query: string, limit: number = 5) {
  if (!query.trim() || query.length < 2) {
    return [];
  }

  // Use Algolia HTTP API for suggestions if configured
  if (useAlgolia && process.env.ALGOLIA_APP_ID && process.env.ALGOLIA_SEARCH_KEY) {
    try {
      const searchResponse = await fetch(
        `https://${process.env.ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/tools/query`,
        {
          method: 'POST',
          headers: {
            'X-Algolia-API-Key': process.env.ALGOLIA_SEARCH_KEY,
            'X-Algolia-Application-Id': process.env.ALGOLIA_APP_ID,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query: query.trim(),
            hitsPerPage: limit,
            attributesToRetrieve: ['name', 'category'],
            attributesToHighlight: ['name']
          })
        }
      );

      if (searchResponse.ok) {
        const searchResults = await searchResponse.json();
        return searchResults.hits.map((hit: any) => ({
          query: hit.name,
          category: hit.category,
          highlighted: hit._highlightResult?.name?.value || hit.name
        }));
      }
    } catch (error) {
      console.error('Algolia suggestions error:', error);
    }
  }

  // Fallback: Get suggestions from database
  const result = await storage.searchTools({
    query: query.trim(),
    limit,
    offset: 0,
  });
  
  return result.items.map(tool => ({
    query: tool.name,
    category: tool.category,
    highlighted: tool.name
  }));
}