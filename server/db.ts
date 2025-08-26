import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Get DATABASE_URL from environment variables - Must be Neon database
let DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required. Please set it to your Neon database URL.");
}

// Remove extra quotes if they exist
DATABASE_URL = DATABASE_URL.replace(/^['"]|['"]$/g, '');

// Ensure we're connecting to a Neon database
if (!DATABASE_URL.includes('neon.tech')) {
  throw new Error("DATABASE_URL must be a Neon database URL (containing 'neon.tech')");
}

// Configure PostgreSQL pool for Neon database
export const pool = new Pool({ 
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
    sslmode: 'require'
  },
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error if connection takes longer than 10 seconds
});

export const db = drizzle(pool, { schema });