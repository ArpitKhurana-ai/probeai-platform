import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Eye, ArrowRight } from "lucide-react";
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

  const toolSlug = tool.slug || tool.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <Link href={`/tools/${toolSlug}`}>
      <Card className="h-full cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.01] group">
        <CardContent className="p-4 space-y-3">
          {/* Top row with logo and arrow */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              {tool.logoUrl ? (
                <img
                  src={tool.logoUrl}
                  alt={`${tool.name} logo`}
                  className="w-10 h-10 rounded-lg object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-sm font-medium">
                  {tool.name?.[0] || "T"}
                </div>
              )}
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
          </div>

          {/* Tool name and description */}
          <div>
            <h3 className="font-semibold text-lg group-hover:text-primary">{tool.name}</h3>
            {showDescription && (
              <p className="text-sm text-muted-foreground line-clamp-2">{tool.shortDescription}</p>
            )}
          </div>

          {/* Category + Badges */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{tool.category}</span>
            <div className="flex gap-1">
              {tool.isFeatured && (
                <Badge className="bg-yellow-100 text-yellow-800 text-[10px]">✨ Featured</Badge>
              )}
              {tool.isHot && (
                <Badge className="bg-red-100 text-red-800 text-[10px]">🔥 Hot</Badge>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {Array.isArray(tool.accessType)
              ? tool.accessType.map((type, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {type}
                  </Badge>
                ))
              : tool.accessType && (
                  <Badge variant="outline" className="text-xs">
                    {tool.accessType}
                  </Badge>
                )}
            {Array.isArray(tool.audience)
              ? tool.audience.map((aud, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {aud}
                  </Badge>
                ))
              : tool.audience && (
                  <Badge variant="outline" className="text-xs">
                    {tool.audience}
                  </Badge>
                )}
          </div>

          {/* Views & Likes */}
          <div className="flex items-center gap-4 pt-1">
            <div className="flex items-center text-xs text-muted-foreground">
              <Eye className="w-4 h-4 mr-1" />
              {tool.views ?? 0}
            </div>
            <div
              className="flex items-center text-xs text-muted-foreground"
              onClick={handleLike}
            >
              <Heart
                className={`w-4 h-4 mr-1 cursor-pointer transition ${
                  isLiked ? "fill-red-500 text-red-500" : "hover:text-red-500"
                }`}
              />
              {tool.likes ?? 0}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
