import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

export function ToolCard({ tool }: { tool: any }) {
  const domain = tool.website ? new URL(tool.website).hostname : "";
  const logoUrl = domain ? `https://unavatar.io/${domain}` : "";

  return (
    <Link href={`/tools/${tool.slug}`} className="block">
      <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/30 transition">
        <img
          src={logoUrl}
          alt={tool.name}
          className="w-10 h-10 rounded object-cover bg-white"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
        <div>
          <h3 className="font-semibold text-base">{tool.name}</h3>
          <p className="text-muted-foreground text-sm line-clamp-1">
            {tool.shortDescription || "No description available"}
          </p>
          <Badge className="mt-1" variant="secondary">
            {tool.category}
          </Badge>
        </div>
      </div>
    </Link>
  );
}
