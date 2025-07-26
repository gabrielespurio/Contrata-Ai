import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Use environment variable for database connection
let DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Clean up URL encoding if present
DATABASE_URL = decodeURIComponent(DATABASE_URL);
// Remove any 'psql' prefix that might have been added
DATABASE_URL = DATABASE_URL.replace(/^psql\s+'/, '').replace(/'$/, '');

console.log('DATABASE_URL configured:', DATABASE_URL.substring(0, 30) + '...');

export const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle({ client: pool, schema });