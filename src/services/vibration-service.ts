import * as Haptics from 'expo-haptics';
import type { HapticImpactType } from 'react-native-custom-haptics';

import { Platform } from 'react-native';

import {
  HAPTIC_PATTERNS,
  HAPTIC_TEST_PATTERNS,
  type HapticPattern,
} from '@/constants/haptic-patterns';
import type { VibrationPattern } from '@/types/settings-enums';

// ============================================================================
// Types
// ============================================================================

type ImpactStyle = 'light' | 'medium' | 'heavy' | 'select' | 'vibrate';

// ============================================================================
// Vibration Service
// ============================================================================

class VibrationServiceClass {
  private isRunning = false;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private currentPatternIndex = 0;
  private currentPattern: HapticPattern = [];

  /**
   * Start vibration loop with the specified pattern
   */
  start(pattern: VibrationPattern): void {
    if (Platform.OS === 'web') return;
    if (this.isRunning) this.stop();

    this.isRunning = true;
    this.currentPattern = HAPTIC_PATTERNS[pattern];
    this.currentPatternIndex = 0;
    this.runPatternLoop();
  }

  /**
   * Stop all vibrations
   */
  stop(): void {
    this.isRunning = false;
    this.currentPatternIndex = 0;
    this.currentPattern = [];
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * Test a pattern (single pattern preview)
   */
  async test(pattern: VibrationPattern): Promise<void> {
    if (Platform.OS === 'web') return;

    const testPattern = HAPTIC_TEST_PATTERNS[pattern];
    await this.playPatternOnce(testPattern);
  }

  /**
   * Trigger success feedback vibration
   * Used when user correctly answers a challenge
   */
  async success(): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('[VibrationService] Error triggering success haptic:', error);
    }
  }

  /**
   * Play a pattern once (for testing)
   */
  private async playPatternOnce(pattern: HapticPattern): Promise<void> {
    for (let i = 0; i < pattern.length; i++) {
      const element = pattern[i];

      if (typeof element === 'number') {
        // It's a pause duration
        await this.delay(element);
      } else {
        // It's an impact type
        await this.triggerImpact(element);
      }
    }
  }

  /**
   * Run the pattern in a continuous loop
   */
  private async runPatternLoop(): Promise<void> {
    if (!this.isRunning || this.currentPattern.length === 0) return;

    const element = this.currentPattern[this.currentPatternIndex];

    if (typeof element === 'number') {
      // It's a pause duration - schedule next step
      this.timeoutId = setTimeout(() => {
        this.currentPatternIndex = (this.currentPatternIndex + 1) % this.currentPattern.length;
        this.runPatternLoop();
      }, element);
    } else {
      // It's an impact type - trigger and move to next
      try {
        await this.triggerImpact(element);
      } catch (error) {
        console.error('[VibrationService] Error triggering haptic:', error);
      }

      this.currentPatternIndex = (this.currentPatternIndex + 1) % this.currentPattern.length;

      // Small delay before next action
      this.timeoutId = setTimeout(() => {
        this.runPatternLoop();
      }, 50);
    }
  }

  /**
   * Trigger a haptic impact based on type
   */
  private async triggerImpact(type: HapticImpactType): Promise<void> {
    if (typeof type === 'number') {
      // For number types (vibration duration), use heavy impact
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      return;
    }

    const impactMap: Record<ImpactStyle, Haptics.ImpactFeedbackStyle | 'select' | 'vibrate'> = {
      light: Haptics.ImpactFeedbackStyle.Light,
      medium: Haptics.ImpactFeedbackStyle.Medium,
      heavy: Haptics.ImpactFeedbackStyle.Heavy,
      select: 'select',
      vibrate: 'vibrate',
    };

    const impact = impactMap[type as ImpactStyle];

    if (impact === 'select') {
      await Haptics.selectionAsync();
    } else if (impact === 'vibrate') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else if (impact) {
      await Haptics.impactAsync(impact);
    }
  }

  /**
   * Helper to create a delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const VibrationService = new VibrationServiceClass();
