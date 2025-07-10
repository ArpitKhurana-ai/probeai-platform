import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export default function ToolCard({ tool }: { tool: any }) {
  const domain = tool.website ? new URL(tool.website).hostname : "";
  const logoSrc = domain
    ? `https://unavatar.io/${domain}`
    : "/favicon.ico"; // fallback to local

  return (
    <Link to={`/tools/${tool.slug}`} className="block">
      <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/30 transition">
        <img
          src={logoSrc}
          alt={tool.name}
          className="w-10 h-10 rounded object-contain bg-white"
        />
        <div>
          <h3 className="font-semibold text-base">{tool.name}</h3>
          {tool.shortDescription && (
            <p className="text-muted-foreground text-sm line-clamp-1">
              {tool.shortDescription}
            </p>
          )}
          <Badge className="mt-1 text-xs px-2 py-0.5 rounded-md bg-orange-500 text-white border-none">
            {tool.category}
          </Badge>
        </div>
      </div>
    </Link>
  );
}
