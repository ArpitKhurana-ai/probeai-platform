import { db } from './db.js';
import { sql } from 'drizzle-orm';

export async function initializeDatabase() {
  try {
    console.log('🔍 Checking database connection...');
    
    // Test basic connection
    await db.execute(sql`SELECT 1`);
    console.log('✅ Database connection successful');
    
    // Check if tables exist
    const tableCheck = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('tools', 'users', 'news', 'blogs', 'videos', 'categories')
    `);
    
    console.log(`📊 Found ${tableCheck.rows.length} tables in database`);
    
    if (tableCheck.rows.length === 0) {
      console.log('⚠️  No tables found - database may need initialization');
      console.log('💡 Run: npm run db:push to create tables');
    } else {
      console.log('✅ Database tables exist');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    console.error('💡 Check DATABASE_URL and database accessibility');
    return false;
  }
}