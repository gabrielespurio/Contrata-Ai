import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Set DATABASE_URL if not already set (fallback configuration)
let DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  DATABASE_URL = "postgresql://neondb_owner:npg_BqzVv5d6KntG@ep-falling-snow-acibggbo-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
  console.log("Using fallback DATABASE_URL configuration");
}

export const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle({ client: pool, schema });