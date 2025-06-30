import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { ToolCard } from "@/components/ToolCard";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/SearchBar";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { liteClient } from "algoliasearch/lite";

const client = liteClient("N19W8QAGPY", "4d9d414ea3f63d0952ea96f2dac8ec67");
const index = client.initIndex("tools");

interface Tool {
  objectID: string;
  name: string;
  description: string;
  slug: string;
  category: string;
  logo: string;
}

export default function SearchPage() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [tools, setTools] = useState<Tool[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toolsPerPage = 10;

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get("q") || "";
    const page = parseInt(urlParams.get("page") || "1");
    setSearchQuery(query);
    setCurrentPage(page);
  }, [location]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery.trim()) return;

      setIsLoading(true);
      setError(null);

      try {
        const result = await index.search(searchQuery, {
          hitsPerPage: toolsPerPage,
          page: currentPage - 1,
        });
        setTools(result.hits as Tool[]);
        setTotalResults(result.nbHits);
      } catch (err: any) {
        console.error("Algolia search error:", err);
        setError(err?.message || "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [searchQuery, currentPage]);

  const totalPages = Math.ceil(totalResults / toolsPerPage);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      const searchUrl = `/search?q=${encodeURIComponent(query.trim())}`;
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
            <h1 className="text-3xl font-bold text-foreground mb-8">
              Search AI Tools
            </h1>
            <SearchBar onSearch={handleSearch} initialValue="" />
            <p className="text-muted-foreground mt-4">
              Search across thousands of AI tools by name, category, features,
              and more.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <SearchBar
            onSearch={handleSearch}
            className="max-w-4xl"
            initialValue={searchQuery}
          />
        </div>

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
                {totalResults} tools found
              </p>
            </>
          )}
        </div>

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
            <p className="text-destructive">Search failed: {error}</p>
          </div>
        ) : tools.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {tools.map((tool) => (
                <ToolCard key={tool.objectID} tool={tool} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * toolsPerPage + 1} to{" "}
                  {Math.min(currentPage * toolsPerPage, totalResults)} of{" "}
                  {totalResults} tools
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
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No tools found
            </h3>
            <p className="text-muted-foreground mb-6">
              We couldn't find any tools matching "{searchQuery}". Try different
              keywords or browse our categories.
            </p>
            <Button onClick={() => setLocation("/")}>Browse All Tools</Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
