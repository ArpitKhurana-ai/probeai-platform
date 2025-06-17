import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { Tool } from "@shared/types";

interface ToolCardProps {
  tool: Tool & { isLiked?: boolean };
  showDescription?: boolean;
}

export function ToolCard({ tool, showDescription = true }: ToolCardProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(tool.isLiked || false);

  const likeMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/tools/${tool.id}/like`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      setIsLiked(!isLiked);
      queryClient.invalidateQueries({ queryKey: ["/api/tools"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/likes"] });
    },
    onError: (error) => {
      console.error("Error toggling like:", error);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    },
  });

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to like tools",
        variant: "destructive",
      });
      return;
    }

    likeMutation.mutate();
  };

  const getPricingBadgeVariant = (pricing: string) => {
    switch (pricing?.toLowerCase()) {
      case "free": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "freemium": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "paid": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "open source": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getSpecialBadgeVariant = (type: string) => {
    switch (type?.toLowerCase()) {
      case "featured": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "hot": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const toolSlug = tool.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  return (
    <Link href={`/tools/${toolSlug}`}>
      <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer group">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              {tool.logoUrl ? (
                <img 
                  src={tool.logoUrl} 
                  alt={`${tool.name} logo`}
                  className="w-12 h-12 rounded-lg object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {tool.name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {tool.name}
                </h3>
                <div className="flex gap-1 mt-1">
                  {tool.isFeatured && (
                    <Badge variant="secondary" className={getSpecialBadgeVariant("featured")}>
                      Featured
                    </Badge>
                  )}
                  {tool.isHot && (
                    <Badge variant="secondary" className={getSpecialBadgeVariant("hot")}>
                      Hot
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLike}
              disabled={likeMutation.isPending}
              className="shrink-0"
            >
              <Heart 
                className={`h-4 w-4 transition-colors ${
                  isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500"
                }`} 
              />
            </Button>
          </div>

          {showDescription && tool.shortDescription && (
            <p className="text-muted-foreground mb-4 text-sm line-clamp-2">
              {tool.shortDescription}
            </p>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            {tool.pricingType && (
              <Badge variant="secondary" className={getPricingBadgeVariant(tool.pricingType)}>
                {tool.pricingType}
              </Badge>
            )}
            {tool.accessType && (
              <Badge variant="outline">{tool.accessType}</Badge>
            )}
            {tool.aiTech && (
              <Badge variant="outline">{tool.aiTech}</Badge>
            )}
            {tool.audience && (
              <Badge variant="outline">{tool.audience}</Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-primary hover:text-primary/80 transition-colors">
              <span className="text-sm font-medium">View Details</span>
              <ExternalLink className="ml-1 h-3 w-3" />
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Heart className="h-4 w-4" />
              <span>{tool.likes || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
