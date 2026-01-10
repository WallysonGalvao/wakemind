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

import type { FlatList } from 'react-native';
import { Platform, StatusBar, StyleSheet, useWindowDimensions, View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/constants/colors';
import { BulletsGroup } from '@/features/onboarding/components/bullets-group';
import type { OnboardingItemData } from '@/features/onboarding/components/onboarding-item';
import { OnboardingItem } from '@/features/onboarding/components/onboarding-item';
import { SplitButton } from '@/features/onboarding/components/split-button';
import { ONBOARDING_ITEMS } from '@/features/onboarding/constants/onboarding-config';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSettingsStore } from '@/stores/use-settings-store';

export default function OnboardingScreen() {
  const scrollX = useSharedValue(0);
  const flatListRef = useRef<FlatList<OnboardingItemData>>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [splitted, setSplitted] = useState(true);

  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const completeOnboarding = useSettingsStore((state) => state.completeOnboarding);

  const colors = {
    background: isDark ? COLORS.gray[900] : COLORS.gray[50],
    brandIcon: COLORS.brandPrimary,
    brandText: isDark ? COLORS.white : COLORS.gray[900],
  };

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
    completeOnboarding();
    router.replace('/(tabs)');
  }, [completeOnboarding]);

  const handleNext = useCallback(() => {
    const nextIndex = activeIndex + 1;
    if (nextIndex < ONBOARDING_ITEMS.length) {
      setActiveIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }
  }, [activeIndex]);

  const keyExtractor = useCallback((item: OnboardingItemData) => item.id, []);

  const renderItem = useCallback(
    ({ item, index }: { item: OnboardingItemData; index: number }) => (
      <OnboardingItem
        item={item}
        scrollX={scrollX as SharedValue<number>}
        index={index}
        totalItems={ONBOARDING_ITEMS.length}
      />
    ),
    [scrollX]
  );

  const buttonContainerStyle = useMemo(
    () => ({
      ...styles.absoluteContainer,
      bottom: Platform.select({
        ios: insets.bottom + 80,
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
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Header with branding */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View className="flex-row items-center gap-2">
          <MaterialSymbol name="bolt" size={24} color={colors.brandIcon} />
          <Text style={[styles.brandText, { color: colors.brandText }]}>WakeMind</Text>
        </View>
      </View>

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
        contentContainerStyle={{ backgroundColor: colors.background }}
      />

      <View style={buttonContainerStyle}>
        <SplitButton
          splitted={splitted}
          mainAction={{
            label: t('onboarding.getStarted'),
            onPress: handleSkipOrContinue,
          }}
          leftAction={{
            label: t('onboarding.skip'),
            onPress: handleSkipOrContinue,
          }}
          rightAction={{
            label: t('onboarding.next'),
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

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 24,
  },
  brandText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  absoluteContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
});
