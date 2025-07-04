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
      return await apiRequest(`/api/tools/${tool.id}/like`, { method: "POST" });
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
        description: "Please sign in to like tools",
        variant: "destructive",
      });
      return;
    }
    likeMutation.mutate();
  };

  const getSpecialBadgeVariant = (type: string) => {
    switch (type?.toLowerCase()) {
      case "featured":
        return "bg-yellow-100 text-yellow-800";
      case "hot":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const toolSlug = tool.slug || tool.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <Link href={`/tools/${toolSlug}`}>
      <Card className="transition-all duration-200 hover:shadow-md hover:scale-[1.01] cursor-pointer group h-full">
        <CardContent className="p-5 space-y-4">
          {/* Header row with logo and badges */}
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              {tool.logoUrl ? (
                <img
                  src={tool.logoUrl}
                  alt={tool.name}
                  className="w-10 h-10 rounded object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded bg-gray-300 flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br from-primary to-blue-600">
                  {tool.name.charAt(0)}
                </div>
              )}
              <div className="flex gap-1 flex-wrap">
                {tool.isFeatured && (
                  <Badge className={getSpecialBadgeVariant("featured")}>Featured</Badge>
                )}
                {tool.isHot && (
                  <Badge className={getSpecialBadgeVariant("hot")}>Hot</Badge>
                )}
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
          </div>

          {/* Category */}
          {tool.category && (
            <div className="text-xs text-muted-foreground font-medium">{tool.category}</div>
          )}

          {/* Name and Description */}
          <div>
            <h3 className="font-semibold text-base group-hover:text-primary">
              {tool.name}
            </h3>
            {showDescription && tool.shortDescription && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {tool.shortDescription}
              </p>
            )}
          </div>

          {/* Pills */}
          <div className="flex flex-wrap gap-2">
            {Array.isArray(tool.accessType)
              ? tool.accessType.map((a, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {a}
                  </Badge>
                ))
              : tool.accessType && (
                  <Badge variant="outline" className="text-xs">
                    {tool.accessType}
                  </Badge>
                )}
            {Array.isArray(tool.audience)
              ? tool.audience.map((a, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {a}
                  </Badge>
                ))
              : tool.audience && (
                  <Badge variant="outline" className="text-xs">
                    {tool.audience}
                  </Badge>
                )}
          </div>

          {/* Footer row: likes & views */}
          <div className="flex justify-between items-center text-xs text-muted-foreground pt-1">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{tool.views?.toLocaleString() || "0"}</span>
            </div>
            <div
              className={`flex items-center gap-1 ${
                isLiked ? "text-red-500" : ""
              }`}
              onClick={handleLike}
            >
              <Heart
                className={`h-4 w-4 cursor-pointer ${
                  isLiked ? "fill-red-500 text-red-500" : "hover:text-red-500"
                }`}
              />
              <span>{tool.likes?.toLocaleString() || "0"}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
