/**
 * Use Achievement Check Hook
 * Checks and unlocks achievements after alarm completion
 */

import { useState } from 'react';

import { ACHIEVEMENT_REGISTRY } from '../utils/achievement-registry';

import * as achievementService from '@/db/functions/achievements';
import { useSubscriptionStore } from '@/stores/use-subscription-store';

export function useAchievementCheck() {
  const [newUnlocks, setNewUnlocks] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const { isPro } = useSubscriptionStore();

  /**
   * Check all achievements and unlock/update progress
   * Returns array of newly unlocked achievement IDs
   */
  const checkAllAchievements = async (): Promise<string[]> => {
    try {
      setIsChecking(true);
      const currentState = await achievementService.getAllAchievementsWithStatus();
      const unlocked: string[] = [];

      for (const state of currentState) {
        // Skip already unlocked
        if (state.isUnlocked) continue;

        const definition = ACHIEVEMENT_REGISTRY.find((a) => a.id === state.achievement.id);
        if (!definition) continue;

        // Skip premium achievements if user is not Pro
        if (definition.isPremium && !isPro) {
          // Still update progress for locked premium achievements
          if (definition.progressFn) {
            const progress = await definition.progressFn(state.achievement.target);
            if (progress > state.progress) {
              await achievementService.updateAchievementProgress(state.achievement.id, progress);
              console.log(
                `[useAchievementCheck] Progress (Premium): ${state.achievement.id} (${progress}/${state.achievement.target})`
              );
            }
          }
          continue;
        }

        // Check if condition is now met
        const isMet = await definition.conditionFn(state.achievement.target);

        if (isMet) {
          // Unlock achievement
          await achievementService.unlockAchievement(state.achievement.id);
          unlocked.push(state.achievement.id);
          console.log(`[useAchievementCheck] Unlocked: ${state.achievement.id}`);
        } else if (definition.progressFn) {
          // Update progress for partially completed achievements
          const progress = await definition.progressFn(state.achievement.target);
          if (progress > state.progress) {
            await achievementService.updateAchievementProgress(state.achievement.id, progress);
            console.log(
              `[useAchievementCheck] Progress: ${state.achievement.id} (${progress}/${state.achievement.target})`
            );
          }
        }
      }

      setNewUnlocks(unlocked);
      return unlocked;
    } catch (error) {
      console.error('[useAchievementCheck] Error:', error);
      return [];
    } finally {
      setIsChecking(false);
    }
  };

  /**
   * Clear new unlocks
   */
  const clearNewUnlocks = () => {
    setNewUnlocks([]);
  };

  return {
    checkAllAchievements,
    newUnlocks,
    isChecking,
    clearNewUnlocks,
  };
}
