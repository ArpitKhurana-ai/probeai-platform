import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import { Loader } from "@/components/ui/loader";

// Mock or replace this with actual API call
const groupedCategories = [
  {
    group: "AI Tools for Business",
    items: ["Marketing", "Sales", "Analytics", "Customer Service"],
  },
  {
    group: "AI Tools for Development",
    items: ["Coding", "No-Code", "LLM", "Database"],
  },
  {
    group: "AI Tools for Productivity",
    items: ["Note Taking", "Email", "Automation", "Workflow"],
  },
  {
    group: "AI Tools for Content Creation",
    items: ["Writing", "Image Generation", "Video", "Audio"],
  },
  {
    group: "AI Tools for Design",
    items: ["UI/UX", "Graphics", "Architecture", "Animation"],
  },
  {
    group: "AI Tools for NSFW",
    items: ["Roleplay", "Undress", "Hentai", "Sexchat"],
  },
];

export default function ToolsPage() {
  return (
    <Layout>
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Browse AI Tools by Category</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Explore all tools organized into categories. Choose your use case and find the right solution.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {groupedCategories.map((group) => (
            <div key={group.group} className="bg-white dark:bg-zinc-900 rounded-2xl shadow-md p-6 border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-3">{group.group}</h3>
              <ul className="space-y-1 mb-4">
                {group.items.map((item) => (
                  <li key={item} className="text-gray-800 dark:text-gray-200">
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href={`/category/${group.group.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-sm text-blue-500 dark:text-blue-300 font-medium hover:underline"
              >
                Show all {group.group}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}