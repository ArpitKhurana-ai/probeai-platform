// client/src/components/ToolCard.tsx
import { Link } from "wouter";

export function ToolCard({ tool }: { tool: any }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="flex items-start gap-4 p-4 border rounded-lg hover:shadow bg-muted/10 transition-all"
    >
      <div className="w-12 h-12 min-w-[3rem] min-h-[3rem] overflow-hidden rounded-lg bg-white border">
        <img
          src={tool.logo}
          alt={tool.name}
          className="object-contain w-full h-full"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.png";
          }}
        />
      </div>
      <div className="flex flex-col">
        <h3 className="text-sm font-semibold text-foreground">{tool.name}</h3>
        <p className="text-muted-foreground text-xs line-clamp-2 mb-1">{tool.tagline}</p>
        <span className="inline-block bg-muted text-xs font-medium px-2 py-0.5 rounded">
          {tool.category || "Uncategorized"}
        </span>
      </div>
    </Link>
  );
}
