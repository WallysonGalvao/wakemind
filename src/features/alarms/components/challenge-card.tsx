import React from 'react';

import { Image } from 'expo-image';

import { Pressable, View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { useCustomShadow } from '@/hooks/use-shadow-style';
import type { ChallengeType } from '@/types/alarm-enums';

const BRAND_PRIMARY_SHADOW = 'rgba(19, 91, 236, 0.12)';

interface ChallengeCardProps {
  type: ChallengeType;
  title: string;
  description: string;
  icon: string;
  imageUrl?: string;
  isSelected: boolean;
  onSelect?: () => void;
}

export function ChallengeCard({
  title,
  description,
  icon,
  imageUrl,
  isSelected,
  onSelect,
}: ChallengeCardProps) {
  const selectedShadow = useCustomShadow({
    offset: { width: 0, height: 8 },
    opacity: 1,
    radius: 30,
    elevation: 8,
    color: BRAND_PRIMARY_SHADOW,
  });

  return (
    <Pressable
      onPress={onSelect}
      className={`relative w-full flex-shrink-0 overflow-hidden rounded-xl ${
        isSelected
          ? 'border-2 border-brand-primary bg-white dark:bg-surface-dark'
          : 'border border-slate-200 bg-white dark:border-surface-highlight dark:bg-surface-dark/50'
      }`}
      style={isSelected ? selectedShadow : undefined}
      accessibilityRole="button"
    >
      {/* Selected checkmark */}
      {isSelected ? (
        <View className="absolute right-0 top-0 z-10 p-3">
          <View className="flex size-6 items-center justify-center rounded-full bg-brand-primary">
            <MaterialSymbol name="check" size={14} className="text-white" />
          </View>
        </View>
      ) : null}

      <View className="flex flex-col gap-4 p-5">
        {/* Icon */}
        <View
          className={`flex size-12 items-center justify-center rounded-lg ${
            isSelected ? 'bg-brand-primary/10' : 'bg-slate-100 dark:bg-surface-highlight'
          }`}
        >
          <MaterialSymbol
            name={icon}
            size={30}
            className={isSelected ? 'text-brand-primary' : 'text-slate-400'}
          />
        </View>

        {/* Title and description */}
        <View>
          <Text
            className={`text-lg font-bold ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-900 dark:text-slate-200'}`}
          >
            {title}
          </Text>
          <Text className="mt-1 text-sm text-slate-400">{description}</Text>
        </View>

        {/* Preview image */}
        {imageUrl ? (
          <View
            className={`mt-1 h-24 w-full overflow-hidden rounded-lg bg-cover bg-center bg-no-repeat ${
              isSelected ? 'opacity-80' : 'opacity-40 grayscale'
            }`}
          >
            <Image
              source={{ uri: imageUrl }}
              className="h-full w-full"
              // eslint-disable-next-line react-native/no-inline-styles -- expo-image requires style for dimensions
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              transition={200}
              accessibilityIgnoresInvertColors
            />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
