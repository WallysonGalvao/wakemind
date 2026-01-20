import { useTranslation } from 'react-i18next';

import { Pressable, Text, View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Switch } from '@/components/ui/switch';

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

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: enabled }}
      accessibilityLabel={t(titleKey)}
      accessibilityHint={t(descriptionKey)}
      onPress={onToggle}
      className="flex-row items-center justify-between p-4 active:bg-slate-50"
    >
      <View className="flex-1 flex-row items-center gap-3.5">
        <View className="h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
          <MaterialSymbol name={icon} size={20} color="#0F1621" />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-bold text-[#0F1621]">{t(titleKey)}</Text>
          <Text className="mt-0.5 text-[11px] font-medium text-slate-500">{t(descriptionKey)}</Text>
        </View>
      </View>
      <Switch
        value={enabled}
        onValueChange={onToggle}
        trackColor={{ false: '#E2E8F0', true: '#3FA9F5' }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="#E2E8F0"
      />
    </Pressable>
  );
}
