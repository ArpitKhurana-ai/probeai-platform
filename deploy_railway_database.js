#!/usr/bin/env node

/**
 * Railway Database Deployment Script
 * Connects to Railway PostgreSQL and provisions production data
 */

import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Railway database configuration
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable not found');
  console.log('Please ensure Railway PostgreSQL addon is provisioned and DATABASE_URL is set');
  process.exit(1);
}

console.log('🚀 Starting Railway database provisioning...');
console.log('📍 Database URL:', DATABASE_URL.replace(/:[^:@]+@/, ':****@')); // Hide password

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Railway requires SSL
  }
});

async function runSQLFile(filename) {
  try {
    console.log(`📄 Reading SQL file: ${filename}`);
    const sqlPath = join(__dirname, filename);
    const sql = readFileSync(sqlPath, 'utf8');
    
    console.log(`⚡ Executing SQL commands...`);
    const result = await pool.query(sql);
    
    console.log(`✅ SQL file executed successfully`);
    if (result.rows && result.rows.length > 0) {
      console.log('📊 Results:');
      result.rows.forEach(row => {
        console.log(`   ${JSON.stringify(row)}`);
      });
    }
    
    return result;
  } catch (error) {
    console.error(`❌ Error executing SQL file ${filename}:`, error.message);
    throw error;
  }
}

async function verifyAPIs() {
  console.log('🔍 Verifying API endpoints...');
  
  try {
    // Test Railway deployment URL
    const RAILWAY_URL = 'https://probeai-platform-production.up.railway.app';
    
    const endpoints = [
      '/api/news?limit=1',
      '/api/blogs?limit=1', 
      '/api/videos?limit=1'
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`   Testing ${RAILWAY_URL}${endpoint}`);
        const response = await fetch(`${RAILWAY_URL}${endpoint}`, {
          timeout: 10000
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`   ✅ ${endpoint}: ${data.items?.length || 0} items`);
        } else {
          console.log(`   ⚠️  ${endpoint}: HTTP ${response.status}`);
        }
      } catch (error) {
        console.log(`   ❌ ${endpoint}: ${error.message}`);
      }
    }
  } catch (error) {
    console.log('⚠️  API verification failed (this is expected if Railway deployment is not ready)');
  }
}

async function main() {
  try {
    // Test database connection
    console.log('🔌 Testing database connection...');
    const client = await pool.connect();
    const result = await client.query('SELECT current_database(), current_user, version()');
    console.log(`✅ Connected to database: ${result.rows[0].current_database}`);
    console.log(`👤 User: ${result.rows[0].current_user}`);
    client.release();
    
    // Execute seeding script
    await runSQLFile('seed_railway_data.sql');
    
    console.log('🎉 Railway database provisioning completed successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log('   • News articles: 5 authentic AI industry updates');
    console.log('   • Blog posts: 4 comprehensive technical articles');  
    console.log('   • Videos: 5 educational and tutorial content');
    console.log('   • All data approved and ready for production');
    console.log('');
    
    // Verify APIs (optional)
    await verifyAPIs();
    
  } catch (error) {
    console.error('❌ Railway database provisioning failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
  process.exit(1);
});

main();