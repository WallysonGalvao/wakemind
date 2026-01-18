import type { DifficultyLevel } from '@/types/alarm-enums';

/**
 * Cognitive Score Calculation
 * Calculates a score (0-100) based on challenge performance
 */

interface ScoreCalculationParams {
  /** Number of attempts made to solve the challenge */
  attempts: number;
  /** Time spent solving the challenge in milliseconds */
  timeSpent: number;
  /** Difficulty level of the challenge */
  difficulty: DifficultyLevel;
  /** Maximum attempts allowed */
  maxAttempts?: number;
}

/**
 * Calculate cognitive score based on challenge performance
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
 * Get performance feedback message based on score
 */
export function getPerformanceFeedback(score: number): {
  level: 'excellent' | 'good' | 'average' | 'needs-improvement';
  message: string;
} {
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
