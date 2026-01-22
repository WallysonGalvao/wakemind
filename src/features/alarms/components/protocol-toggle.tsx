import { View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useShadowStyle } from '@/hooks/use-shadow-style';

interface ProtocolToggleProps {
  icon: string;
  iconClassName: string;
  iconBgColor: string;
  title: string;
  description: string;
  isEnabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function ProtocolToggle({
  icon,
  iconClassName,
  iconBgColor,
  title,
  description,
  isEnabled,
  onToggle,
  disabled = false,
}: ProtocolToggleProps) {
  const shadowStyle = useShadowStyle('sm');
  const colorScheme = useColorScheme();

  const trackColor = {
    false: colorScheme === 'dark' ? '#475569' : '#cbd5e1',
    true: '#135bec',
  };

  return (
    <View
      className={`flex-row items-center justify-between rounded-lg border border-slate-200 bg-white p-4 dark:border-transparent dark:bg-surface-dark ${
        disabled ? 'opacity-60' : ''
      }`}
      style={shadowStyle}
      accessibilityRole="none"
    >
      <View className="flex-row items-center gap-3">
        <View className={`flex size-10 items-center justify-center rounded-full ${iconBgColor}`}>
          <MaterialSymbol name={icon} size={24} className={iconClassName} />
        </View>
        <View>
          <Text className="font-semibold text-slate-900 dark:text-white">{title}</Text>
          <Text className="text-sm text-slate-500 dark:text-slate-400">{description}</Text>
        </View>
      </View>

      {/* Toggle switch */}
      <Switch
        value={isEnabled}
        onValueChange={disabled ? undefined : onToggle}
        trackColor={trackColor}
        thumbColor="#ffffff"
        disabled={disabled}
        size="sm"
      />
    </View>
  );
}
