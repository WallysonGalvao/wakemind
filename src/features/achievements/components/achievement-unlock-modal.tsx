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
        return '#3FA9F5';
      default:
        return '#64748B';
    }
  };

  const tierColor = getTierColor();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/80 items-center justify-center px-8">
        <Animated.View entering={BounceIn.duration(600)} className="bg-white dark:bg-slate-900 p-8 rounded-3xl items-center max-w-sm w-full">
          {/* Icon */}
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: `${tierColor}20` }}
          >
            <MaterialSymbol name={icon} size={48} color={tierColor} />
          </View>

          {/* Title */}
          <Text className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center mb-2">
            {t('achievements.unlock.title')}
          </Text>

          {/* Achievement Name */}
          <Text className="text-xl font-semibold text-slate-900 dark:text-slate-100 text-center mb-2">
            {achievementName}
          </Text>

          {/* Description */}
          <Text className="text-sm text-slate-600 dark:text-slate-400 text-center mb-6">
            {achievementDesc}
          </Text>

          {/* Tier Badge */}
          <View
            className="px-4 py-2 rounded-full mb-6"
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
            className="bg-cyan-500 dark:bg-cyan-600 px-8 py-3 rounded-full active:scale-95"
          >
            <Text className="text-white font-bold text-center">
              {t('achievements.unlock.button')}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}
