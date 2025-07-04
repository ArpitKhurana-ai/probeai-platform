import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
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
        title: "Login Required",
        description: "Please sign in to like tools",
        variant: "destructive",
      });
      return;
    }

    likeMutation.mutate();
  };

  const toolSlug = tool.slug || tool.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <Link href={`/tools/${toolSlug}`}>
      <Card className="h-full transition-all duration-200 hover:shadow-md hover:scale-[1.01] cursor-pointer group">
        <CardContent className="p-5 flex flex-col justify-between h-full">
          {/* TOP BADGES + ARROW */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex flex-wrap gap-1">
              {tool.isFeatured && (
                <Badge className="bg-yellow-100 text-yellow-800 text-xs">⭐ Featured</Badge>
              )}
              {tool.isHot && (
                <Badge className="bg-red-100 text-red-800 text-xs">🔥 Hot</Badge>
              )}
            </div>
            <div className="text-muted-foreground text-xl group-hover:text-primary transition-colors">
              →
            </div>
          </div>

          {/* CATEGORY */}
          {tool.category && (
            <div className="text-xs text-muted-foreground font-medium mb-1">
              {tool.category}
            </div>
          )}

          {/* NAME + DESCRIPTION */}
          <div className="mb-3">
            <h3 className="text-md font-semibold text-primary group-hover:underline line-clamp-1">
              {tool.name}
            </h3>
            {showDescription && tool.shortDescription && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {tool.shortDescription}
              </p>
            )}
          </div>

          {/* TAGS */}
          <div className="flex flex-wrap gap-1 text-xs mb-3">
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

          {/* VIEWS + LIKES */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto">
            <div className="flex items-center gap-1">
              <span>👁️</span>
              <span>{tool.views?.toLocaleString() || "0"}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>❤️</span>
              <span>{tool.likes?.toLocaleString() || "0"}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
