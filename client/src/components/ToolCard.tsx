import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

export function ToolCard({ tool }: { tool: any }) {
  return (
    <Link href={`/tool/${tool.slug}`} className="block group">
      <div className="flex items-start gap-4 p-4 bg-muted rounded-xl border hover:shadow transition">
        {/* Logo */}
        <div className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-white border">
          <img
            src={tool.logo}
            alt={tool.name}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary truncate">
            {tool.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {tool.description}
          </p>
          {tool.category && (
            <Badge variant="outline" className="mt-2 text-xs">
              {tool.category}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
}
