import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Use environment variable for database connection with fallback
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_BqzVv5d6KntG@ep-falling-snow-acibggbo-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

console.log('DATABASE_URL configured:', DATABASE_URL.substring(0, 30) + '...');

export const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle({ client: pool, schema });