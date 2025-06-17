import { useEffect } from "react";
import { Layout } from "@/components/Layout";
import { SearchBar } from "@/components/SearchBar";
import { ToolCard } from "@/components/ToolCard";
import { NewsCard } from "@/components/NewsCard";
import { VideoCard } from "@/components/VideoCard";
import { BlogCard } from "@/components/BlogCard";
import { CategoryCard } from "@/components/CategoryCard";
import { NewsletterCTA } from "@/components/NewsletterCTA";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Bot, 
  Image, 
  Code, 
  TrendingUp, 
  PenTool, 
  Music,
  ArrowRight,
  Sparkles,
  BarChart3,
  ShoppingCart,
  Headphones,
  Video,
  Users,
  Search,
  Palette,
  BookOpen,
  DollarSign,
  Zap,
  Share2,
  Phone,
  Gauge,
  Camera
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
  const { data: featuredTools, isLoading: featuredLoading, error: featuredError } = useQuery({
    queryKey: ["/api/tools?featured=true&limit=6"],
  });

  const { data: trendingTools, isLoading: trendingLoading, error: trendingError } = useQuery({
    queryKey: ["/api/tools?hot=true&limit=4"],
  });

  const { data: latestNews, isLoading: newsLoading, error: newsError } = useQuery({
    queryKey: ["/api/news?limit=3"],
  });

  const { data: featuredVideos, isLoading: videosLoading, error: videosError } = useQuery({
    queryKey: ["/api/videos?limit=3"],
  });

  const { data: featuredBlogs, isLoading: blogsLoading, error: blogsError } = useQuery({
    queryKey: ["/api/blogs?limit=3"],
  });

  // Debug logging for production
  useEffect(() => {
    console.log('Environment check:', {
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
      hasApiBaseUrl: !!import.meta.env.VITE_API_BASE_URL,
      mode: import.meta.env.MODE,
      featuredTools: (featuredTools as any)?.items?.length || 0,
      trendingTools: (trendingTools as any)?.items?.length || 0,
      latestNews: (latestNews as any)?.items?.length || 0,
      featuredVideos: (featuredVideos as any)?.items?.length || 0,
      featuredBlogs: (featuredBlogs as any)?.items?.length || 0,
      errors: {
        featuredError: featuredError?.message,
        trendingError: trendingError?.message,
        newsError: newsError?.message,
        videosError: videosError?.message,
        blogsError: blogsError?.message,
      }
    });
  }, [featuredTools, trendingTools, latestNews, featuredVideos, featuredBlogs, featuredError, trendingError, newsError, videosError, blogsError]);

  useEffect(() => {
    trackEvent('page_view', 'home');
  }, []);

  const handleSearch = (query: string) => {
    trackEvent('search', 'home', query);
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="h-8 w-8 text-primary mr-2" />
            <h1 className="text-4xl md:text-6xl font-bold text-foreground">
              Discover the Best <span className="text-primary">AI Tools</span>
            </h1>
          </div>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Find, compare, and discover the perfect AI tools for your projects. 
            From productivity to creativity, we've curated the best AI solutions for you.
          </p>

          {/* Search Bar */}
          <div className="mb-12">
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* Top Categories */}
          <div className="max-h-32 md:max-h-none overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
            <div className="flex flex-wrap justify-center gap-1.5 max-w-6xl mx-auto px-4">
              {categories.map((category) => (
                <div key={category.name} className="flex-shrink-0">
                  <CategoryCard
                    name={category.name}
                    icon={category.icon}
                    href={category.href}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tools */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground">Featured Tools</h2>
            <Button variant="outline" asChild>
              <Link href="/category/featured">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {featuredLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded-lg shimmer"></div>
              ))}
            </div>
          ) : (featuredTools as any)?.items?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(featuredTools as any).items.map((tool: any) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {featuredError ? `Error loading tools: ${featuredError.message}` : 'No featured tools available'}
            </div>
          )}
        </div>
      </section>

      {/* Trending Tools */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground">Trending Tools</h2>
            <Button variant="outline" asChild>
              <Link href="/category/trending">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {trendingLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-48 bg-background rounded-lg shimmer"></div>
              ))}
            </div>
          ) : (trendingTools as any)?.items?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(trendingTools as any).items.map((tool: any) => (
                <ToolCard key={tool.id} tool={tool} showDescription={false} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {trendingError ? `Error loading tools: ${trendingError.message}` : 'No trending tools available'}
            </div>
          )}
        </div>
      </section>

      {/* Latest AI News */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground">Latest AI News</h2>
            <Button variant="outline" asChild>
              <Link href="/news">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {newsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-40 bg-muted rounded-lg shimmer"></div>
              ))}
            </div>
          ) : (latestNews as any)?.items?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(latestNews as any).items.map((article: any) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {newsError ? `Error loading news: ${newsError.message}` : 'No news available'}
            </div>
          )}
        </div>
      </section>

      {/* Featured Videos */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground">Featured Videos</h2>
            <Button variant="outline" asChild>
              <Link href="/videos">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {videosLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-64 bg-background rounded-lg shimmer"></div>
              ))}
            </div>
          ) : (featuredVideos as any)?.items?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(featuredVideos as any).items.map((video: any) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {videosError ? `Error loading videos: ${videosError.message}` : 'No videos available'}
            </div>
          )}
        </div>
      </section>

      {/* Featured Blogs */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground">Featured Blogs</h2>
            <Button variant="outline" asChild>
              <Link href="/blog">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {blogsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-80 bg-muted rounded-lg shimmer"></div>
              ))}
            </div>
          ) : (featuredBlogs as any)?.items?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(featuredBlogs as any).items.map((blog: any) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {blogsError ? `Error loading blogs: ${blogsError.message}` : 'No blogs available'}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <NewsletterCTA />
    </Layout>
  );
}
