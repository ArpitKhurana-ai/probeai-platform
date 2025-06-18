import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "./shared/schema.js";

neonConfig.webSocketConstructor = ws;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.warn(
    "DATABASE_URL not found. Please set DATABASE_URL environment variable in Railway deployment."
  );
  console.warn("Database operations will be disabled until DATABASE_URL is configured.");
}

export const pool = DATABASE_URL ? new Pool({ connectionString: DATABASE_URL }) : null;
export const db = DATABASE_URL ? drizzle({ client: pool!, schema }) : null;
