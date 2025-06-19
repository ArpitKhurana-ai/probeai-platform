import type { Request, Response } from 'express';
import { db } from './db.js';
import { sql } from 'drizzle-orm';

export async function healthCheck(req: Request, res: Response) {
  try {
    // Test database connection
    await db.execute(sql`SELECT 1`);
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}