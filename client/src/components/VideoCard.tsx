import { PlayCircle } from "lucide-react";

export function VideoCard({ video, size = "small" }: { video: any; size?: "small" | "large" }) {
  const isLarge = size === "large";
  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block overflow-hidden rounded-xl border border-border hover:shadow-lg transition-all duration-200 bg-background group ${
        isLarge ? "md:h-[300px] xl:h-[360px]" : "h-[180px]"
      }`}
    >
      <div className="relative h-full w-full">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all duration-200" />
        <PlayCircle className="absolute top-1/2 left-1/2 text-white w-12 h-12 transform -translate-x-1/2 -translate-y-1/2 opacity-80 group-hover:opacity-100" />
      </div>
      <div className="p-4 bg-background">
        <p className="font-medium text-foreground line-clamp-2">{video.title}</p>
      </div>
    </a>
  );
}
