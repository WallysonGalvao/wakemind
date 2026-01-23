/**
 * Streak Freeze Widget
 * Shows available freeze tokens and allows activation
 */

import { useState } from 'react';

import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Text, TouchableOpacity, View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Toast, ToastDescription, ToastTitle, useToast } from '@/components/ui/toast';
import { useShadowStyle } from '@/hooks/use-shadow-style';
import { useSubscriptionStore } from '@/stores/use-subscription-store';

interface StreakFreezeWidgetProps {
  availableTokens: number;
  onUseToken: () => void;
}

export function StreakFreezeWidget({ availableTokens, onUseToken }: StreakFreezeWidgetProps) {
  const { t } = useTranslation();
  const { isPro } = useSubscriptionStore();
  const shadowStyle = useShadowStyle('sm');
  const toast = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmMode, setConfirmMode] = useState(false);

  const handlePress = async () => {
    // Navigate directly to paywall if not Pro
    if (!isPro) {
      router.push('/subscription/paywall');
      return;
    }

    if (availableTokens <= 0) {
      toast.show({
        placement: 'top',
        duration: 4000,
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="warning" variant="solid">
            <ToastTitle>{t('streakFreeze.noTokens.title')}</ToastTitle>
            <ToastDescription>{t('streakFreeze.noTokens.message')}</ToastDescription>
          </Toast>
        ),
      });
      return;
    }

    // If not in confirm mode, show confirmation toast
    if (!confirmMode) {
      setConfirmMode(true);
      toast.show({
        placement: 'top',
        duration: 6000,
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="info" variant="solid">
            <ToastTitle>{t('streakFreeze.confirm.title')}</ToastTitle>
            <ToastDescription>{t('streakFreeze.confirm.message')}</ToastDescription>
          </Toast>
        ),
      });

      // Reset confirm mode after 6 seconds
      setTimeout(() => setConfirmMode(false), 6000);
      return;
    }

    // Execute the freeze token usage
    setIsLoading(true);
    try {
      await onUseToken();
      setConfirmMode(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={handlePress}
      disabled={isLoading}
      className={`rounded-2xl border p-4 active:scale-[0.98] ${
        confirmMode && isPro
          ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-surface-dark'
          : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-surface-dark'
      }`}
      style={shadowStyle}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <View className="mb-1 flex-row items-center gap-2">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 dark:bg-blue-500/20">
              <MaterialSymbol name="ac_unit" size={24} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {t('streakFreeze.title')}
              </Text>
              {isPro ? (
                <Text className="text-xs text-slate-600 dark:text-slate-400">
                  {t('streakFreeze.tokensAvailable', { count: availableTokens })}
                </Text>
              ) : (
                <View className="flex-row items-center gap-1">
                  <MaterialSymbol name="workspace_premium" size={12} color="#3B82F6" />
                  <Text className="text-xs font-medium text-blue-500">PRO</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Token Display */}
        {isPro ? (
          <View className="flex-row gap-1">
            {Array.from({ length: 3 }).map((_, index) => (
              <View
                key={index}
                className={`h-8 w-8 items-center justify-center rounded-full ${
                  index < availableTokens
                    ? 'bg-blue-500 dark:bg-blue-600'
                    : 'bg-slate-200 dark:bg-slate-800'
                }`}
              >
                <MaterialSymbol
                  name="ac_unit"
                  size={16}
                  color={index < availableTokens ? '#FFFFFF' : '#94A3B8'}
                />
              </View>
            ))}
          </View>
        ) : (
          <MaterialSymbol name="chevron_right" size={20} color="#94A3B8" />
        )}
      </View>

      {/* Progress indicator */}
      {isPro ? (
        <View className="mt-3">
          <View className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <View
              className="h-full rounded-full bg-blue-500 dark:bg-blue-600"
              style={{ width: `${(availableTokens / 3) * 100}%` }}
            />
          </View>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}
