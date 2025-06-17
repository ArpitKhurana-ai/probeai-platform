import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

export default function NewsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const newsPerPage = 20;

  const { data: news, isLoading } = useQuery({
    queryKey: ["/api/news", `limit=${newsPerPage}&offset=${(currentPage - 1) * newsPerPage}`],
  });

  const totalPages = Math.ceil((news?.total || 0) / newsPerPage);

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            AI News
          </h1>
          <p className="text-muted-foreground text-lg">
            Stay updated with the latest news and developments in artificial intelligence.
          </p>
        </div>

        {/* News List */}
        {isLoading ? (
          <div className="space-y-4 mb-8">
            {Array.from({ length: newsPerPage }).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-lg shimmer"></div>
            ))}
          </div>
        ) : news?.items?.length > 0 ? (
          <>
            <div className="space-y-2 mb-8">
              {news.items.map((article: any) => (
                <div 
                  key={article.id} 
                  className="flex items-center justify-center p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors group"
                  onClick={() => window.open(article.sourceUrl, '_blank')}
                >
                  <div className="flex items-center justify-center space-x-8 w-full max-w-4xl">
                    <div className="text-sm text-muted-foreground whitespace-nowrap w-24 text-center">
                      {formatDate(article.publishDate)}
                    </div>
                    <div className="flex-1 text-center px-4">
                      <h3 className="font-medium text-foreground group-hover:text-primary">
                        {article.title}
                      </h3>
                    </div>
                    <div className="text-sm text-muted-foreground whitespace-nowrap w-32 text-center flex items-center justify-center space-x-2">
                      <span>{article.source}</span>
                      <ExternalLink className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * newsPerPage + 1} to {Math.min(currentPage * newsPerPage, news.total)} of {news.total} articles
                </p>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-9"
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
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
            <p className="text-muted-foreground text-lg">
              No news articles found.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
