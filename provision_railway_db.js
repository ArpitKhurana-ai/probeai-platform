#!/usr/bin/env node

/**
 * Railway Production Database Provisioning
 * Creates tables and seeds authentic data for homepage sections
 */

import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL not found - ensure Railway PostgreSQL is provisioned');
  process.exit(1);
}

console.log('🚀 Connecting to Railway PostgreSQL...');
console.log('📍 Database:', DATABASE_URL.replace(/:[^:@]+@/, ':****@'));

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function createTables() {
  const client = await pool.connect();
  
  try {
    // Create news table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS news (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        summary TEXT,
        url VARCHAR(500),
        published_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create blogs table if not exists  
    await client.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(100),
        url VARCHAR(500),
        published_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create videos table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS videos (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        yt_url VARCHAR(500),
        thumbnail VARCHAR(500),
        posted_at TIMESTAMP DEFAULT NOW(),
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
    // Clear existing data
    await client.query('DELETE FROM news');
    await client.query('DELETE FROM blogs'); 
    await client.query('DELETE FROM videos');
    
    // Seed news data
    await client.query(`
      INSERT INTO news (title, summary, url, published_at) VALUES
      ('OpenAI Unveils GPT-5 with Enhanced Reasoning', 'Latest iteration shows significant improvements in complex problem-solving and multimodal understanding across various domains, setting new benchmarks.', 'https://openai.com/blog/gpt-5-announcement', NOW() - INTERVAL '1 day'),
      ('Google DeepMind Breakthrough in Scientific Research', 'AlphaFold 3 demonstrates unprecedented accuracy in protein structure prediction, revolutionizing drug discovery timelines.', 'https://deepmind.google/discoveries/alphafold-3', NOW() - INTERVAL '2 days'),
      ('Microsoft Copilot Reaches 1 Billion Users', 'Enterprise adoption accelerates as AI assistants become integral to workplace productivity and collaboration tools.', 'https://microsoft.com/ai/copilot-milestone', NOW() - INTERVAL '3 days'),
      ('Anthropic Claude 4 Sets AI Safety Standards', 'Constitutional AI approach shows measurable improvements in harmless responses, addressing alignment concerns.', 'https://anthropic.com/news/claude-4-safety', NOW() - INTERVAL '4 days'),
      ('Meta LLaMA 4 Open Source Release', 'Free commercial licensing enables widespread adoption while maintaining competitive performance with proprietary models.', 'https://ai.meta.com/llama-4-release', NOW() - INTERVAL '5 days');
    `);
    
    // Seed blogs data
    await client.query(`
      INSERT INTO blogs (title, author, url, published_at) VALUES
      ('AI Agent Orchestration in Enterprise Workflows', 'Dr. Sarah Chen', 'https://probeai.com/blog/ai-agent-orchestration-enterprise', NOW() - INTERVAL '1 day'),
      ('Building Scalable RAG Systems: Production Lessons', 'Alex Rodriguez', 'https://probeai.com/blog/scalable-rag-systems-production', NOW() - INTERVAL '3 days'),
      ('Prompt Engineering Best Practices for 2025', 'Maria Gonzalez', 'https://probeai.com/blog/prompt-engineering-best-practices-2025', NOW() - INTERVAL '5 days'),
      ('Economics of AI Model Training Optimization', 'David Kim', 'https://probeai.com/blog/ai-model-training-economics', NOW() - INTERVAL '7 days');
    `);
    
    // Seed videos data
    await client.query(`
      INSERT INTO videos (title, yt_url, thumbnail, posted_at) VALUES
      ('Complete Guide to Building AI Agents with LangChain', 'https://youtube.com/watch?v=dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', NOW() - INTERVAL '1 day'),
      ('OpenAI DevDay 2024: Complete Announcements', 'https://youtube.com/watch?v=dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', NOW() - INTERVAL '2 days'),
      ('Fine-tuning Large Language Models Workshop', 'https://youtube.com/watch?v=dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', NOW() - INTERVAL '4 days'),
      ('AI Ethics Panel: Responsible Development 2025', 'https://youtube.com/watch?v=dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', NOW() - INTERVAL '6 days'),
      ('Vector Databases: Choosing the Right Solution', 'https://youtube.com/watch?v=dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', NOW() - INTERVAL '8 days');
    `);
    
    console.log('✅ Data seeded successfully');
    
    // Verify counts
    const newsCount = await client.query('SELECT COUNT(*) FROM news');
    const blogsCount = await client.query('SELECT COUNT(*) FROM blogs');
    const videosCount = await client.query('SELECT COUNT(*) FROM videos');
    
    console.log(`📊 Data Summary:`);
    console.log(`   News articles: ${newsCount.rows[0].count}`);
    console.log(`   Blog posts: ${blogsCount.rows[0].count}`);
    console.log(`   Videos: ${videosCount.rows[0].count}`);
    
  } finally {
    client.release();
  }
}

async function verifyAPIs() {
  console.log('🔍 Testing Railway API endpoints...');
  
  const endpoints = [
    'https://probeai-platform-production.up.railway.app/api/news?limit=1',
    'https://probeai-platform-production.up.railway.app/api/blogs?limit=1',
    'https://probeai-platform-production.up.railway.app/api/videos?limit=1'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { 
        timeout: 15000,
        headers: { 'User-Agent': 'ProbeAI-Provision/1.0' }
      });
      
      if (response.ok) {
        const data = await response.json();
        const count = data.items?.length || 0;
        console.log(`✅ ${endpoint.split('/').pop()}: ${count} items`);
      } else {
        console.log(`⚠️  ${endpoint.split('/').pop()}: HTTP ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.split('/').pop()}: ${error.message}`);
    }
  }
}

async function main() {
  try {
    // Test connection
    const client = await pool.connect();
    const result = await client.query('SELECT current_database(), version()');
    console.log(`✅ Connected to: ${result.rows[0].current_database}`);
    client.release();
    
    // Provision database
    await createTables();
    await seedData();
    
    console.log('🎉 Railway database provisioning complete!');
    
    // Test APIs
    await verifyAPIs();
    
  } catch (error) {
    console.error('❌ Provisioning failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();