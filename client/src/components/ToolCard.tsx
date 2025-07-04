import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
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
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not like tool.",
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
        description: "Sign in to like tools.",
        variant: "destructive",
      });
      return;
    }
    likeMutation.mutate();
  };

  const toolSlug = tool.slug || tool.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <Link href={`/tools/${toolSlug}`}>
      <Card className="h-full cursor-pointer hover:shadow-md transition group">
        <CardContent className="p-5 space-y-3 flex flex-col h-full">
          {/* Header: Logo + Arrow */}
          <div className="flex items-start justify-between">
            {tool.logoUrl ? (
              <img src={tool.logoUrl} alt={tool.name} className="w-10 h-10 rounded object-cover" />
            ) : (
              <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-sm">
                {tool.name[0]}
              </div>
            )}
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
          </div>

          {/* Title & Description */}
          <div>
            <h3 className="text-lg font-semibold group-hover:text-primary">{tool.name}</h3>
            {showDescription && (
              <p className="text-sm text-muted-foreground line-clamp-2 min-h-[3.5rem]">
                {tool.shortDescription}
              </p>
            )}
          </div>

          {/* Category & Badges */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{tool.category}</span>
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
              ? tool.accessType.map((t, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {t}
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

          {/* Views & Likes */}
          <div className="flex items-center text-xs text-muted-foreground pt-1 mt-auto">
            <span>👁️ {tool.views ?? 0}</span>
            <span className="ml-4">❤️ {tool.likes ?? 0}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
