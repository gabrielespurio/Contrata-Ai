import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Use ONLY the specific Neon database - no other connections allowed
const NEON_DATABASE_URL = "postgresql://neondb_owner:npg_BqzVv5d6KntG@ep-falling-snow-acibggbo-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

export const pool = new Pool({ connectionString: NEON_DATABASE_URL });
export const db = drizzle({ client: pool, schema });