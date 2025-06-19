#!/usr/bin/env node

/**
 * Railway Production Database Provisioning
 * Automatically provisions tables and seeds data during deployment
 */

import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.log('⚠️  DATABASE_URL not found - skipping database provisioning');
  process.exit(0);
}

console.log('🚀 Railway database provisioning starting...');
console.log('📍 Database URL configured');

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkExistingData() {
  const client = await pool.connect();
  try {
    // Check if tables exist and have data
    const newsResult = await client.query("SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'news'");
    const hasNewsTable = newsResult.rows[0].count > 0;
    
    if (hasNewsTable) {
      const dataCount = await client.query('SELECT COUNT(*) FROM news');
      if (dataCount.rows[0].count > 0) {
        console.log('✅ Database already provisioned - skipping');
        return true;
      }
    }
    return false;
  } catch (error) {
    return false;
  } finally {
    client.release();
  }
}

async function createTables() {
  const client = await pool.connect();
  try {
    // Use the existing schema structure from the project
    await client.query(`
      CREATE TABLE IF NOT EXISTS news (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        excerpt TEXT,
        source VARCHAR(255),
        source_url VARCHAR(500),
        publish_date TIMESTAMP DEFAULT NOW(),
        category VARCHAR(100),
        submitted_by VARCHAR(255),
        is_approved BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE,
        content TEXT,
        excerpt TEXT,
        image_url VARCHAR(500),
        author VARCHAR(100),
        tags TEXT[],
        meta_title VARCHAR(255),
        meta_description TEXT,
        og_title VARCHAR(255),
        og_description TEXT,
        read_time INTEGER,
        is_published BOOLEAN DEFAULT true,
        publish_date TIMESTAMP DEFAULT NOW(),
        submitted_by VARCHAR(255),
        is_approved BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS videos (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        video_url VARCHAR(500),
        thumbnail_url VARCHAR(500),
        channel VARCHAR(100),
        duration VARCHAR(20),
        views VARCHAR(50),
        category VARCHAR(100),
        tags TEXT[],
        submitted_by VARCHAR(255),
        is_approved BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    console.log('✅ Tables created successfully');
  } finally {
    client.release();
  }
}

async function seedData() {
  const client = await pool.connect();
  try {
    // Seed news data
    await client.query(`
      INSERT INTO news (title, excerpt, source, source_url, publish_date, category, is_approved) VALUES
      ('OpenAI Unveils GPT-5 with Enhanced Reasoning Capabilities', 'The latest iteration shows significant improvements in complex problem-solving and multimodal understanding across various domains, setting new benchmarks for large language models.', 'OpenAI Blog', 'https://openai.com/blog/gpt-5-announcement', NOW() - INTERVAL '1 day', 'AI Models', true),
      ('Google DeepMind Achieves Breakthrough in Scientific Research AI', 'AlphaFold 3 demonstrates unprecedented accuracy in protein structure prediction, potentially revolutionizing drug discovery and biological research timelines.', 'DeepMind Research', 'https://deepmind.google/discoveries/alphafold-3', NOW() - INTERVAL '2 days', 'Research', true),
      ('Microsoft Copilot Integration Reaches 1 Billion Users Globally', 'Enterprise adoption accelerates as AI assistants become integral to workplace productivity, transforming how businesses approach automation and collaboration.', 'Microsoft AI', 'https://microsoft.com/ai/copilot-milestone', NOW() - INTERVAL '3 days', 'Enterprise', true),
      ('Anthropic Claude 4 Sets New Standards in AI Safety', 'Constitutional AI approach demonstrates measurable improvements in harmless and helpful responses, addressing critical concerns about AI alignment and safety.', 'Anthropic Research', 'https://anthropic.com/news/claude-4-safety', NOW() - INTERVAL '4 days', 'AI Safety', true),
      ('Meta LLaMA 4 Open Source Release Democratizes AI Development', 'Free commercial licensing enables widespread adoption while maintaining competitive performance with proprietary models, accelerating innovation across industries.', 'Meta AI Research', 'https://ai.meta.com/llama-4-release', NOW() - INTERVAL '5 days', 'Open Source', true);
    `);
    
    // Seed blogs data
    await client.query(`
      INSERT INTO blogs (title, slug, content, excerpt, author, tags, meta_title, meta_description, read_time, is_published, publish_date, is_approved) VALUES
      ('The Future of AI Agent Orchestration in Enterprise Workflows', 'future-ai-agent-orchestration-enterprise', 'Exploring how multi-agent systems are revolutionizing business process automation and decision-making frameworks. As organizations increasingly adopt AI technologies, the orchestration of multiple specialized agents becomes crucial for complex enterprise workflows. This comprehensive analysis examines current frameworks, implementation strategies, and emerging patterns in agent coordination systems that are transforming how businesses operate at scale.', 'Exploring how multi-agent systems are revolutionizing business process automation and decision-making frameworks for modern enterprises.', 'Dr. Sarah Chen', ARRAY['AI', 'Enterprise', 'Automation', 'Multi-Agent Systems'], 'The Future of AI Agent Orchestration in Enterprise Workflows | Probe AI', 'Discover how multi-agent systems are transforming enterprise workflows and business process automation in 2025', 12, true, NOW() - INTERVAL '1 day', true),
      ('Building Scalable RAG Systems: Lessons from Production Deployments', 'scalable-rag-systems-production', 'Technical deep-dive into retrieval-augmented generation architectures that handle millions of queries daily. Retrieval-Augmented Generation has become the backbone of modern AI applications. This article shares practical insights from deploying RAG systems at scale, covering vector database optimization, embedding strategies, chunking techniques, and performance monitoring approaches that ensure reliability under heavy production loads.', 'Technical deep-dive into retrieval-augmented generation architectures that handle millions of queries daily with practical deployment insights.', 'Alex Rodriguez', ARRAY['RAG', 'Vector Databases', 'Production', 'Scalability'], 'Building Scalable RAG Systems: Production Deployment Guide | Probe AI', 'Learn how to build and deploy RAG systems at scale with proven production strategies and optimization techniques', 15, true, NOW() - INTERVAL '3 days', true),
      ('Prompt Engineering Best Practices for 2025', 'prompt-engineering-best-practices-2025', 'Advanced techniques for optimizing large language model interactions across different use cases and domains. Effective prompt engineering remains critical for maximizing AI model performance. This comprehensive guide covers the latest methodologies, from chain-of-thought reasoning to few-shot learning optimization, providing practical frameworks for developing robust prompt strategies that consistently deliver high-quality outputs.', 'Advanced techniques for optimizing large language model interactions with proven methodologies and practical frameworks.', 'Maria Gonzalez', ARRAY['Prompt Engineering', 'LLM', 'Best Practices', 'Optimization'], 'Prompt Engineering Best Practices for 2025 | Probe AI', 'Master advanced prompt engineering techniques and optimization strategies for large language models in 2025', 10, true, NOW() - INTERVAL '5 days', true),
      ('The Economics of AI Model Training: Cost Optimization Strategies', 'economics-ai-model-training-optimization', 'Analyzing compute costs, hardware selection, and training efficiency techniques for modern AI development. Training large-scale AI models requires significant computational resources and careful cost management. This analysis breaks down cost structures, optimization strategies, and emerging approaches to make AI development more economically viable while maintaining model quality and performance standards.', 'Comprehensive analysis of compute costs, hardware selection, and training efficiency techniques for cost-effective AI development.', 'David Kim', ARRAY['AI Training', 'Cost Optimization', 'Hardware', 'Economics'], 'AI Model Training Economics: Cost Optimization Guide | Probe AI', 'Learn cost optimization strategies for AI model training including hardware selection and efficiency techniques', 14, true, NOW() - INTERVAL '7 days', true);
    `);
    
    // Seed videos data
    await client.query(`
      INSERT INTO videos (title, description, video_url, thumbnail_url, channel, duration, views, category, is_approved) VALUES
      ('Complete Guide to Building AI Agents with LangChain', 'Comprehensive tutorial covering the fundamentals of AI agent development using LangChain framework, including practical examples and best practices for creating intelligent, autonomous systems.', 'https://youtube.com/watch?v=dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', 'AI Development Academy', '24:15', '187K views', 'Tutorial', true),
      ('OpenAI DevDay 2024: Complete Announcements Breakdown', 'In-depth analysis of all major announcements from OpenAI DevDay 2024, covering new model releases, API updates, and developer tools that are shaping the future of AI development.', 'https://youtube.com/watch?v=dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', 'Tech News Central', '18:42', '294K views', 'News', true),
      ('Fine-tuning Large Language Models: Step-by-Step Workshop', 'Practical workshop demonstrating the complete process of fine-tuning large language models, from data preparation to deployment, with real-world examples and performance optimization techniques.', 'https://youtube.com/watch?v=dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', 'ML Engineering Hub', '45:30', '156K views', 'Tutorial', true),
      ('AI Ethics Panel: Responsible Development in 2025', 'Expert panel discussion on the critical ethical considerations for AI development, covering bias mitigation, transparency, accountability, and the future of responsible AI deployment.', 'https://youtube.com/watch?v=dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', 'AI Ethics Institute', '32:18', '89K views', 'Discussion', true),
      ('Vector Databases Explained: Choosing the Right Solution', 'Comprehensive comparison of leading vector database solutions including Pinecone, Weaviate, and Chroma, with practical guidance for selecting the optimal solution for your AI applications.', 'https://youtube.com/watch?v=dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', 'Database Review Channel', '28:45', '112K views', 'Review', true);
    `);
    
    // Seed tools data from SQL file
    const toolsSql = readFileSync(join(__dirname, 'create_tools_table.sql'), 'utf8');
    await client.query(toolsSql);
    
    console.log('✅ Data seeded successfully');
    
    // Verify counts
    const newsCount = await client.query('SELECT COUNT(*) FROM news');
    const blogsCount = await client.query('SELECT COUNT(*) FROM blogs');
    const videosCount = await client.query('SELECT COUNT(*) FROM videos');
    const toolsCount = await client.query('SELECT COUNT(*) FROM tools');
    
    console.log(`📊 Provisioned data:`);
    console.log(`   News: ${newsCount.rows[0].count} articles`);
    console.log(`   Blogs: ${blogsCount.rows[0].count} posts`);
    console.log(`   Videos: ${videosCount.rows[0].count} videos`);
    console.log(`   Tools: ${toolsCount.rows[0].count} tools`);
    
  } finally {
    client.release();
  }
}

async function main() {
  try {
    // Test connection
    const client = await pool.connect();
    const result = await client.query('SELECT current_database()');
    console.log(`✅ Connected to database: ${result.rows[0].current_database}`);
    client.release();
    
    // Check if already provisioned
    const alreadyProvisioned = await checkExistingData();
    if (alreadyProvisioned) {
      return;
    }
    
    // Provision database
    await createTables();
    await seedData();
    
    console.log('🎉 Railway database provisioning complete!');
    
  } catch (error) {
    console.error('❌ Database provisioning failed:', error.message);
    // Don't fail the deployment if database provisioning fails
    console.log('⚠️  Continuing deployment without database provisioning');
  } finally {
    await pool.end();
  }
}

main();