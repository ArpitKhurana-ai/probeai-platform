import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { apiRequest } from "@/lib/apiRequest";
import { ToolCard } from "@/components/ToolCard";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Tool {
  id: number;
  name: string;
  slug: string;
  logo: string;
  description: string;
  category: string;
  tags: string[];
  featured: boolean;
  hot: boolean;
}

interface NewsItem {
  id: number;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
}

interface BlogItem {
  id: number;
  title: string;
  slug: string;
  readTimeMinutes: number;
}

export default function Home() {
  const { data: featuredTools } = useQuery<Tool[]>({
    queryKey: ["/api/tools?featured=true&limit=4"],
    queryFn: () => apiRequest("/api/tools?featured=true&limit=4"),
  });

  const { data: hotTools } = useQuery<Tool[]>({
    queryKey: ["/api/tools?hot=true&limit=4"],
    queryFn: () => apiRequest("/api/tools?hot=true&limit=4"),
  });

  const { data: news } = useQuery<NewsItem[]>({
    queryKey: ["/api/news?limit=4"],
    queryFn: () => apiRequest("/api/news?limit=4"),
  });

  const { data: blogs } = useQuery<BlogItem[]>({
    queryKey: ["/api/blogs?limit=4"],
    queryFn: () => apiRequest("/api/blogs?limit=4"),
  });

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return !isNaN(d.getTime())
      ? d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : null;
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 pt-8">
        {/* Featured Tools */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">🔥 Hot Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {hotTools?.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">✨ Featured Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredTools?.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>

        {/* News & Blogs */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="border rounded-xl p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-2">🗞️ Latest AI News</h2>
            <ul className="space-y-2">
              {news?.map((item) => (
                <li key={item.id} className="flex justify-between text-sm">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-200 hover:underline"
                  >
                    {item.title}
                  </a>
                  <span className="text-gray-400 ml-2 whitespace-nowrap">
                    {formatDate(item.publishedAt) || "—"}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              to="/news"
              className="block mt-2 text-sm text-purple-400 hover:underline"
            >
              → See all News
            </Link>
          </div>

          <div className="border rounded-xl p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-2">📚 Featured Blogs</h2>
            <ul className="space-y-2 text-sm">
              {blogs?.map((item) => (
                <li key={item.id} className="flex justify-between">
                  <Link
                    to={`/blog/${item.slug}`}
                    className="text-sky-200 hover:underline"
                  >
                    {item.title}
                  </Link>
                  <span className="text-gray-400 ml-2 whitespace-nowrap">
                    • {item.readTimeMinutes} min read
                  </span>
                </li>
              ))}
            </ul>
            <Link
              to="/blog"
              className="block mt-2 text-sm text-purple-400 hover:underline"
            >
              → Browse all Blogs
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}
