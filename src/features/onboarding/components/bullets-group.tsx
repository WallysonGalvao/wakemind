import type { SharedValue } from 'react-native-reanimated';
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';

import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { COLORS } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';

// ============================================================================
// Types
// ============================================================================

type BulletProps = {
  inputRange: number[];
  scrollX: SharedValue<number>;
  isDark: boolean;
};

type BulletsGroupProps = {
  length: number;
  scrollX: SharedValue<number>;
};

// ============================================================================
// Sub-Components
// ============================================================================

function Bullet({ inputRange, scrollX, isDark }: BulletProps) {
  const rStyle = useAnimatedStyle(() => {
    const width = interpolate(scrollX.value, inputRange, [8, 32, 8], Extrapolation.CLAMP);

    return { width };
  });

  const bulletColor = isDark ? COLORS.white : COLORS.brandPrimary;

  return <Animated.View style={[styles.bullet, { backgroundColor: bulletColor }, rStyle]} />;
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  bullet: {
    height: 8,
    borderRadius: 9999,
  },
});

// ============================================================================
// Main Component
// ============================================================================

export function BulletsGroup({ length, scrollX }: BulletsGroupProps) {
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className="flex-row items-center justify-center gap-1">
      {Array.from({ length }).map((_, index) => {
        const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

        return <Bullet key={index} inputRange={inputRange} scrollX={scrollX} isDark={isDark} />;
      })}
    </View>
  );
}
