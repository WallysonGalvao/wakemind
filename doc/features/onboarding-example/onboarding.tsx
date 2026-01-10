import { useCallback, useMemo, useRef, useState } from 'react';

import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import type { SharedValue } from 'react-native-reanimated';
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Platform, StatusBar, StyleSheet, useWindowDimensions, View } from 'react-native';
import type { FlatList } from 'react-native';

import { BulletsGroup } from '@/components/bullets-group';
import { OnboardingItem } from '@/features/onboarding/components/onboarding-item';
import { SplitButton } from '@/features/onboarding/components/split-button';
import type { OnboardingItem as OnboardingItemType } from '@/features/onboarding/constants/onboarding-config';
import { ONBOARDING_ITEMS } from '@/features/onboarding/constants/onboarding-config';
import { useSettingsStore } from '@/stores/use-settings-store';
import { tailwindColors } from '@/theme/colors';

function OnboardingScreen() {
  const scrollX = useSharedValue(0);
  const flatListRef = useRef<FlatList<OnboardingItemType>>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [splitted, setSplitted] = useState(true);

  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { setHasSeenOnboarding } = useSettingsStore();

  const scrollHandler = useAnimatedScrollHandler(
    {
      onScroll: (event) => {
        'worklet';
        scrollX.value = event.contentOffset.x;
        const index = Math.round(event.contentOffset.x / width);

        runOnJS(setActiveIndex)(index);
        runOnJS(setSplitted)(index !== ONBOARDING_ITEMS.length - 1);
      },
    },
    [width]
  );

  const handleSkipOrContinue = useCallback(() => {
    setHasSeenOnboarding(true);
    router.replace('/(public)/login');
  }, [setHasSeenOnboarding]);

  const handleNext = useCallback(() => {
    const nextIndex = activeIndex + 1;
    if (nextIndex < ONBOARDING_ITEMS.length) {
      setActiveIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }
  }, [activeIndex]);

  const keyExtractor = useCallback((item: OnboardingItemType) => item.title, []);

  const renderItem = useCallback(
    ({ item }: { item: OnboardingItemType; index: number }) => (
      <OnboardingItem item={item} scrollX={scrollX as SharedValue<number>} />
    ),
    [scrollX]
  );

  const buttonContainerStyle = useMemo(
    () => ({
      ...styles.absoluteContainer,
      bottom: Platform.select({
        ios: insets.bottom + 90,
        android: 80,
      }),
    }),
    [insets.bottom]
  );

  const bulletsContainerStyle = useMemo(
    () => ({
      ...styles.absoluteContainer,
      bottom: insets.bottom + 30,
    }),
    [insets.bottom]
  );

  return (
    <View className="flex-1">
      <StatusBar barStyle="light-content" backgroundColor={tailwindColors.primary} />

      <Animated.FlatList
        ref={flatListRef}
        horizontal
        data={ONBOARDING_ITEMS}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ backgroundColor: tailwindColors.primary }}
      />

      <View style={buttonContainerStyle}>
        <SplitButton
          splitted={splitted}
          mainAction={{
            label: t('ONBOARDING_CONTINUE'),
            onPress: handleSkipOrContinue,
          }}
          leftAction={{
            label: t('SKIP'),
            onPress: handleSkipOrContinue,
            backgroundColor: 'transparent',
          }}
          rightAction={{
            label: t('NEXT'),
            onPress: handleNext,
          }}
        />
      </View>

      <View style={bulletsContainerStyle}>
        <BulletsGroup length={ONBOARDING_ITEMS.length} scrollX={scrollX} />
      </View>
    </View>
  );
}

export default OnboardingScreen;

const styles = StyleSheet.create({
  absoluteContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
});
