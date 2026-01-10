import { useTranslation } from 'react-i18next';
import type { SharedValue } from 'react-native-reanimated';
import Animated, { interpolateColor, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Image, Text, useWindowDimensions, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';

import type { OnboardingItem as OnboardingItemType } from '../constants/onboarding-config';

import { tailwindColors } from '@/theme/colors';

type OnboardingItemProps = {
  item: OnboardingItemType;
  scrollX: SharedValue<number>;
};

export function OnboardingItem({ item, scrollX }: OnboardingItemProps) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const rStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      scrollX.value,
      [0, width, width * 2],
      [tailwindColors.primary, tailwindColors.secondary, tailwindColors.primary]
    );

    return { backgroundColor };
  });

  return (
    <Animated.View
      style={[
        {
          width,
          paddingTop: insets.top + 30,
        },
        rStyle,
      ]}
      className="items-center"
    >
      <Image
        source={item.image as unknown as ImageSourcePropType}
        className="mt-10 h-[400px] w-[300px] self-center overflow-hidden rounded-xl"
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />

      <View className="items-center px-4">
        <Text className="pt-5 text-xl font-medium text-white">{t(item.title)}</Text>
        <Text className="pt-2.5 text-center font-sans text-base text-white">
          {t(item.description)}
        </Text>
      </View>
    </Animated.View>
  );
}
