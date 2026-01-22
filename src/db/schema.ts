import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * Database schema for WakeMind
 */

// ============================================================================
// Alarms Table
// ============================================================================

export const alarms = sqliteTable('alarms', {
  id: text('id').primaryKey(),
  time: text('time').notNull(), // "05:30"
  period: text('period').notNull(), // "AM" | "PM"
  challenge: text('challenge').notNull(), // "Math Challenge" (display label)
  challengeType: text('challenge_type').notNull(), // "math" | "memory" | "logic"
  challengeIcon: text('challenge_icon').notNull(), // Material icon name
  schedule: text('schedule').notNull(), // "Daily", "Mon, Wed, Fri", etc.
  isEnabled: integer('is_enabled', { mode: 'boolean' }).notNull().default(true),
  difficulty: text('difficulty'), // "easy" | "medium" | "hard" (optional)
  protocols: text('protocols'), // JSON stringified BackupProtocol[] (optional)
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export type Alarm = typeof alarms.$inferSelect;
export type NewAlarm = typeof alarms.$inferInsert;

// ============================================================================
// Alarm Completions Table (Performance Tracking)
// ============================================================================

export const alarmCompletions = sqliteTable('alarm_completions', {
  id: text('id').primaryKey(),
  alarmId: text('alarm_id'), // FK to alarms.id (nullable for backward compatibility)
  targetTime: text('target_time').notNull(),
  actualTime: text('actual_time').notNull(),
  cognitiveScore: integer('cognitive_score').notNull(),
  reactionTime: integer('reaction_time').notNull(),
  challengeType: text('challenge_type').notNull(),
  date: text('date').notNull(),
});

export type AlarmCompletion = typeof alarmCompletions.$inferSelect;
export type NewAlarmCompletion = typeof alarmCompletions.$inferInsert;

// ============================================================================
// Achievements Table (Master Data)
// ============================================================================

export const achievements = sqliteTable('achievements', {
  id: text('id').primaryKey(),
  category: text('category').notNull(), // "progression" | "consistency" | "mastery" | "exploration" | "secret"
  tier: text('tier').notNull(), // "bronze" | "silver" | "gold" | "platinum"
  icon: text('icon').notNull(), // Material symbol name
  isSecret: integer('is_secret', { mode: 'boolean' }).notNull().default(false),
  target: integer('target').notNull(), // Target value for achievement
  createdAt: text('created_at').notNull(),
});

export type Achievement = typeof achievements.$inferSelect;
export type NewAchievement = typeof achievements.$inferInsert;

// ============================================================================
// User Achievements Table (Unlock State)
// ============================================================================

export const userAchievements = sqliteTable('user_achievements', {
  id: text('id').primaryKey(),
  achievementId: text('achievement_id').notNull(), // FK to achievements.id
  unlockedAt: text('unlocked_at'), // ISO timestamp when unlocked (null if not unlocked)
  progress: integer('progress').notNull().default(0), // Current progress towards target
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export type UserAchievement = typeof userAchievements.$inferSelect;
export type NewUserAchievement = typeof userAchievements.$inferInsert;
