/**
 * Achievement Unlock Modal
 * Celebratory modal displayed when achievement is unlocked
 */

import React from 'react';

import { useTranslation } from 'react-i18next';
import Animated, { BounceIn } from 'react-native-reanimated';

import { Modal, Text, TouchableOpacity, View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';

interface AchievementUnlockModalProps {
  visible: boolean;
  achievementId: string | null;
  tier: string;
  icon: string;
  onClose: () => void;
}

export function AchievementUnlockModal({
  visible,
  achievementId,
  tier,
  icon,
  onClose,
}: AchievementUnlockModalProps) {
  const { t } = useTranslation();

  if (!achievementId) return null;

  const achievementName = t(`achievements.${achievementId}.name`);
  const achievementDesc = t(`achievements.${achievementId}.description`);

  // Tier colors
  const getTierColor = () => {
    switch (tier) {
      case 'bronze':
        return '#CD7F32';
      case 'silver':
        return '#C0C0C0';
      case 'gold':
        return '#FFD700';
      case 'platinum':
        return '#3B82F6';
      default:
        return '#64748B';
    }
  };

  const tierColor = getTierColor();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/80 px-8">
        <Animated.View
          entering={BounceIn.duration(600)}
          className="w-full max-w-sm items-center rounded-3xl bg-white p-8 dark:bg-slate-900"
        >
          {/* Icon */}
          <View
            className="mb-4 h-20 w-20 items-center justify-center rounded-full"
            style={{ backgroundColor: `${tierColor}20` }}
          >
            <MaterialSymbol name={icon} size={48} color={tierColor} />
          </View>

          {/* Title */}
          <Text className="mb-2 text-center text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t('achievements.unlock.title')}
          </Text>

          {/* Achievement Name */}
          <Text className="mb-2 text-center text-xl font-semibold text-slate-900 dark:text-slate-100">
            {achievementName}
          </Text>

          {/* Description */}
          <Text className="mb-6 text-center text-sm text-slate-600 dark:text-slate-400">
            {achievementDesc}
          </Text>

          {/* Tier Badge */}
          <View
            className="mb-6 rounded-full px-4 py-2"
            style={{ backgroundColor: `${tierColor}20` }}
          >
            <Text
              className="text-xs font-bold uppercase tracking-wide"
              style={{ color: tierColor }}
            >
              {t(`achievements.tiers.${tier}`)}
            </Text>
          </View>

          {/* Close Button */}
          <TouchableOpacity
            accessibilityRole="button"
            onPress={onClose}
            className="rounded-full bg-blue-500 px-8 py-3 active:scale-95 dark:bg-blue-600"
          >
            <Text className="text-center font-bold text-white">
              {t('achievements.unlock.button')}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}
