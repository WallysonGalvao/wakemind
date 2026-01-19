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
      CREATE TABLE IF NOT EXISTS alarms (
        id TEXT PRIMARY KEY,
        time TEXT NOT NULL,
        period TEXT NOT NULL,
        challenge TEXT NOT NULL,
        challenge_type TEXT NOT NULL,
        challenge_icon TEXT NOT NULL,
        schedule TEXT NOT NULL,
        is_enabled INTEGER NOT NULL DEFAULT 1,
        difficulty TEXT,
        protocols TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_alarms_enabled 
      ON alarms(is_enabled);
      
      CREATE INDEX IF NOT EXISTS idx_alarms_time 
      ON alarms(time, period);
      
      CREATE TABLE IF NOT EXISTS alarm_completions (
        id TEXT PRIMARY KEY,
        alarm_id TEXT,
        target_time TEXT NOT NULL,
        actual_time TEXT NOT NULL,
        cognitive_score INTEGER NOT NULL,
        reaction_time INTEGER NOT NULL,
        challenge_type TEXT NOT NULL,
        date TEXT NOT NULL,
        FOREIGN KEY (alarm_id) REFERENCES alarms(id) ON DELETE SET NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_completions_date 
      ON alarm_completions(date);
      
      CREATE INDEX IF NOT EXISTS idx_completions_alarm_id 
      ON alarm_completions(alarm_id);
    `);

    console.log('[Database] Tables initialized successfully');
  } catch (error) {
    console.error('[Database] Failed to initialize tables:', error);
    throw error;
  }
}

// Initialize database on import
initializeDatabase();
