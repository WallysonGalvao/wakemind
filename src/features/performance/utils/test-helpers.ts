/**
 * Performance Summary Testing Helper
 *
 * This file provides utilities to test the Performance Summary screen
 * with mock data during development.
 */

import dayjs from 'dayjs';

import * as performanceService from '@/db/functions/performance';

/**
 * Generates random test data for performance tracking
 */
export async function generateTestPerformanceData() {
  // Generate 14 days of test data
  const today = dayjs();
  const challengeTypes = ['Math Challenge', 'Memory Match', 'Logic Puzzle'];

  for (let i = 0; i < 14; i++) {
    const date = today.subtract(i, 'day');

    // Skip some days randomly to test streak breaks
    if (Math.random() > 0.85) continue;

    await performanceService.recordAlarmCompletion({
      targetTime: '06:00',
      actualTime: date.toISOString(),
      cognitiveScore: Math.floor(70 + Math.random() * 30), // 70-100
      reactionTime: Math.floor(200 + Math.random() * 100), // 200-300ms
      challengeType: challengeTypes[Math.floor(Math.random() * challengeTypes.length)],
    });
  }

  console.log('✅ Test performance data generated successfully!');
}

/**
 * Clears all performance data
 */
export async function clearPerformanceData() {
  await performanceService.resetPerformance();
  console.log('🗑️ Performance data cleared!');
}

/**
 * Prints current performance stats to console
 */
export async function printPerformanceStats() {
  const [currentStreak, averageCognitiveScore, weeklyStats, totalCompletions] = await Promise.all([
    performanceService.getCurrentStreak(),
    performanceService.getAverageCognitiveScore(),
    performanceService.getWeeklyStats(),
    performanceService.getTotalAlarmsCompleted(),
  ]);

  console.log('📊 Current Performance Stats:');
  console.log('  Streak:', currentStreak);
  console.log('  Avg Score:', averageCognitiveScore);
  console.log('  Weekly Stats:', weeklyStats);
  console.log('  Total Completions:', totalCompletions);
}

// Make functions available globally in dev mode for easy testing
if (__DEV__) {
  (global as { testPerformance?: unknown }).testPerformance = {
    generate: generateTestPerformanceData,
    clear: clearPerformanceData,
    stats: printPerformanceStats,
  };

  console.log('🧪 Performance testing helpers available:');
  console.log('  await testPerformance.generate() - Generate test data');
  console.log('  await testPerformance.clear() - Clear all data');
  console.log('  await testPerformance.stats() - Print current stats');
}
