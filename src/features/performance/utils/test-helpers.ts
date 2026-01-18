/**
 * Performance Summary Testing Helper
 *
 * This file provides utilities to test the Performance Summary screen
 * with mock data during development.
 */

import dayjs from 'dayjs';

import { usePerformanceStore } from '@/stores/use-performance-store';

/**
 * Generates random test data for performance tracking
 */
export function generateTestPerformanceData() {
  const { recordAlarmCompletion } = usePerformanceStore.getState();

  // Generate 14 days of test data
  const today = dayjs();
  const challengeTypes = ['Math Challenge', 'Memory Match', 'Logic Puzzle'];

  for (let i = 0; i < 14; i++) {
    const date = today.subtract(i, 'day');

    // Skip some days randomly to test streak breaks
    if (Math.random() > 0.85) continue;

    recordAlarmCompletion({
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
export function clearPerformanceData() {
  const { resetPerformance } = usePerformanceStore.getState();
  resetPerformance();
  console.log('🗑️ Performance data cleared!');
}

/**
 * Prints current performance stats to console
 */
export function printPerformanceStats() {
  const { getCurrentStreak, getAverageCognitiveScore, getWeeklyStats, completionHistory } =
    usePerformanceStore.getState();

  console.log('📊 Current Performance Stats:');
  console.log('  Streak:', getCurrentStreak());
  console.log('  Avg Score:', getAverageCognitiveScore());
  console.log('  Weekly Stats:', getWeeklyStats());
  console.log('  Total Completions:', completionHistory.length);
}

// Make functions available globally in dev mode for easy testing
if (__DEV__) {
  (global as { testPerformance?: unknown }).testPerformance = {
    generate: generateTestPerformanceData,
    clear: clearPerformanceData,
    stats: printPerformanceStats,
  };

  console.log('🧪 Performance testing helpers available:');
  console.log('  testPerformance.generate() - Generate test data');
  console.log('  testPerformance.clear() - Clear all data');
  console.log('  testPerformance.stats() - Print current stats');
}
