// Trigger redeploy: 2025-07-10
import { useEffect } from "react";
import { Layout } from "@/components/Layout";
import { SearchBar } from "@/components/SearchBar";
import { ToolCard } from "@/components/ToolCard";
import { VideoCard } from "@/components/VideoCard";
import { CategoryCard } from "@/components/CategoryCard";
import { useQuery } from "@tanstack/react-query";
import {
  Bot, Image, Code, TrendingUp, PenTool, Music, BarChart3, ShoppingCart, Headphones,
  Video, Users, Search, Palette, BookOpen, DollarSign, Zap, Share2, Phone, Gauge, Camera
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";

// 🧠 Define categories
const categories = [
  { name: "Marketing", icon: TrendingUp, href: "/category/marketing" },
  { name: "Sales", icon: DollarSign, href: "/category/sales" },
  { name: "Analytics", icon: BarChart3, href: "/category/analytics" },
  { name: "Customer Service", icon: Phone, href: "/category/customer-service" },
  { name: "Productivity", icon: Gauge, href: "/category/productivity" },
  { name: "Social Media", icon: Share2, href: "/category/social-media" },
  { name: "Video", icon: Video, href: "/category/video" },
  { name: "Image", icon: Image, href: "/category/image" },
  { name: "Writing", icon: PenTool, href: "/category/writing" },
  { name: "Audio", icon: Music, href: "/category/audio" },
  { name: "Coding", icon: Code, href: "/category/coding" },
  { name: "UI/UX", icon: Palette, href: "/category/ui-ux" },
  { name: "Studying", icon: BookOpen, href: "/category/studying" },
  { name: "Research", icon: Search, href: "/category/research" },
  { name: "E-commerce", icon: ShoppingCart, href: "/category/e-commerce" },
  { name: "NSFW", icon: Users, href: "/category/nsfw" },
  { name: "Developer Tools", icon: Code, href: "/category/developer-tools" },
  { name: "AI Avatars", icon: Users, href: "/category/ai-avatars" },
  { name: "Investing", icon: TrendingUp, href: "/category/investing" },
  { name: "Chatbots", icon: Bot, href: "/category/chatbots" },
  { name: "Automation", icon: Zap, href: "/category/automation" },
  { name: "Search", icon: Search, href: "/category/search" },
  { name: "Profile Pic Gen", icon: Camera, href: "/category/profile-pic-gen" },
];

// 🧠 Date formatter
const formatDate = (dateStr: string) => {
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric"
    });
  }
  return null;
};

export default function Home() {
  const { data: featuredTools } = useQuery({ queryKey: ["/api/tools?featured=true&limit=4"] });
  const { data: trendingTools } = useQuery({ queryKey: ["/api/tools?trending=true&limit=4"] });
  const { data: latestNews } = useQuery({ queryKey: ["/api/news?limit=4"] });
  const { data: featuredVideos } = useQuery({ queryKey: ["/api/videos?limit=5"] });
  const { data: featuredBlogs } = useQuery({ queryKey: ["/api/blogs?limit=4"] });

  useEffect(() => {
    trackEvent("page_view", "home");
  }, []);

  const handleSearch = (query: string) => {
    trackEvent("search", "home", query);
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
    }
  };

  return (
    <Layout>
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground">
            Discover the Best <span className="text-primary">AI Tools</span>
          </h1>
          <p className="text-xl text-muted-foreground mt-4 mb-8 max-w-3xl mx-auto">
            Find, compare, and discover the perfect AI tools for your projects.
          </p>
          <SearchBar onSearch={handleSearch} />
          <div className="flex flex-wrap justify-center gap-1.5 mt-10 max-w-6xl mx-auto">
            {categories.map((category) => (
              <CategoryCard key={category.name} {...category} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured + Trending Tools */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 border rounded-xl p-6 bg-muted/30">
              <h2 className="text-xl font-bold mb-4">⭐ Featured AI Tools</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featuredTools?.items?.slice(0, 8).map((tool: any) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </div>
            <div className="lg:col-span-2 border rounded-xl p-6 bg-muted/30">
              <h2 className="text-xl font-bold mb-4">🔥 Trending This Week</h2>
              <div className="grid grid-cols-1 gap-4">
                {trendingTools?.items?.slice(0, 4).map((tool: any) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Videos */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-center">🎥 Featured Videos</h2>
          <div className="mb-6">
            {featuredVideos?.items?.[0] && (
              <VideoCard video={featuredVideos.items[0]} size="large" />
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredVideos?.items?.slice(1, 4).map((video: any) => (
              <VideoCard key={video.id} video={video} size="small" />
            ))}
          </div>
        </div>
      </section>

      {/* News + Blogs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* News */}
           {/* 🗞️ Boxed News Section */}
<div className="bg-muted/10 rounded-xl p-6 shadow-sm border">
  <h2 className="text-xl md:text-2xl font-semibold mb-4">🗞️ Latest AI News</h2>
  <ul className="space-y-3 pl-2">
    {latestNews?.items?.slice(0, 4).map((article: any) => {
      const dateToUse = article.publishedAt || article.createdAt;
      const dateStr = dateToUse ? new Date(dateToUse).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }) : null;

      return (
        <li key={article.id} className="text-sm flex items-center justify-between truncate">
          <span className="font-medium text-foreground truncate whitespace-nowrap overflow-hidden text-ellipsis">
            • {article.title}
          </span>
          {dateStr && (
            <span className="ml-2 text-xs text-muted-foreground whitespace-nowrap">
              {dateStr}
            </span>
          )}
        </li>
      );
    })}
  </ul>
  <div className="mt-4 text-right">
    <a href="/news" className="text-sm text-primary hover:underline">
      → See all News
    </a>
  </div>
</div>


            {/* Blogs */}
            <div className="bg-muted/10 rounded-xl p-6 shadow-sm border">
              <h2 className="text-xl md:text-2xl font-semibold mb-4">📚 Featured Blogs</h2>
              <ul className="space-y-3 pl-2">
                {featuredBlogs?.items?.slice(0, 4).map((blog: any) => (
                  <li key={blog.id} className="text-sm flex items-center justify-between truncate">
                    <span className="font-medium text-foreground truncate whitespace-nowrap overflow-hidden text-ellipsis">• {blog.title}</span>
                    {blog.readTime && (
                      <span className="ml-2 text-xs text-muted-foreground whitespace-nowrap">{blog.readTime} min read</span>
                    )}
                  </li>
                ))}
              </ul>
              <div className="mt-4 text-right">
                <a href="/blogs" className="text-sm text-primary hover:underline">
                  → Browse all Blogs
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>
    </Layout>
  );
}
