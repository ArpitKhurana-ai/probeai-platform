import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Eye, Heart } from "lucide-react";
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
  });

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
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
      <Card className="h-full min-h-[280px] transition-all duration-200 hover:shadow-md cursor-pointer group relative">
        <CardContent className="p-5 flex flex-col justify-between h-full">
          {/* Top Row: Logo + Badges */}
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10">
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
                <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center font-bold text-white bg-gradient-to-br from-primary to-blue-500">
                  {tool.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {tool.isFeatured && (
                <Badge className="bg-yellow-100 text-yellow-800 text-xs">✨ Featured</Badge>
              )}
              {tool.isHot && (
                <Badge className="bg-red-100 text-red-800 text-xs">🔥 Hot</Badge>
              )}
            </div>
          </div>

          {/* Name + Description */}
          <div className="flex flex-col gap-1 mb-2 flex-grow">
            <h3 className="text-md font-semibold text-primary">{tool.name}</h3>
            {showDescription && (
              <p className="text-muted-foreground text-sm leading-snug line-clamp-2">
                {tool.shortDescription}
              </p>
            )}
          </div>

          {/* Category */}
          {tool.category && (
            <div className="text-sm font-medium text-gray-700 mt-2 mb-1">
              {tool.category}
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {tool.accessType && (
              <Badge variant="outline" className="text-xs">{tool.accessType}</Badge>
            )}
            {tool.audience && (
              <Badge variant="outline" className="text-xs">{tool.audience}</Badge>
            )}
          </div>

          {/* Footer: Views + Likes */}
          <div className="flex gap-4 text-muted-foreground text-xs items-center">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4 text-yellow-500" />
              <span>{tool.views || 0}</span>
            </div>
            <div className="flex items-center gap-1" onClick={handleLike}>
              <Heart
                className={`w-4 h-4 cursor-pointer ${
                  isLiked ? "text-red-500 fill-red-500" : "hover:text-red-500"
                }`}
              />
              <span>{tool.likes || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
