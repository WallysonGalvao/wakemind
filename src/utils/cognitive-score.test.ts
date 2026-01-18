import { DifficultyLevel } from '@/types/alarm-enums';
import { calculateCognitiveScore, getPerformanceFeedback } from '@/utils/cognitive-score';

describe('calculateCognitiveScore', () => {
  describe('Base scores by difficulty', () => {
    it('should return base score of 60 for easy difficulty with perfect performance', () => {
      const score = calculateCognitiveScore({
        attempts: 1,
        timeSpent: 15000, // 15 seconds
        difficulty: DifficultyLevel.EASY,
      });
      expect(score).toBe(70); // 60 base + 10 speed bonus
    });

    it('should return base score of 75 for medium difficulty with perfect performance', () => {
      const score = calculateCognitiveScore({
        attempts: 1,
        timeSpent: 15000,
        difficulty: DifficultyLevel.MEDIUM,
      });
      expect(score).toBe(85); // 75 base + 10 speed bonus
    });

    it('should return base score of 90 for hard difficulty with perfect performance', () => {
      const score = calculateCognitiveScore({
        attempts: 1,
        timeSpent: 15000,
        difficulty: DifficultyLevel.HARD,
      });
      expect(score).toBe(100); // 90 base + 10 speed bonus (capped at 100)
    });
  });

  describe('Attempt penalties', () => {
    it('should deduct 10 points for each additional attempt', () => {
      const score1 = calculateCognitiveScore({
        attempts: 1,
        timeSpent: 30000,
        difficulty: DifficultyLevel.MEDIUM,
      });

      const score2 = calculateCognitiveScore({
        attempts: 2,
        timeSpent: 30000,
        difficulty: DifficultyLevel.MEDIUM,
      });

      const score3 = calculateCognitiveScore({
        attempts: 3,
        timeSpent: 30000,
        difficulty: DifficultyLevel.MEDIUM,
      });

      expect(score2).toBe(score1 - 10);
      expect(score3).toBe(score1 - 20);
    });
  });

  describe('Speed bonuses', () => {
    it('should give +15 points for completing under 10 seconds', () => {
      const score = calculateCognitiveScore({
        attempts: 1,
        timeSpent: 8000,
        difficulty: DifficultyLevel.MEDIUM,
      });
      expect(score).toBe(90); // 75 base + 15 speed bonus
    });

    it('should give +10 points for completing under 20 seconds', () => {
      const score = calculateCognitiveScore({
        attempts: 1,
        timeSpent: 15000,
        difficulty: DifficultyLevel.MEDIUM,
      });
      expect(score).toBe(85); // 75 base + 10 speed bonus
    });

    it('should give +5 points for completing under 30 seconds', () => {
      const score = calculateCognitiveScore({
        attempts: 1,
        timeSpent: 25000,
        difficulty: DifficultyLevel.MEDIUM,
      });
      expect(score).toBe(80); // 75 base + 5 speed bonus
    });

    it('should give no speed bonus for completing over 30 seconds', () => {
      const score = calculateCognitiveScore({
        attempts: 1,
        timeSpent: 40000,
        difficulty: DifficultyLevel.MEDIUM,
      });
      expect(score).toBe(75); // 75 base, no bonus
    });
  });

  describe('Slow penalty', () => {
    it('should deduct 10 points for taking over 2 minutes', () => {
      const score = calculateCognitiveScore({
        attempts: 1,
        timeSpent: 130000, // 2 minutes 10 seconds
        difficulty: DifficultyLevel.MEDIUM,
      });
      expect(score).toBe(65); // 75 base - 10 slow penalty
    });
  });

  describe('Combined scenarios', () => {
    it('should handle multiple attempts with slow completion', () => {
      const score = calculateCognitiveScore({
        attempts: 3,
        timeSpent: 150000, // 2.5 minutes
        difficulty: DifficultyLevel.HARD,
      });
      // 90 base - 20 (2 extra attempts) - 10 (slow) = 60
      expect(score).toBe(60);
    });

    it('should never go below 0', () => {
      const score = calculateCognitiveScore({
        attempts: 10,
        timeSpent: 300000,
        difficulty: DifficultyLevel.EASY,
      });
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it('should never exceed 100', () => {
      const score = calculateCognitiveScore({
        attempts: 1,
        timeSpent: 5000, // Very fast
        difficulty: DifficultyLevel.HARD,
      });
      expect(score).toBeLessThanOrEqual(100);
      expect(score).toBe(100);
    });
  });
});

describe('getPerformanceFeedback', () => {
  it('should return excellent for score >= 90', () => {
    const feedback = getPerformanceFeedback(95);
    expect(feedback.level).toBe('excellent');
    expect(feedback.message).toBe('Excellent! Peak cognitive performance.');
  });

  it('should return good for score >= 75', () => {
    const feedback = getPerformanceFeedback(80);
    expect(feedback.level).toBe('good');
    expect(feedback.message).toBe('Good job! Strong mental clarity.');
  });

  it('should return average for score >= 60', () => {
    const feedback = getPerformanceFeedback(65);
    expect(feedback.level).toBe('average');
    expect(feedback.message).toBe('Not bad! Room for improvement.');
  });

  it('should return needs-improvement for score < 60', () => {
    const feedback = getPerformanceFeedback(45);
    expect(feedback.level).toBe('needs-improvement');
    expect(feedback.message).toBe('Take your time. Practice makes perfect.');
  });
});
