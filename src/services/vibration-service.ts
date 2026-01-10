import * as Haptics from 'expo-haptics';

import { Platform } from 'react-native';

import { VibrationPattern } from '@/types/settings-enums';

// ============================================================================
// Types
// ============================================================================

interface VibrationConfig {
  intensity: Haptics.ImpactFeedbackStyle;
  interval: number; // milliseconds between vibrations
}

interface ProgressiveState {
  currentIntensity: Haptics.ImpactFeedbackStyle;
  currentInterval: number;
  elapsedTime: number;
}

// ============================================================================
// Constants
// ============================================================================

const PATTERN_CONFIGS: Record<Exclude<VibrationPattern, VibrationPattern.PROGRESSIVE>, VibrationConfig> = {
  [VibrationPattern.GENTLE]: {
    intensity: Haptics.ImpactFeedbackStyle.Light,
    interval: 3000,
  },
  [VibrationPattern.MODERATE]: {
    intensity: Haptics.ImpactFeedbackStyle.Medium,
    interval: 2000,
  },
  [VibrationPattern.INTENSE]: {
    intensity: Haptics.ImpactFeedbackStyle.Heavy,
    interval: 1000,
  },
};

// Progressive pattern escalation thresholds (in milliseconds)
const PROGRESSIVE_STAGES = [
  { threshold: 0, intensity: Haptics.ImpactFeedbackStyle.Light, interval: 2500 },
  { threshold: 10000, intensity: Haptics.ImpactFeedbackStyle.Medium, interval: 1500 },
  { threshold: 20000, intensity: Haptics.ImpactFeedbackStyle.Heavy, interval: 800 },
];

// ============================================================================
// Vibration Service
// ============================================================================

class VibrationServiceClass {
  private isRunning = false;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private progressiveState: ProgressiveState | null = null;
  private startTime = 0;

  /**
   * Start vibration loop with the specified pattern
   */
  start(pattern: VibrationPattern): void {
    if (Platform.OS === 'web') return;
    if (this.isRunning) this.stop();

    this.isRunning = true;
    this.startTime = Date.now();

    if (pattern === VibrationPattern.PROGRESSIVE) {
      this.progressiveState = {
        currentIntensity: PROGRESSIVE_STAGES[0].intensity,
        currentInterval: PROGRESSIVE_STAGES[0].interval,
        elapsedTime: 0,
      };
      this.runProgressiveLoop();
    } else {
      this.runFixedLoop(pattern);
    }
  }

  /**
   * Stop all vibrations
   */
  stop(): void {
    this.isRunning = false;
    this.progressiveState = null;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * Test a pattern (single vibration preview)
   */
  async test(pattern: VibrationPattern): Promise<void> {
    if (Platform.OS === 'web') return;

    if (pattern === VibrationPattern.PROGRESSIVE) {
      // For progressive, show the escalation sequence
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await this.delay(300);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await this.delay(300);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else {
      const config = PATTERN_CONFIGS[pattern];
      await Haptics.impactAsync(config.intensity);
    }
  }

  /**
   * Run fixed pattern loop (gentle, moderate, intense)
   */
  private async runFixedLoop(pattern: Exclude<VibrationPattern, VibrationPattern.PROGRESSIVE>): Promise<void> {
    if (!this.isRunning) return;

    const config = PATTERN_CONFIGS[pattern];

    try {
      await Haptics.impactAsync(config.intensity);
    } catch (error) {
      console.error('[VibrationService] Error triggering haptic:', error);
    }

    this.timeoutId = setTimeout(() => {
      this.runFixedLoop(pattern);
    }, config.interval);
  }

  /**
   * Run progressive pattern loop (escalates over time)
   */
  private async runProgressiveLoop(): Promise<void> {
    if (!this.isRunning || !this.progressiveState) return;

    const elapsedTime = Date.now() - this.startTime;

    // Find the appropriate stage based on elapsed time
    let currentStage = PROGRESSIVE_STAGES[0];
    for (const stage of PROGRESSIVE_STAGES) {
      if (elapsedTime >= stage.threshold) {
        currentStage = stage;
      }
    }

    // Update state
    this.progressiveState.currentIntensity = currentStage.intensity;
    this.progressiveState.currentInterval = currentStage.interval;
    this.progressiveState.elapsedTime = elapsedTime;

    try {
      await Haptics.impactAsync(currentStage.intensity);
    } catch (error) {
      console.error('[VibrationService] Error triggering haptic:', error);
    }

    this.timeoutId = setTimeout(() => {
      this.runProgressiveLoop();
    }, currentStage.interval);
  }

  /**
   * Helper to create a delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const VibrationService = new VibrationServiceClass();
