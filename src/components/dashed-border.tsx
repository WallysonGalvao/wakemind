import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';

import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Rect } from 'react-native-svg';

import { StyleSheet, useColorScheme, View } from 'react-native';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface DashedBorderProps {
  /** Border color for light mode */
  lightColor?: string;
  /** Border color for dark mode */
  darkColor?: string;
  /** Border radius */
  radius?: number;
  /** Children to render inside the bordered container */
  children: ReactNode;
  /** Optional className for the wrapper */
  className?: string;
}

export function DashedBorder({
  lightColor = '#93C5FD',
  darkColor = '#3f51b5',
  radius = 12,
  children,
  className,
}: DashedBorderProps) {
  const colorScheme = useColorScheme();
  const dashOffset = useSharedValue(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const strokeColor = useMemo(() => {
    return colorScheme === 'dark' ? darkColor : lightColor;
  }, [colorScheme, darkColor, lightColor]);

  useEffect(() => {
    dashOffset.value = withRepeat(
      withTiming(12, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1, // Infinite repeat
      false // Don't reverse
    );
  }, [dashOffset]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: dashOffset.value,
  }));

  return (
    <View
      className={className}
      style={styles.wrapper}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setDimensions({ width, height });
      }}
    >
      {dimensions.width > 0 && dimensions.height > 0 && (
        <Svg width={dimensions.width} height={dimensions.height} style={styles.svg}>
          <AnimatedRect
            x={2}
            y={2}
            width={dimensions.width - 4}
            height={dimensions.height - 4}
            rx={radius}
            ry={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={2}
            strokeDasharray="6 6"
            animatedProps={animatedProps}
          />
        </Svg>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
    pointerEvents: 'none',
  },
});
