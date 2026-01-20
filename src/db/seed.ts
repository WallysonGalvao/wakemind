/**
 * Database Seed for Development
 * Run this inside the app to populate with sample data
 */

import dayjs from 'dayjs';
import { nanoid } from 'nanoid';

import { alarmCompletions, alarms } from './schema';

import { db } from './index';

// ============================================================================
// Seed Data Configuration
// ============================================================================

const SAMPLE_ALARMS = [
  {
    time: '06:00',
    period: 'AM' as const,
    challenge: 'challenge.math', // i18n key
    challengeType: 'math' as const,
    challengeIcon: 'calculate',
    schedule: 'Daily', // Literal value for logic
    difficulty: 'medium' as const,
  },
  {
    time: '07:30',
    period: 'AM' as const,
    challenge: 'challenge.memory', // i18n key
    challengeType: 'memory' as const,
    challengeIcon: 'psychology',
    schedule: 'Mon, Wed, Fri', // Literal value for logic
    difficulty: 'hard' as const,
  },
  {
    time: '05:30',
    period: 'AM' as const,
    challenge: 'newAlarm.challenges.logic.title', // i18n key
    challengeType: 'logic' as const,
    challengeIcon: 'lightbulb',
    schedule: 'Weekdays', // Literal value for logic
    difficulty: 'easy' as const,
  },
];

const DAYS_TO_GENERATE = 30;

// ============================================================================
// Helper Functions
// ============================================================================

function generateTimeVariance(): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  const variance = Math.round(5 + z * 10);
  return Math.max(-15, Math.min(30, variance));
}

function generateCognitiveScore(variance: number): number {
  const baseScore = variance <= 0 ? 85 : 80 - variance * 0.5;
  const randomness = (Math.random() - 0.5) * 20;
  return Math.round(Math.max(60, Math.min(100, baseScore + randomness)));
}

function generateReactionTime(variance: number): number {
  const baseTime = variance <= 0 ? 20 : 25 + variance * 0.3;
  const randomness = (Math.random() - 0.5) * 15;
  return Math.round(Math.max(10, Math.min(60, baseTime + randomness)));
}

function shouldGenerateCompletion(date: dayjs.Dayjs, schedule: string): boolean {
  const dayOfWeek = date.day();
  const dayName = date.format('ddd');

  if (schedule === 'Daily') return true;
  if (schedule === 'Weekdays' && dayOfWeek >= 1 && dayOfWeek <= 5) return true;
  if (schedule.includes(dayName)) return true;

  return Math.random() > 0.1;
}

// ============================================================================
// Seed Functions
// ============================================================================

async function clearDatabase() {
  console.log('🗑️  Clearing existing data...');
  await db.delete(alarmCompletions);
  await db.delete(alarms);
  console.log('✅ Database cleared');
}

async function seedAlarms() {
  console.log('⏰ Seeding alarms...');

  const now = new Date().toISOString();
  const alarmRecords = SAMPLE_ALARMS.map((alarm) => ({
    id: nanoid(),
    time: alarm.time,
    period: alarm.period,
    challenge: alarm.challenge,
    challengeType: alarm.challengeType,
    challengeIcon: alarm.challengeIcon,
    schedule: alarm.schedule,
    isEnabled: true,
    difficulty: alarm.difficulty,
    protocols: null,
    createdAt: now,
    updatedAt: now,
  }));

  await db.insert(alarms).values(alarmRecords);
  console.log(`✅ Created ${alarmRecords.length} alarms`);

  return alarmRecords;
}

async function seedAlarmCompletions(alarmRecords: any[]) {
  console.log('📊 Seeding alarm completions...');

  const completions: any[] = [];
  const today = dayjs();

  for (let i = 0; i < DAYS_TO_GENERATE; i++) {
    const date = today.subtract(i, 'day');

    for (const alarm of alarmRecords) {
      // For today, always generate at least one completion for testing
      const shouldGenerate = i === 0 ? true : shouldGenerateCompletion(date, alarm.schedule);

      if (!shouldGenerate) {
        continue;
      }

      const variance = generateTimeVariance();
      const [hours, minutes] = alarm.time.split(':').map(Number);

      // Target time: the scheduled alarm time for this day
      const targetTime = date.hour(hours).minute(minutes).second(0).millisecond(0);

      // Actual time: when user actually woke up (with variance)
      const actualTime = targetTime.add(variance, 'minute');

      completions.push({
        id: nanoid(),
        alarmId: alarm.id,
        targetTime: targetTime.toISOString(),
        actualTime: actualTime.toISOString(),
        cognitiveScore: generateCognitiveScore(variance),
        reactionTime: generateReactionTime(variance),
        challengeType: alarm.challengeType,
        date: date.format('YYYY-MM-DD'),
      });
    }
  }

  const batchSize = 50;
  for (let i = 0; i < completions.length; i += batchSize) {
    const batch = completions.slice(i, i + batchSize);
    await db.insert(alarmCompletions).values(batch);
  }

  console.log(`✅ Created ${completions.length} alarm completions`);

  // Log sample data for verification
  if (completions.length > 0) {
    console.log('\n📋 Sample completion:');
    const sample = completions[0];
    console.log(`   Date: ${sample.date}`);
    console.log(`   Target: ${sample.targetTime}`);
    console.log(`   Actual: ${sample.actualTime}`);
    console.log(`   Score: ${sample.cognitiveScore}`);
    console.log(`   Reaction: ${sample.reactionTime}s`);
  }
}

async function printSummary() {
  console.log('\n📈 Database Summary:');

  const allAlarms = await db.select().from(alarms);
  const allCompletions = await db.select().from(alarmCompletions);

  console.log(`   Alarms: ${allAlarms.length}`);
  console.log(`   Completions: ${allCompletions.length}`);

  if (allCompletions.length > 0) {
    const dates = allCompletions.map((c) => c.date).sort();
    console.log(`   Date Range: ${dates[0]} to ${dates[dates.length - 1]}`);

    const avgScore =
      allCompletions.reduce((sum, c) => sum + c.cognitiveScore, 0) / allCompletions.length;
    console.log(`   Avg Cognitive Score: ${avgScore.toFixed(1)}/100`);
  }
}

// ============================================================================
// Main Seed Function
// ============================================================================

export async function seedDatabase() {
  console.log('🌱 Starting database seed...\n');

  try {
    await clearDatabase();
    const alarmRecords = await seedAlarms();
    await seedAlarmCompletions(alarmRecords);
    await printSummary();

    console.log('\n✨ Seed completed successfully!');
    return { success: true };
  } catch (error) {
    console.error('❌ Seed failed:', error);
    return { success: false, error };
  }
}
