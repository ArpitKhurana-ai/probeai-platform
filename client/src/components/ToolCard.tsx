import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Eye } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { Tool } from "@shared/types";
import { ExternalLink } from "lucide-react";

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
    onError: () => {
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
        title: "Login required",
        description: "Please sign in to like tools.",
        variant: "destructive",
      });
      return;
    }

    likeMutation.mutate();
  };

  const getBadgeStyle = (type: string) => {
    switch (type.toLowerCase()) {
      case "featured":
        return "bg-yellow-100 text-yellow-800";
      case "hot":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const toolSlug = tool.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <Link href={`/tools/${toolSlug}`}>
      <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer group">
        <CardContent className="p-5 flex flex-col justify-between h-full">
          {/* Header with Logo + Badges */}
          <div className="flex items-start justify-between mb-4">
            {tool.logoUrl ? (
              <img
                src={tool.logoUrl}
                alt={`${tool.name} logo`}
                className="w-10 h-10 rounded-md object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            ) : (
              <div className="w-10 h-10 rounded-md bg-primary text-white flex items-center justify-center font-semibold">
                {tool.name.charAt(0)}
              </div>
            )}
            <div className="flex gap-1">
              {tool.isFeatured && (
                <Badge className={`${getBadgeStyle("featured")} text-xs`}>
                  ✨ Featured
                </Badge>
              )}
              {tool.isHot && (
                <Badge className={`${getBadgeStyle("hot")} text-xs`}>
                  🔥 Hot
                </Badge>
              )}
            </div>
          </div>

          {/* Title + Description */}
          <div className="mb-2">
            <h3 className="text-base font-semibold text-primary mb-1">
              {tool.name}
            </h3>
            <p className="text-sm text-muted-foreground min-h-[40px] line-clamp-2">
              {tool.shortDescription || ""}
            </p>
          </div>

          {/* Category */}
          {tool.category && (
            <p className="text-sm text-black dark:text-white font-medium mb-2">
              {tool.category}
            </p>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-2">
            {tool.tags &&
              typeof tool.tags === "string" &&
              tool.tags.split(",").map((tag, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {tag.trim()}
                </Badge>
              ))}
          </div>

          {/* Footer: Bottom bar */}
          <div className="flex items-center justify-between pt-3 border-t mt-auto">
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
            <div className="flex items-center gap-4 text-muted-foreground text-sm">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-yellow-600" />
                <span>{tool.views || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart
                  className={`w-4 h-4 ${
                    isLiked ? "text-red-500 fill-red-500" : "text-muted-foreground"
                  }`}
                />
                <span>{tool.likes || 0}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
