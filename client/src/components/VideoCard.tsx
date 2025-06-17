import { Card, CardContent } from "@/components/ui/card";
import { Play } from "lucide-react";
import type { Video } from "@shared/types";

interface VideoCardProps {
  video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
  const handleClick = () => {
    window.open(video.videoUrl, '_blank', 'noopener,noreferrer');
  };

  // Extract YouTube video ID for thumbnail
  const getYouTubeThumbnail = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    return videoId ? `https://img.youtube.com/vi/${videoId[1]}/maxresdefault.jpg` : null;
  };

  const thumbnailUrl = video.thumbnailUrl || getYouTubeThumbnail(video.videoUrl);

  return (
    <Card 
      className="overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer group"
      onClick={handleClick}
    >
      <div className="relative">
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl}
            alt={video.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=225';
            }}
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-blue-600/20 flex items-center justify-center">
            <Play className="h-12 w-12 text-primary" />
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="text-white text-xl ml-1" />
          </div>
        </div>
        {video.duration && (
          <div className="absolute bottom-3 right-3 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
            {video.duration}
          </div>
        )}
      </div>
      
      <CardContent className="p-6">
        <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {video.title}
        </h3>
        
        {video.description && (
          <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
            {video.description}
          </p>
        )}
        
        <div className="flex items-center text-sm text-muted-foreground">
          {video.channel && <span>{video.channel}</span>}
          {video.views && (
            <>
              <span className="mx-2">•</span>
              <span>{video.views}</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
