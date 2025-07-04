import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Eye, Heart } from "lucide-react";
import { Tool } from "@shared/types";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  tool: Tool;
  showDescription?: boolean;
}

export function ToolCard({ tool, showDescription = true }: ToolCardProps) {
  const toolSlug = tool.slug || tool.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <Link href={`/tools/${toolSlug}`}>
      <Card className="cursor-pointer hover:shadow-md transition-all h-full group">
        <CardContent className="p-5 flex flex-col justify-between h-full">
          {/* Top Section: Logo + badges */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {tool.logoUrl ? (
                <img
                  src={tool.logoUrl}
                  alt={tool.name}
                  className="w-10 h-10 rounded-md object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
              ) : (
                <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center text-sm font-bold text-gray-500">
                  {tool.name.charAt(0)}
                </div>
              )}

              <div className="flex gap-2 mt-0.5">
                {tool.isFeatured && (
                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">✨ Featured</Badge>
                )}
                {tool.isHot && (
                  <Badge className="bg-red-100 text-red-700 text-xs">🔥 Hot</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Tool Name + Description */}
          <div className="mb-3">
            <h3 className="font-semibold text-[16px] text-gray-900 group-hover:text-primary transition line-clamp-1">
              {tool.name}
            </h3>
            {showDescription && tool.shortDescription && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{tool.shortDescription}</p>
            )}
          </div>

          {/* Category + Tags */}
          <div className="text-sm text-gray-700 font-medium mb-2">
            {tool.category}
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {Array.isArray(tool.accessType)
              ? tool.accessType.map((type, i) => (
                  <Badge key={i} variant="outline" className="text-xs">{type}</Badge>
                ))
              : tool.accessType && (
                  <Badge variant="outline" className="text-xs">{tool.accessType}</Badge>
                )}
            {Array.isArray(tool.audience)
              ? tool.audience.map((aud, i) => (
                  <Badge key={i} variant="outline" className="text-xs">{aud}</Badge>
                ))
              : tool.audience && (
                  <Badge variant="outline" className="text-xs">{tool.audience}</Badge>
                )}
          </div>

          {/* Bottom: Views + Likes */}
          <div className="flex justify-end gap-4 mt-auto pt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4 text-yellow-600" />
              <span>{tool.views || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              <span>{tool.likes || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
