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
    // Create alarms table first
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
    `);

    // Create indexes for alarms table
    expoDb.execSync(`
      CREATE INDEX IF NOT EXISTS idx_alarms_enabled 
      ON alarms(is_enabled);
      
      CREATE INDEX IF NOT EXISTS idx_alarms_time 
      ON alarms(time, period);
    `);

    // Create alarm_completions table
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
    `);

    // Add alarm_id column if it doesn't exist (migration)
    // SQLite doesn't support ALTER TABLE ADD COLUMN IF NOT EXISTS directly
    // So we need to check if the column exists first
    try {
      const tableInfo = expoDb.getAllSync('PRAGMA table_info(alarm_completions);') as Array<{
        name: string;
      }>;
      const hasAlarmId = tableInfo.some((col) => col.name === 'alarm_id');
      const hasAttempts = tableInfo.some((col) => col.name === 'attempts');

      if (!hasAlarmId) {
        console.log('[Database] Adding alarm_id column to alarm_completions');
        expoDb.execSync(`
          ALTER TABLE alarm_completions ADD COLUMN alarm_id TEXT;
        `);
      }

      if (!hasAttempts) {
        console.log('[Database] Adding attempts column to alarm_completions');
        expoDb.execSync(`
          ALTER TABLE alarm_completions ADD COLUMN attempts INTEGER NOT NULL DEFAULT 1;
        `);
      }
    } catch (pragmaError) {
      console.warn('[Database] Could not check for alarm_id/attempts column:', pragmaError);
    }

    // Create indexes for alarm_completions
    expoDb.execSync(`
      CREATE INDEX IF NOT EXISTS idx_completions_date 
      ON alarm_completions(date);
      
      CREATE INDEX IF NOT EXISTS idx_completions_alarm_id 
      ON alarm_completions(alarm_id);
    `);

    // Create achievements table
    expoDb.execSync(`
      CREATE TABLE IF NOT EXISTS achievements (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        tier TEXT NOT NULL,
        icon TEXT NOT NULL,
        is_secret INTEGER NOT NULL DEFAULT 0,
        target INTEGER NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

    // Create user_achievements table
    expoDb.execSync(`
      CREATE TABLE IF NOT EXISTS user_achievements (
        id TEXT PRIMARY KEY,
        achievement_id TEXT NOT NULL,
        unlocked_at TEXT,
        progress INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    // Create indexes for user_achievements
    expoDb.execSync(`
      CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id 
      ON user_achievements(achievement_id);
      
      CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked 
      ON user_achievements(unlocked_at);
    `);

    // Create snooze_logs table
    expoDb.execSync(`
      CREATE TABLE IF NOT EXISTS snooze_logs (
        id TEXT PRIMARY KEY,
        alarm_id TEXT NOT NULL,
        triggered_at TEXT NOT NULL,
        snoozed_at TEXT NOT NULL,
        snooze_count INTEGER NOT NULL,
        final_action TEXT NOT NULL,
        date TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

    // Create indexes for snooze_logs
    expoDb.execSync(`
      CREATE INDEX IF NOT EXISTS idx_snooze_logs_alarm_id 
      ON snooze_logs(alarm_id);
      
      CREATE INDEX IF NOT EXISTS idx_snooze_logs_date 
      ON snooze_logs(date);
    `);

    // Create goals table
    expoDb.execSync(`
      CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        target INTEGER NOT NULL,
        current_value INTEGER NOT NULL DEFAULT 0,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        is_completed INTEGER NOT NULL DEFAULT 0,
        completed_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    // Create indexes for goals
    expoDb.execSync(`
      CREATE INDEX IF NOT EXISTS idx_goals_is_completed 
      ON goals(is_completed);
      
      CREATE INDEX IF NOT EXISTS idx_goals_end_date 
      ON goals(end_date);
    `);

    // Create routine_items table
    expoDb.execSync(`
      CREATE TABLE IF NOT EXISTS routine_items (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        icon TEXT NOT NULL,
        "order" INTEGER NOT NULL,
        is_enabled INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    // Create index for routine_items
    expoDb.execSync(`
      CREATE INDEX IF NOT EXISTS idx_routine_items_order 
      ON routine_items("order");
    `);

    // Create routine_completions table
    expoDb.execSync(`
      CREATE TABLE IF NOT EXISTS routine_completions (
        id TEXT PRIMARY KEY,
        routine_item_id TEXT NOT NULL,
        completed_at TEXT NOT NULL,
        date TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

    // Create indexes for routine_completions
    expoDb.execSync(`
      CREATE INDEX IF NOT EXISTS idx_routine_completions_item_id 
      ON routine_completions(routine_item_id);
      
      CREATE INDEX IF NOT EXISTS idx_routine_completions_date 
      ON routine_completions(date);
    `);

    console.log('[Database] Tables initialized successfully');
  } catch (error) {
    console.error('[Database] Failed to initialize tables:', error);
    throw error;
  }
}

// Initialize database on import
initializeDatabase();
