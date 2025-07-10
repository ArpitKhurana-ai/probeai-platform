// Trigger redeploy: 2025-07-10
import { useEffect } from "react";
import { Layout } from "@/components/Layout";
import { SearchBar } from "@/components/SearchBar";
import { ToolCard } from "@/components/ToolCard";
import { NewsCard } from "@/components/NewsCard";
import { VideoCard } from "@/components/VideoCard";
import { BlogCard } from "@/components/BlogCard";
import { CategoryCard } from "@/components/CategoryCard";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Bot, Image, Code, TrendingUp, PenTool, Music, ArrowRight, Sparkles, BarChart3,
  ShoppingCart, Headphones, Video, Users, Search, Palette, BookOpen, DollarSign,
  Zap, Share2, Phone, Gauge, Camera
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";

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

export default function Home() {
  const { data: featuredTools } = useQuery({ queryKey: ["/api/tools?featured=true&limit=4"] });
  const { data: trendingTools } = useQuery({ queryKey: ["/api/tools?hot=true&limit=4"] });
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

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <h2 className="text-2xl font-bold mb-4">✨ Featured Tools</h2>
              <div className="space-y-4">
                {featuredTools?.items?.map((tool: any) => <ToolCard key={tool.id} tool={tool} />)}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">🔥 Trending Tools</h2>
              <div className="space-y-4">
                {trendingTools?.items?.map((tool: any) => <ToolCard key={tool.id} tool={tool} showDescription={false} />)}
              </div>
            </div>
          </div>
        </div>
      </section>

   <section className="py-16 bg-muted/50">
  <div className="container mx-auto px-4">
    <h2 className="text-2xl font-bold mb-6 text-center">🎥 Featured Videos</h2>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Large featured video on left */}
      <div className="lg:col-span-1">
        {featuredVideos?.items?.[0] && (
          <VideoCard video={featuredVideos.items[0]} className="h-full" />
        )}
      </div>

      {/* Smaller 4 videos on right */}
      <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 gap-4">
        {featuredVideos?.items?.slice(1, 5).map((video: any) => (
          <VideoCard key={video.id} video={video} className="h-full" />
        ))}
      </div>
    </div>
  </div>
</section>


      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <h2 className="text-2xl font-bold mb-4">📰 Latest AI News</h2>
              <div className="space-y-4">
                {latestNews?.items?.map((article: any) => <NewsCard key={article.id} article={article} />)}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">📝 Featured Blogs</h2>
              <div className="space-y-4">
                {featuredBlogs?.items?.map((blog: any) => <BlogCard key={blog.id} blog={blog} />)}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
