import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { format } from "date-fns";
import type { Blog } from "./shared/schema";

interface BlogCardProps {
  blog: Blog;
}

export function BlogCard({ blog }: BlogCardProps) {
  const defaultImage = 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250';
  
  return (
    <Link href={`/blog/${blog.slug}`}>
      <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer group h-[420px] flex flex-col">
        <div className="overflow-hidden flex-shrink-0">
          <img 
            src={blog.imageUrl || defaultImage}
            alt={blog.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = defaultImage;
            }}
          />
        </div>
        
        <CardContent className="p-6 flex-1 flex flex-col">
          <div className="flex items-center text-sm text-muted-foreground mb-2 flex-shrink-0">
            <span>{blog.author}</span>
            <span className="mx-2">•</span>
            <span>{format(new Date(blog.publishDate || blog.createdAt || new Date()), 'MMM dd, yyyy')}</span>
            {blog.readTime && (
              <>
                <span className="mx-2">•</span>
                <span>{blog.readTime} min read</span>
              </>
            )}
          </div>
          
          <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2 flex-shrink-0">
            {blog.title}
          </h3>
          
          <div className="flex-1 flex flex-col justify-between">
            {blog.excerpt && (
              <p className="text-muted-foreground mb-4 line-clamp-2">
                {blog.excerpt}
              </p>
            )}
            
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-auto">
                {blog.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
