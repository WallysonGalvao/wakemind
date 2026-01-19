import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * Database schema for WakeMind performance tracking
 */

export const alarmCompletions = sqliteTable('alarm_completions', {
  id: text('id').primaryKey(),
  targetTime: text('target_time').notNull(),
  actualTime: text('actual_time').notNull(),
  cognitiveScore: integer('cognitive_score').notNull(),
  reactionTime: integer('reaction_time').notNull(),
  challengeType: text('challenge_type').notNull(),
  date: text('date').notNull(),
});

export type AlarmCompletion = typeof alarmCompletions.$inferSelect;
export type NewAlarmCompletion = typeof alarmCompletions.$inferInsert;
