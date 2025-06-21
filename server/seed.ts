import { db } from "./db";
import { tools, blogs, news, videos } from "./db-init"; // Adjust if paths are different

export async function seedDatabase() {
  console.log("🌱 Seeding database...");

  try {
    const existingTools = await db.query.tools.findFirst();
    const existingBlogs = await db.query.blogs.findFirst();
    const existingNews = await db.query.news.findFirst();
    const existingVideos = await db.query.videos.findFirst();

    if (!existingTools) {
      console.log("🛠 Seeding tools...");
      await db.insert(tools).values([
        {
          name: "ChatGPT",
          description: "An AI assistant by OpenAI",
          url: "https://chat.openai.com",
          category: "Chatbot",
        },
        // Add more tools here...
      ]);
    }

    if (!existingBlogs) {
      console.log("✍️ Seeding blogs...");
      await db.insert(blogs).values([
        {
          title: "Welcome to ProbeAI",
          summary: "Your go-to AI tools and news aggregator",
          content: "ProbeAI helps you stay ahead in AI.",
        },
      ]);
    }

    if (!existingNews) {
      console.log("📰 Seeding news...");
      await db.insert(news).values([
        {
          title: "OpenAI launches GPT-5",
          summary: "The next generation language model has arrived.",
          link: "https://openai.com/blog/gpt-5",
        },
      ]);
    }

    if (!existingVideos) {
      console.log("🎥 Seeding videos...");
      await db.insert(videos).values([
        {
          title: "Getting started with ProbeAI",
          url: "https://youtube.com/example-video",
          summary: "Learn how to use ProbeAI",
        },
      ]);
    }

    console.log("✅ Seeding complete.");
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  }
}
