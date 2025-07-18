#!/usr/bin/env node

/**
 * Railway Production Database Provisioning
 * Automatically provisions tables during deployment
 */

import dotenv from "dotenv";
dotenv.config();

import { Pool } from 'pg';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

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
    const tables = ['tools', 'news', 'blogs', 'videos'];
    let allTablesHaveData = true;

    for (const table of tables) {
      try {
        const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
        const count = parseInt(result.rows[0].count);
        if (count === 0) {
          allTablesHaveData = false;
          console.log(`⚠️  Table ${table} exists but has no data`);
        } else {
          console.log(`✅ Table ${table} has ${count} rows`);
        }
      } catch (error) {
        console.log(`⚠️  Table ${table} does not exist or error checking: ${error.message}`);
        allTablesHaveData = false;
      }
    }

    return allTablesHaveData;
  } catch (error) {
    console.log('⚠️  Could not check existing data (tables may not exist yet):', error.message);
    return false;
  } finally {
    client.release();
  }
}

async function createTables() {
  const client = await pool.connect();
  try {
    console.log('🔧 Dropping and recreating tools table to match new schema...');
    await client.query('DROP TABLE IF EXISTS tools CASCADE;');

    // Tools table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tools (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE,
        description TEXT NOT NULL,
        short_description VARCHAR(500),
        how_it_works TEXT,
        website VARCHAR(500),
        logo_url VARCHAR(500),
        category VARCHAR(100) NOT NULL,
        tags TEXT[],
        key_features TEXT[],
        use_cases TEXT[],
        faqs JSONB,
        pros_and_cons JSONB,
        pricing_type VARCHAR(50),
        access TEXT[],
        audience TEXT[],
        meta_title VARCHAR(500),
        meta_description VARCHAR(500),
        schema JSONB,
        is_featured BOOLEAN DEFAULT false,
        is_trending BOOLEAN DEFAULT false,
        likes INTEGER DEFAULT 0,
        submitted_by VARCHAR(255),
        is_approved BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Tools table ready');

    // News table
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
    console.log('✅ News table ready');

    // Blogs table
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
    console.log('✅ Blogs table ready');

    // Videos table
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
    console.log('✅ Videos table ready');

    console.log('🎉 All tables verified or created');

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
    const client = await pool.connect();
    const result = await client.query('SELECT current_database()');
    console.log(`✅ Connected to database: ${result.rows[0].current_database}`);
    client.release();

    const alreadyProvisioned = await checkExistingData();
    console.log('🚀 Starting database provisioning...');
    await createTables();

    if (alreadyProvisioned) {
      console.log('⏭ Skipping seeding — data already exists.');
    }

    console.log('🎉 Railway database provisioning complete!');
  } catch (error) {
    console.error('❌ Database provisioning failed:', error.message);
    console.log('⚠️  Continuing deployment without database provisioning');
  } finally {
    await pool.end();
  }
}

main();
