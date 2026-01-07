import React from 'react';

import { Image } from 'expo-image';

import { Pressable, View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';

export type ChallengeType = 'math' | 'memory' | 'logic';

interface ChallengeCardProps {
  type: ChallengeType;
  title: string;
  description: string;
  icon: string;
  imageUrl?: string;
  isSelected: boolean;
  onSelect: () => void;
}

export function ChallengeCard({
  title,
  description,
  icon,
  imageUrl,
  isSelected,
  onSelect,
}: ChallengeCardProps) {
  return (
    <Pressable
      onPress={onSelect}
      className={`relative w-[80%] min-w-[280px] flex-shrink-0 overflow-hidden rounded-xl ${
        isSelected
          ? 'border-primary shadow-primary/15 border-2 bg-surface-dark shadow-lg'
          : 'border-surface-highlight border bg-surface-dark/50'
      }`}
      accessibilityRole="button"
    >
      {/* Selected checkmark */}
      {isSelected ? (
        <View className="absolute right-0 top-0 z-10 p-3">
          <View className="bg-primary flex size-6 items-center justify-center rounded-full">
            <MaterialSymbol name="check" size={14} className="text-white" />
          </View>
        </View>
      ) : null}

      <View className="flex flex-col gap-4 p-5">
        {/* Icon */}
        <View
          className={`flex size-12 items-center justify-center rounded-lg ${
            isSelected ? 'bg-primary/20' : 'bg-surface-highlight'
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
          <Text className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
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
