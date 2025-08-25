import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Get DATABASE_URL from environment variables
let DATABASE_URL = process.env.DATABASE_URL;

// If no DATABASE_URL provided, use local PostgreSQL setup
if (!DATABASE_URL) {
  DATABASE_URL = `postgresql://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD || 'password'}@${process.env.PGHOST || 'localhost'}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE || 'postgres'}`;
}

// Remove extra quotes if they exist
DATABASE_URL = DATABASE_URL.replace(/^['"]|['"]$/g, '');

// Configure PostgreSQL pool for Replit database
export const pool = new Pool({ 
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error if connection takes longer than 2 seconds
});

export const db = drizzle(pool, { schema });