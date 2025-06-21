import { db } from "./db";
import { tools, blogs, news, videos } from "./db-init";

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
        // You can add more tools here
      ]);
    }

    if (!existingBlogs) {
      console.log("✍️ Seeding blogs...");
      await db.insert(blogs).values([
        {
          title: 'The Future of AI Agent Orchestration in Enterprise Workflows',
          slug: 'future-ai-agent-orchestration-enterprise',
          content: 'Exploring how multi-agent systems are revolutionizing business process automation...',
          excerpt: 'Exploring how multi-agent systems are revolutionizing business process automation...',
          author: 'Dr. Sarah Chen',
          tags: ['AI', 'Enterprise', 'Automation', 'Multi-Agent Systems'],
          meta_title: 'The Future of AI Agent Orchestration in Enterprise Workflows | Probe AI',
          meta_description: 'Discover how multi-agent systems are transforming enterprise workflows...',
          read_time: 12,
          is_published: true,
          publish_date: new Date(Date.now() - 86400000 * 1), // 1 day ago
          is_approved: true
        },
        {
          title: 'Building Scalable RAG Systems: Lessons from Production Deployments',
          slug: 'scalable-rag-systems-production',
          content: 'Technical deep-dive into retrieval-augmented generation architectures...',
          excerpt: 'Technical deep-dive into retrieval-augmented generation architectures...',
          author: 'Alex Rodriguez',
          tags: ['RAG', 'Vector Databases', 'Production', 'Scalability'],
          meta_title: 'Building Scalable RAG Systems: Production Deployment Guide | Probe AI',
          meta_description: 'Learn how to build and deploy RAG systems at scale...',
          read_time: 15,
          is_published: true,
          publish_date: new Date(Date.now() - 86400000 * 3), // 3 days ago
          is_approved: true
        },
        {
          title: 'Prompt Engineering Best Practices for 2025',
          slug: 'prompt-engineering-best-practices-2025',
          content: 'Advanced techniques for optimizing large language model interactions...',
          excerpt: 'Advanced techniques for optimizing large language model interactions...',
          author: 'Maria Gonzalez',
          tags: ['Prompt Engineering', 'LLM', 'Best Practices', 'Optimization'],
          meta_title: 'Prompt Engineering Best Practices for 2025 | Probe AI',
          meta_description: 'Master advanced prompt engineering techniques...',
          read_time: 10,
          is_published: true,
          publish_date: new Date(Date.now() - 86400000 * 5),
          is_approved: true
        },
        {
          title: 'The Economics of AI Model Training: Cost Optimization Strategies',
          slug: 'economics-ai-model-training-optimization',
          content: 'Analyzing compute costs, hardware selection, and training efficiency...',
          excerpt: 'Comprehensive analysis of compute costs, hardware selection...',
          author: 'David Kim',
          tags: ['AI Training', 'Cost Optimization', 'Hardware', 'Economics'],
          meta_title: 'AI Model Training Economics: Cost Optimization Guide | Probe AI',
          meta_description: 'Learn cost optimization strategies for AI model training...',
          read_time: 14,
          is_published: true,
          publish_date: new Date(Date.now() - 86400000 * 7),
          is_approved: true
        }
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