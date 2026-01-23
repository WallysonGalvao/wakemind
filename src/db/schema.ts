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

// ============================================================================
// Snooze Logs Table (For Snooze Analytics Widget)
// ============================================================================

export const snoozeLogs = sqliteTable('snooze_logs', {
  id: text('id').primaryKey(),
  alarmId: text('alarm_id').notNull(),
  triggeredAt: text('triggered_at').notNull(), // ISO timestamp when alarm triggered
  snoozedAt: text('snoozed_at').notNull(), // ISO timestamp when snoozed
  snoozeCount: integer('snooze_count').notNull(), // Number of snoozes for this alarm instance
  finalAction: text('final_action').notNull(), // "dismissed" | "snoozed" | "missed"
  date: text('date').notNull(), // YYYY-MM-DD for grouping
  createdAt: text('created_at').notNull(),
});

export type SnoozeLog = typeof snoozeLogs.$inferSelect;
export type NewSnoozeLog = typeof snoozeLogs.$inferInsert;

// ============================================================================
// Goals Table (For Goal Progress Widget)
// ============================================================================

export const goals = sqliteTable('goals', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // "streak" | "execution_score" | "latency_reduction"
  target: integer('target').notNull(), // Target value (e.g., 30 days for streak)
  currentValue: integer('current_value').notNull().default(0),
  startDate: text('start_date').notNull(), // YYYY-MM-DD
  endDate: text('end_date'), // YYYY-MM-DD (optional deadline)
  isCompleted: integer('is_completed', { mode: 'boolean' }).notNull().default(false),
  completedAt: text('completed_at'), // ISO timestamp
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export type Goal = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;

// ============================================================================
// Morning Routine Checklist Table
// ============================================================================

export const routineItems = sqliteTable('routine_items', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  icon: text('icon').notNull(), // Material symbol name
  order: integer('order').notNull(), // Display order
  isEnabled: integer('is_enabled', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export type RoutineItem = typeof routineItems.$inferSelect;
export type NewRoutineItem = typeof routineItems.$inferInsert;

export const routineCompletions = sqliteTable('routine_completions', {
  id: text('id').primaryKey(),
  routineItemId: text('routine_item_id').notNull(), // FK to routine_items.id
  completedAt: text('completed_at').notNull(), // ISO timestamp
  date: text('date').notNull(), // YYYY-MM-DD for grouping
  createdAt: text('created_at').notNull(),
});

export type RoutineCompletion = typeof routineCompletions.$inferSelect;
export type NewRoutineCompletion = typeof routineCompletions.$inferInsert;
