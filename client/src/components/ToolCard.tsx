import { useLocation } from "wouter";
import { ArrowRight, Flame, Heart, Star, Users, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  tool: {
    id?: string;
    name: string;
    slug: string;
    logoUrl?: string;
    shortDescription?: string;
    accessType?: string[] | string;
    audience?: string[] | string;
    category?: string;
    isFeatured?: boolean;
    isHot?: boolean;
    views?: number;
    likes?: number;
  };
  showDescription?: boolean;
}

export function ToolCard({ tool, showDescription = true }: ToolCardProps) {
  const [, navigate] = useLocation();

  const handleClick = () => {
    navigate(`/tools/${tool.slug}`);
  };

  const accessItems = Array.isArray(tool.accessType)
    ? tool.accessType
    : typeof tool.accessType === "string"
    ? tool.accessType.split(",").map((s) => s.trim())
    : [];

  const audienceItems = Array.isArray(tool.audience)
    ? tool.audience
    : typeof tool.audience === "string"
    ? tool.audience.split(",").map((s) => s.trim())
    : [];

  return (
    <div
      className="relative bg-white rounded-lg border shadow-sm hover:shadow-md cursor-pointer transition p-4 flex flex-col gap-3"
      onClick={handleClick}
    >
      <div className="absolute top-2 left-2 flex gap-2">
        {tool.isFeatured && (
          <span className="text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Star className="w-3 h-3" /> Featured
          </span>
        )}
        {tool.isHot && (
          <span className="text-xs font-medium bg-red-100 text-red-600 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Flame className="w-3 h-3" /> Hot
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 mt-2">
        {tool.logoUrl && (
          <img
            src={tool.logoUrl}
            alt={tool.name}
            className="w-10 h-10 rounded object-cover"
          />
        )}
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{tool.name}</h3>
          {tool.category && (
            <span className="text-xs text-muted-foreground">{tool.category}</span>
          )}
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
      </div>

      {showDescription && tool.shortDescription && (
        <p className="text-sm text-muted-foreground line-clamp-3">
          {tool.shortDescription}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mt-1 text-xs">
        {accessItems.map((item, i) => (
          <span
            key={`access-${i}`}
            className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full"
          >
            {item}
          </span>
        ))}
        {audienceItems.map((item, i) => (
          <span
            key={`audience-${i}`}
            className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full"
          >
            {item}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
        <span className="flex items-center gap-1">
          <Eye className="w-3 h-3" /> {tool.views ?? 0}
        </span>
        <span className="flex items-center gap-1">
          <Heart className="w-3 h-3" /> {tool.likes ?? 0}
        </span>
      </div>
    </div>
  );
}
