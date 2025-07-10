import { PlayCircle } from "lucide-react";

interface VideoCardProps {
  video: {
    id: string;
    title: string;
    thumbnailUrl: string;
  };
  size?: "large" | "small";
}

export function VideoCard({ video, size = "small" }: VideoCardProps) {
  const isLarge = size === "large";

  return (
    <div
      className={`relative rounded-xl overflow-hidden group shadow-md border border-muted transition-all ${
        isLarge ? "h-80" : "h-48"
      }`}
    >
      <img
        src={video.thumbnailUrl}
        alt={video.title}
        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
      />

      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
        <PlayCircle className="text-white w-12 h-12 opacity-80 group-hover:opacity-100" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-3">
        <p className="text-sm font-medium leading-snug line-clamp-2">
          {video.title}
        </p>
      </div>
    </div>
  );
}
