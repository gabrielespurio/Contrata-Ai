import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Get DATABASE_URL from environment variables - prioritize Neon database
let DATABASE_URL = process.env.DATABASE_URL;

// Use Neon database URL if provided
const NEON_DATABASE_URL = "postgresql://neondb_owner:npg_BqzVv5d6KntG@ep-falling-snow-acibggbo-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

// Prefer Neon database if available
DATABASE_URL = NEON_DATABASE_URL || DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required. Please set it to your database URL.");
}

// Remove extra quotes if they exist
DATABASE_URL = DATABASE_URL.replace(/^['"]|['"]$/g, '');

// Configure PostgreSQL pool for Neon database
export const pool = new Pool({ 
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error if connection takes longer than 10 seconds
});

export const db = drizzle(pool, { schema });