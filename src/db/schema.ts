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
