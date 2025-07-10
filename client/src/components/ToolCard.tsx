import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export default function ToolCard({ tool }: { tool: any }) {
  return (
    <Link to={`/tools/${tool.slug}`} className="block">
      <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/30 transition">
        <img
          src={`https://unavatar.io/${new URL(tool.website).hostname}`}
          alt={tool.name}
          className="w-10 h-10 rounded"
        />
        <div>
          <h3 className="font-semibold text-base">{tool.name}</h3>
          <p className="text-muted-foreground text-sm line-clamp-1">
            {tool.shortDescription}
          </p>
          <Badge className="mt-1" variant="secondary">
            {tool.category}
          </Badge>
        </div>
      </div>
    </Link>
  );
}
