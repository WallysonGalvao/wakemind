import { useRouter } from 'expo-router';

import { Pressable, View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useShadowStyle } from '@/hooks/use-shadow-style';

export function AddWidget() {
  const router = useRouter();
  const shadowStyle = useShadowStyle('sm');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handlePress = () => {
    router.push('/dashboard/widgets');
  };

  const iconColor = isDark ? COLORS.blue[300] : COLORS.blue[500];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={handlePress}
      className="flex-col items-center gap-4 rounded-xl border-2 border-dashed border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-surface-dark"
      style={shadowStyle}
    >
      <View className="h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
        <MaterialSymbol name="add" size={20} color={iconColor} />
      </View>
      <Text className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Widgets
      </Text>
    </Pressable>
  );
}
