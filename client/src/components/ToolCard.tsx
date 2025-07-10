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

    </Link>
  );
}
