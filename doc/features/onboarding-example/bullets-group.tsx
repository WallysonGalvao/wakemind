import type { SharedValue } from 'react-native-reanimated';
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';

import { useWindowDimensions, View } from 'react-native';

type BulletProps = {
  inputRange: number[];
  scrollX: SharedValue<number>;
};

function Bullet({ inputRange, scrollX }: BulletProps) {
  const rStyle = useAnimatedStyle(() => {
    const width = interpolate(scrollX.value, inputRange, [8, 32, 8], Extrapolation.CLAMP);

    return { width };
  });

  return <Animated.View className="h-2 rounded-full bg-white" style={[rStyle]} />;
}

type BulletsGroupProps = {
  length: number;
  scrollX: SharedValue<number>;
};

export function BulletsGroup({ length, scrollX }: BulletsGroupProps) {
  const { width } = useWindowDimensions();

  return (
    <View className="flex-row items-center justify-center gap-1">
      {Array.from({ length }).map((_, index) => {
        const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

        return <Bullet key={index} inputRange={inputRange} scrollX={scrollX} />;
      })}
    </View>
  );
}
