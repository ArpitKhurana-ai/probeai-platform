import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Heart, ExternalLink, Flame, Sparkles } from "lucide-react";
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

  const getBadge = (type: string) => {
    const base =
      "text-xs px-2 py-0.5 rounded-full flex items-center gap-1 font-medium";
    switch (type.toLowerCase()) {
      case "featured":
        return (
          <div className={`${base} bg-yellow-100 text-yellow-800`}>
            <Sparkles className="w-3 h-3" /> Featured
          </div>
        );
      case "hot":
        return (
          <div className={`${base} bg-red-100 text-red-800`}>
            <Flame className="w-3 h-3" /> Hot
          </div>
        );
      default:
        return null;
    }
  };

  const toolSlug = tool.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <Link href={`/tools/${toolSlug}`}>
      <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer group">
        <CardContent className="p-6 flex flex-col justify-between h-full">
          <div className="flex justify-between items-start mb-4">
            {tool.logoUrl ? (
              <img
                src={tool.logoUrl}
                alt={tool.name}
                className="w-12 h-12 rounded-lg object-cover"
                onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-lg">
                {tool.name.charAt(0)}
              </div>
            )}

            <div className="flex gap-2">
              {tool.isFeatured && getBadge("featured")}
              {tool.isHot && getBadge("hot")}
            </div>
          </div>

          <div className="flex-grow">
            <h3 className="text-base font-semibold text-primary group-hover:text-blue-600 mb-1">
              {tool.name}
            </h3>
            {tool.shortDescription && (
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2 min-h-[2.5rem]">
                {tool.shortDescription}
              </p>
            )}
            {tool.category && (
              <p className="text-xs font-medium text-foreground mb-2">
                {tool.category}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mb-2">
              {tool.accessType?.split(",").map((type) => (
                <Badge key={type} variant="outline">
                  {type.trim()}
                </Badge>
              ))}
              {tool.audience?.split(",").map((aud) => (
                <Badge key={aud} variant="outline">
                  {aud.trim()}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground mt-4">
            <div className="flex items-center gap-1">
              <ExternalLink className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-yellow-600" />
                {tool.views || 0}
              </div>
              <div
                className="flex items-center gap-1 cursor-pointer"
                onClick={handleLike}
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${
                    isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500"
                  }`}
                />
                {tool.likes || 0}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
