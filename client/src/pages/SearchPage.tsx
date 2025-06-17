import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { ToolCard } from "@/components/ToolCard";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/SearchBar";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Tool } from "./shared/schema";

interface SearchResults {
  items: Tool[];
  total: number;
  query: string;
}

export default function SearchPage() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const toolsPerPage = 10;

  // Update state when URL parameters change
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q') || '';
    const page = parseInt(urlParams.get('page') || '1');
    
    setSearchQuery(query);
    setCurrentPage(page);
  }, [location]);
  
  const { data: searchResults, isLoading, error } = useQuery<SearchResults>({
    queryKey: ["/api/search", searchQuery, currentPage, toolsPerPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        q: searchQuery,
        page: currentPage.toString(),
        limit: toolsPerPage.toString()
      });
      const url = `/api/search?${params}`;
      console.log('Making search request:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Don't include credentials for public search
      });
      
      console.log('Search response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Search API error:', errorText);
        throw new Error(`Search failed: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Search response data:', data);
      return data;
    },
    enabled: !!searchQuery && searchQuery.trim().length > 0,
    retry: (failureCount, error) => {
      if (error.message.includes('401')) {
        return false;
      }
      return failureCount < 3;
    },
  });

  console.log('Search component state:', {
    searchQuery,
    enabled: !!searchQuery && searchQuery.trim().length > 0,
    isLoading,
    error: error?.message,
    hasResults: searchResults?.items?.length,
    totalResults: searchResults?.total
  });

  const totalPages = searchResults ? Math.ceil(searchResults.total / toolsPerPage) : 0;

  const handleSearch = (query: string) => {
    if (query.trim()) {
      const searchUrl = `/search?q=${encodeURIComponent(query.trim())}`;
      // Force full page reload to ensure proper state update
      window.location.href = searchUrl;
    }
  };

  const handlePageChange = (page: number) => {
    const newUrl = `/search?q=${encodeURIComponent(searchQuery)}&page=${page}`;
    setLocation(newUrl);
  };

  if (!searchQuery) {
    return (
      <Layout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-foreground mb-8">Search AI Tools</h1>
            <SearchBar 
              onSearch={handleSearch}
              initialValue=""
            />
            <p className="text-muted-foreground mt-4">
              Search across thousands of AI tools by name, category, features, and more.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar 
            onSearch={handleSearch}
            className="max-w-4xl"
            initialValue={searchQuery}
          />
        </div>

        {/* Search Results Header */}
        <div className="mb-8">
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/4"></div>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Search results for '{searchQuery}'
              </h1>
              <p className="text-muted-foreground">
                {searchResults?.total || 0} tools found
              </p>
            </>
          )}
        </div>

        {/* Search Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-muted rounded-lg h-64"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive">Search failed: {(error as any)?.message || 'Unknown error'}</p>
          </div>
        ) : searchResults && searchResults.items && searchResults.items.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {searchResults.items.map((tool: any) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * toolsPerPage + 1} to {Math.min(currentPage * toolsPerPage, searchResults.total)} of {searchResults.total} tools
                </p>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : searchQuery ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No tools found
            </h3>
            <p className="text-muted-foreground mb-6">
              We couldn't find any tools matching "{searchQuery}". Try different keywords or browse our categories.
            </p>
            <Button onClick={() => setLocation('/')}>
              Browse All Tools
            </Button>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Enter a search term to find AI tools
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}