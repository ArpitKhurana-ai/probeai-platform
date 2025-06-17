import algoliasearch from 'algoliasearch';

if (!import.meta.env.VITE_ALGOLIA_APP_ID || !import.meta.env.VITE_ALGOLIA_SEARCH_KEY) {
  console.warn('Algolia credentials not found. Search will use fallback API.');
}

const client = algoliasearch(
  import.meta.env.VITE_ALGOLIA_APP_ID || '', 
  import.meta.env.VITE_ALGOLIA_SEARCH_KEY || ''
);

const toolsIndex = client.initIndex('tools');

export async function searchToolsAlgolia(query: string, options: {
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
    console.error('Frontend Algolia search failed:', error);
    throw error;
  }
}

export { toolsIndex };