import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import * as schema from './schema';

/**
 * SQLite database configuration for WakeMind
 */

const DATABASE_NAME = 'wakemind.db';

// Open SQLite database
const expoDb = openDatabaseSync(DATABASE_NAME);

// Initialize Drizzle ORM
export const db = drizzle(expoDb, { schema });

// Create tables if they don't exist
export function initializeDatabase() {
  try {
    expoDb.execSync(`
      CREATE TABLE IF NOT EXISTS alarm_completions (
        id TEXT PRIMARY KEY,
        target_time TEXT NOT NULL,
        actual_time TEXT NOT NULL,
        cognitive_score INTEGER NOT NULL,
        reaction_time INTEGER NOT NULL,
        challenge_type TEXT NOT NULL,
        date TEXT NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_completions_date 
      ON alarm_completions(date);
    `);

    console.log('[Database] Tables initialized successfully');
  } catch (error) {
    console.error('[Database] Failed to initialize tables:', error);
    throw error;
  }
}

// Initialize database on import
initializeDatabase();
