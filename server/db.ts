import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Get DATABASE_URL from environment variables
let DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Remove extra quotes if they exist
DATABASE_URL = DATABASE_URL.replace(/^['"]|['"]$/g, '');

export const pool = new Pool({ 
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : false
});
export const db = drizzle(pool, { schema });