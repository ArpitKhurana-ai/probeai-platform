import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import { format } from "date-fns";
import type { News } from "./shared/schema";

interface NewsCardProps {
  article: News;
}

export function NewsCard({ article }: NewsCardProps) {
  const handleClick = () => {
    window.open(article.sourceUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card 
      className="h-full transition-all duration-200 hover:shadow-lg cursor-pointer group"
      onClick={handleClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <span>{format(new Date(article.publishDate), 'MMM dd, yyyy')}</span>
          <span className="mx-2">|</span>
          <span>{article.source}</span>
          <ExternalLink className="ml-2 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        
        <h3 className="font-semibold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
          {article.title}
        </h3>
        
        {article.excerpt && (
          <p className="text-muted-foreground text-sm line-clamp-3">
            {article.excerpt}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
