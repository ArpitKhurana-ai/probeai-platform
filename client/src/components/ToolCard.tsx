import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

export function ToolCard({ tool }: { tool: any }) {
  const domain = tool.website ? new URL(tool.website).hostname : "";
  const logoUrl = domain
    ? `https://unavatar.io/${domain}`
    : "/placeholder.svg";

  return (
    <Link to={`/tools/${tool.slug}`} className="block">
      <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/30 transition">
        <img
          src={logoUrl}
          alt={tool.name}
          className="w-10 h-10 rounded object-cover"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base truncate">{tool.name}</h3>
          <p className="text-muted-foreground text-sm line-clamp-1">
            {tool.shortDescription || tool.description}
          </p>
          <Badge
            className="mt-1 text-xs px-2 py-0.5 rounded-md"
            variant="secondary"
          >
            {tool.category}
          </Badge>
        </div>
      </div>
    </Link>
  );
}
