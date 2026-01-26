/**
 * useStreakFreeze Hook
 * Manages streak freeze tokens and activation
 */

import { useCallback, useEffect, useState } from 'react';

import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import { Alert } from 'react-native';

import * as streakFreezeService from '@/db/functions/streak-freeze';
import { useSubscriptionStore } from '@/stores/use-subscription-store';

export function useStreakFreeze() {
  const { t } = useTranslation();
  const { isPro } = useSubscriptionStore();
  const [availableTokens, setAvailableTokens] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load available tokens
  const loadTokens = useCallback(async () => {
    try {
      setIsLoading(true);
      const tokens = await streakFreezeService.getAvailableStreakFreezeTokens(isPro);
      setAvailableTokens(tokens);
    } catch (error) {
      console.error('[useStreakFreeze] Failed to load tokens:', error);
      setAvailableTokens(0);
    } finally {
      setIsLoading(false);
    }
  }, [isPro]);

  // Load tokens on mount and when Pro status changes
  useEffect(() => {
    void loadTokens();
  }, [loadTokens]);

  /**
   * Use a freeze token for tomorrow
   */
  const useFreezeToken = useCallback(async () => {
    const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');

    const result = await streakFreezeService.useStreakFreezeToken(tomorrow, isPro);

    if (result.success) {
      Alert.alert(t('streakFreeze.success.title'), t('streakFreeze.success.message'));
      await loadTokens(); // Reload tokens
    } else {
      Alert.alert(t('common.error'), result.message);
    }

    return result.success;
  }, [isPro, loadTokens, t]);

  /**
   * Check if a specific date is protected by freeze
   */
  const isDateProtected = useCallback(async (date: string) => {
    return await streakFreezeService.isDateProtectedByFreeze(date);
  }, []);

  /**
   * Get freeze history
   */
  const getHistory = useCallback(async () => {
    return await streakFreezeService.getStreakFreezeHistory();
  }, []);

  return {
    availableTokens,
    isLoading,
    useFreezeToken,
    isDateProtected,
    getHistory,
    refreshTokens: loadTokens,
  };
}
