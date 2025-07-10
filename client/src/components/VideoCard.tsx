// VideoCard.tsx
import { PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoCardProps {
  video: any;
  size?: "large" | "small";
}

export function VideoCard({ video, size = "small" }: VideoCardProps) {
  return (
    <a
      href={video.url || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group relative overflow-hidden rounded-xl border border-muted bg-background hover:shadow-lg transition-all",
        size === "large" ? "col-span-4 h-80" : "h-60"
      )}
    >
      <img
        src={video.thumbnailUrl}
        alt={video.title}
        className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70" />
      <PlayCircle className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white w-10 h-10 opacity-80 group-hover:scale-110 transition" />
      <div className="absolute bottom-0 p-4 text-white">
        <h3 className="font-semibold text-sm md:text-base line-clamp-2">
          {video.title}
        </h3>
      </div>
    </a>
  );
}
