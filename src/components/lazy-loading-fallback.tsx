import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { COLORS } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function LazyLoadingFallback() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.container, isDark ? styles.darkBg : styles.lightBg]}>
      <ActivityIndicator size="large" color={COLORS.brandPrimary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkBg: {
    backgroundColor: '#0F1621',
  },
  lightBg: {
    backgroundColor: '#ffffff',
  },
});
