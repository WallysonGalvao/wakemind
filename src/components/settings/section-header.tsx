import React from 'react';

import { View } from 'react-native';

import { Text } from '../ui/text';

interface SectionHeaderProps {
  title: string;
}

export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <View className="mb-3 mt-6 px-1">
      <Text className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-500">
        {title}
      </Text>
    </View>
  );
}
