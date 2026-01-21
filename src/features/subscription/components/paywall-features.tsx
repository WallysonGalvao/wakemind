import { View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/constants/colors';

interface FeatureRowProps {
  icon: string;
  title: string;
  description: string;
}

export function FeatureRow({ icon, title, description }: FeatureRowProps) {
  return (
    <View className="flex-row items-start gap-4 rounded-lg p-3">
      <View className="mt-1 h-8 w-8 items-center justify-center rounded bg-primary-500/10">
        <MaterialSymbol name={icon} size={20} color={COLORS.brandPrimary} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-bold text-gray-900 dark:text-white">{title}</Text>
        <Text className="mt-0.5 text-sm leading-snug text-gray-500 dark:text-gray-400">
          {description}
        </Text>
      </View>
    </View>
  );
}

export function ProBadge() {
  return (
    <View className="mb-4 flex-row items-center self-start rounded-full border border-primary-500/20 bg-gray-100 px-3 py-1.5 dark:bg-[#1a2233]">
      <View className="mr-2 h-2 w-2 rounded-full bg-primary-500" />
      <Text className="text-[10px] font-bold uppercase tracking-widest text-primary-500">
        WakeMind Pro
      </Text>
    </View>
  );
}
