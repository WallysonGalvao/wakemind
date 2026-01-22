import { useTranslation } from 'react-i18next';

import { Pressable, Text, View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Switch } from '@/components/ui/switch';
import { COLORS } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface WidgetToggleProps {
  icon: string;
  titleKey: string;
  descriptionKey: string;
  enabled: boolean;
  onToggle: () => void;
}

export function WidgetToggle({
  icon,
  titleKey,
  descriptionKey,
  enabled,
  onToggle,
}: WidgetToggleProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();

  const iconColor = colorScheme === 'dark' ? '#FFFFFF' : '#0F1621';
  const trackColorOff = colorScheme === 'dark' ? '#3B4A5C' : '#E2E8F0';

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: enabled }}
      accessibilityLabel={t(titleKey)}
      accessibilityHint={t(descriptionKey)}
      onPress={onToggle}
      className="flex-row items-center justify-between p-4 active:bg-slate-50 dark:active:bg-[#232f48]"
    >
      <View className="flex-1 flex-row items-center gap-3.5">
        <View className="h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 dark:border-gray-700 dark:bg-[#232f48]">
          <MaterialSymbol name={icon} size={20} color={iconColor} />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-bold text-[#0F1621] dark:text-white">{t(titleKey)}</Text>
          <Text className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-gray-400">
            {t(descriptionKey)}
          </Text>
        </View>
      </View>
      <Switch
        value={enabled}
        onValueChange={onToggle}
        trackColor={{ false: COLORS.gray[300], true: COLORS.brandPrimary }}
        thumbColor={COLORS.white}
        ios_backgroundColor={trackColorOff}
      />
    </Pressable>
  );
}
