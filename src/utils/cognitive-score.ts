import type { DifficultyLevel } from '@/types/alarm-enums';

/**
 * Cognitive Score Calculation
 *
 * This module calculates a performance score (0-100) based on how well
 * the user performs in cognitive challenges when dismissing alarms.
 *
 * The score considers multiple factors:
 * - Challenge difficulty level
 * - Number of attempts required
 * - Speed of completion
 * - Overall time taken
 *
 * @module cognitive-score
 */

/**
 * Parameters for cognitive score calculation
 */
interface ScoreCalculationParams {
  /** Number of attempts made to solve the challenge (1+) */
  attempts: number;
  /** Time spent solving the challenge in milliseconds */
  timeSpent: number;
  /** Difficulty level of the challenge */
  difficulty: DifficultyLevel;
  /** Maximum attempts allowed (default: 3) */
  maxAttempts?: number;
}

/**
 * Calculate cognitive score based on challenge performance
 *
 * The algorithm uses a base score determined by difficulty level,
 * then applies bonuses and penalties based on performance:
 *
 * **Base Scores:**
 * - Easy: 60 points
 * - Medium: 75 points
 * - Hard: 90 points
 * - Adaptive: 75 points (starts at medium)
 *
 * **Penalties:**
 * - Additional attempts: -10 points each (after first attempt)
 * - Slow completion (>2 min): -10 points
 *
 * **Bonuses:**
 * - Very fast (<10s): +15 points
 * - Fast (<20s): +10 points
 * - Quick (<30s): +5 points
 *
 * The final score is clamped to 0-100 range.
 *
 * @example
 * ```typescript
 * // Perfect performance on medium challenge completed in 15 seconds
 * const score = calculateCognitiveScore({
 *   attempts: 1,
 *   timeSpent: 15000,
 *   difficulty: 'medium'
 * });
 * // Returns: 85 (75 base + 10 speed bonus)
 * ```
 *
 * @param params - Score calculation parameters
 * @returns Score from 0-100
 */
export function calculateCognitiveScore({
  attempts,
  timeSpent,
  difficulty,
  maxAttempts: _maxAttempts = 3,
}: ScoreCalculationParams): number {
  // Base score by difficulty
  const baseScores: Record<DifficultyLevel, number> = {
    easy: 60,
    medium: 75,
    hard: 90,
    adaptive: 75, // Start at medium for adaptive
  };

  const baseScore = baseScores[difficulty];

  // Penalty for attempts (more attempts = lower score)
  // First attempt: no penalty
  // Each additional attempt: -10 points
  const attemptPenalty = Math.max(0, (attempts - 1) * 10);

  // Speed bonus (completing quickly gives bonus points)
  // Under 10s: +15 points
  // Under 20s: +10 points
  // Under 30s: +5 points
  let speedBonus = 0;
  if (timeSpent < 10000) {
    speedBonus = 15;
  } else if (timeSpent < 20000) {
    speedBonus = 10;
  } else if (timeSpent < 30000) {
    speedBonus = 5;
  }

  // Penalty for taking too long (over 2 minutes)
  const slowPenalty = timeSpent > 120000 ? 10 : 0;

  // Calculate final score
  let finalScore = baseScore - attemptPenalty + speedBonus - slowPenalty;

  // Ensure score stays within 0-100 range
  finalScore = Math.max(0, Math.min(100, finalScore));

  return Math.round(finalScore);
}

/**
 * Performance feedback levels and messages
 */
export interface PerformanceFeedback {
  /** Performance level category */
  level: 'excellent' | 'good' | 'average' | 'needs-improvement';
  /** Feedback message for the user */
  message: string;
}

/**
 * Get performance feedback based on cognitive score
 *
 * Provides motivational feedback messages based on the achieved score.
 *
 * **Score Ranges:**
 * - 90-100: Excellent (Peak cognitive performance)
 * - 75-89: Good (Strong mental clarity)
 * - 60-74: Average (Room for improvement)
 * - 0-59: Needs improvement (Practice makes perfect)
 *
 * @example
 * ```typescript
 * const feedback = getPerformanceFeedback(85);
 * // Returns: { level: 'good', message: 'Good job! Strong mental clarity.' }
 * ```
 *
 * @param score - Cognitive score (0-100)
 * @returns Performance feedback object with level and message
 */
export function getPerformanceFeedback(score: number): PerformanceFeedback {
  if (score >= 90) {
    return {
      level: 'excellent',
      message: 'Excellent! Peak cognitive performance.',
    };
  } else if (score >= 75) {
    return {
      level: 'good',
      message: 'Good job! Strong mental clarity.',
    };
  } else if (score >= 60) {
    return {
      level: 'average',
      message: 'Not bad! Room for improvement.',
    };
  } else {
    return {
      level: 'needs-improvement',
      message: 'Take your time. Practice makes perfect.',
    };
  }
}
