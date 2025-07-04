// client/src/components/ToolCard.tsx

import { ExternalLink } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

type ToolCardProps = {
  tool: {
    id: string;
    slug: string;
    name: string;
    logoUrl: string;
    shortDescription: string;
    category?: string;
    accessType?: string;
    audience?: string;
    isFeatured?: boolean;
    isHot?: boolean;
    views?: number;
    likes?: number;
  };
  showDescription?: boolean;
};

export const ToolCard = ({ tool, showDescription = true }: ToolCardProps) => {
  const [, navigate] = useLocation();

  const handleClick = () => {
    navigate(`/tools/${tool.slug}`);
  };

  const accessList = tool.accessType ? tool.accessType.split(",").slice(0, 2) : [];
  const audienceList = tool.audience ? tool.audience.split(",").slice(0, 2) : [];

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer border rounded-lg p-4 hover:shadow-md transition bg-white dark:bg-zinc-900"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {tool.logoUrl && (
            <img
              src={tool.logoUrl}
              alt={`${tool.name} logo`}
              className="w-10 h-10 object-cover rounded"
            />
          )}
          <div className="text-sm font-medium text-muted-foreground">
            {tool.category}
          </div>
        </div>
        <div className="flex gap-1">
          {tool.isFeatured && (
            <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-[2px] rounded-full">
              Featured
            </span>
          )}
          {tool.isHot && (
            <span className="bg-red-100 text-red-700 text-[10px] px-2 py-[2px] rounded-full">
              🔥 Hot
            </span>
          )}
        </div>
      </div>

      <h3 className="text-lg font-semibold line-clamp-1">{tool.name}</h3>

      {showDescription && (
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {tool.shortDescription}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mt-3">
        {accessList.map((access, i) => (
          <span
            key={`access-${i}`}
            className="bg-gray-100 dark:bg-zinc-700 text-xs px-2 py-[2px] rounded"
          >
            {access.trim()}
          </span>
        ))}
        {audienceList.map((aud, i) => (
          <span
            key={`aud-${i}`}
            className="bg-gray-100 dark:bg-zinc-700 text-xs px-2 py-[2px] rounded"
          >
            {aud.trim()}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
        <div className="flex gap-4">
          <span>❤️ {tool.likes ?? "1.2K"}</span>
          <span>👁️ {tool.views ?? "9.1K"}</span>
        </div>
        <ExternalLink className="w-4 h-4 opacity-50" />
      </div>
    </div>
  );
};
