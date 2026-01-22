import React, { useCallback, useEffect, useRef } from 'react';

import { useTranslation } from 'react-i18next';
import type { SharedValue } from 'react-native-reanimated';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { useWindowDimensions, View } from 'react-native';

import { ChallengeCard } from './challenge-card';

import { Text } from '@/components/ui/text';
import { ChallengeType } from '@/types/alarm-enums';

interface Challenge {
  type: ChallengeType;
  icon: string;
  imageUrl?: string;
}

const challenges: Challenge[] = [
  {
    type: ChallengeType.MATH,
    icon: 'calculate',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBaZGanzHGAyCw4f5jyO4UYjLZwk9fsdu2KaE7_At31J-EwNfpmmdKHb-ttr0iZu4lUXsJKxQaTccOarmb6gJwjDhZI-Hlyiub-8alsuMB9MuzC16g7OBWTVv7iBAk8FWZGTn_MZiMXj1Ztm5YNr2kWY2Xkq4S7R4z9MF6z38g6aGP1j5ezl5Pl_B6iIa5QWVQ7O6JeMNTDikSvJjHG-PvHrgtZNOx6ZWxH6WLDzCU7p47z4KbbgkqWo2yn_TJJOFe0f4lIJV_lWI3k',
  },
  {
    type: ChallengeType.MEMORY,
    icon: 'psychology',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC4Y0qOZl_dZW6qeLkKEFUBXK4iwO4CwqkemCyuQViyLu6xAJxcq-9hZOaLQYTXfqshsUPX-uxF3Qriui98_FAaiyEzBjABwwWHyB8gsvAI-NbiwnJlwddRtENvdxjp2WThWm2SXsZ-YCZd9Zt-mTwKJo_bkbBY2x6jZvhjplhhR5MsS5ykZlEh8LpD7zpCbHVUqwyozuhrJKt7fXuGCwzMzmaje0q--8XMrKATqnbpo20qRRgODYEZTaaNg5b_X4D3icZG1uywdDtr',
  },
  {
    type: ChallengeType.LOGIC,
    icon: 'lightbulb',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBuo8XjWhsl97GmGLJOiEB1vBt5prKNso8p2OeEimlHwApXDD_95tuXcn3_ibiUkZdF8K3L-qTZ_r9C9weJ6b60guTb8gMDZzpxpmHay-ZQZxRP3qZ9YO88x6eTc6nstY7nnNP9dD1ur-Ogz7-AvQlzbDulG4F9v_IQS29xL61gbyM7BcMyMu_uxlw7vik1XsaOAhv98bxug8NjQlwuyc5Z-CL3mZ3UQuwtWHsUpry1A2ZA3HlxII3KgVqDBDP7vQQieopKUs1PUFPX',
  },
];

// Layout constants
const CARD_GAP = 16;
const HORIZONTAL_PADDING = 16;

interface AnimatedCardProps {
  challenge: Challenge;
  index: number;
  scrollX: SharedValue<number>;
  snapInterval: number;
  cardWidth: number;
  isSelected: boolean;
  title: string;
  description: string;
  onSelect: () => void;
}

function AnimatedCard({
  challenge,
  index,
  scrollX,
  snapInterval,
  cardWidth,
  isSelected,
  title,
  description,
  onSelect,
}: AnimatedCardProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * snapInterval,
      index * snapInterval,
      (index + 1) * snapInterval,
    ];

    const scale = interpolate(scrollX.value, inputRange, [0.92, 1, 0.92], 'clamp');
    const opacity = interpolate(scrollX.value, inputRange, [0.7, 1, 0.7], 'clamp');

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <Animated.View style={[{ width: cardWidth }, animatedStyle]}>
      <ChallengeCard
        type={challenge.type}
        title={title}
        description={description}
        icon={challenge.icon}
        imageUrl={challenge.imageUrl}
        isSelected={isSelected}
        onSelect={onSelect}
      />
    </Animated.View>
  );
}

interface CognitiveActivationSectionProps {
  selectedChallenge: ChallengeType;
  onChallengeSelect: (type: ChallengeType) => void;
}

export function CognitiveActivationSection({
  selectedChallenge,
  onChallengeSelect,
}: CognitiveActivationSectionProps) {
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const scrollX = useSharedValue(0);
  const scrollViewRef = useRef<Animated.ScrollView | null>(null);
  const isProgrammaticScroll = useRef(false);

  // Calculate card width based on screen width (80% of screen - padding)
  const cardWidth = Math.min(screenWidth * 0.8, 320);
  const snapInterval = cardWidth + CARD_GAP;

  // Scroll to selected challenge on mount (for edit mode)
  useEffect(() => {
    const selectedIndex = challenges.findIndex((c) => c.type === selectedChallenge);
    if (selectedIndex !== -1 && scrollViewRef.current) {
      // Small delay to ensure layout is complete
      const timeoutId = setTimeout(() => {
        isProgrammaticScroll.current = true;
        // Use type assertion for scrollTo method
        (
          scrollViewRef.current as unknown as {
            scrollTo: (opts: { x: number; animated: boolean }) => void;
          }
        )?.scrollTo({
          x: selectedIndex * snapInterval,
          animated: false,
        });
        scrollX.value = selectedIndex * snapInterval;
        // Reset flag after scroll completes
        setTimeout(() => {
          isProgrammaticScroll.current = false;
        }, 50);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [selectedChallenge, snapInterval, scrollX]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  // Auto-select challenge when scroll ends (momentum or drag) - only for manual scrolls
  const handleScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      // Skip if this is a programmatic scroll (from card click)
      if (isProgrammaticScroll.current) {
        isProgrammaticScroll.current = false;
        return;
      }

      const offsetX = event.nativeEvent.contentOffset.x;
      const centeredIndex = Math.round(offsetX / snapInterval);
      const clampedIndex = Math.max(0, Math.min(centeredIndex, challenges.length - 1));
      const centeredChallenge = challenges[clampedIndex];

      if (centeredChallenge && centeredChallenge.type !== selectedChallenge) {
        onChallengeSelect(centeredChallenge.type);
      }
    },
    [snapInterval, selectedChallenge, onChallengeSelect]
  );

  // Handle card click - select and scroll to center
  const handleCardSelect = useCallback(
    (index: number, type: ChallengeType) => {
      // Mark as programmatic scroll to prevent handleScrollEnd from overriding selection
      isProgrammaticScroll.current = true;
      onChallengeSelect(type);
      // Scroll to center the selected card
      (
        scrollViewRef.current as unknown as {
          scrollTo: (opts: { x: number; animated: boolean }) => void;
        }
      )?.scrollTo({
        x: index * snapInterval,
        animated: true,
      });
    },
    [onChallengeSelect, snapInterval]
  );

  return (
    <View>
      {/* Section header */}
      <View className="flex-row items-center justify-between px-4 pb-3 pt-2">
        <Text className="text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
          {t('newAlarm.cognitiveActivation.title')}
        </Text>
        <View className="rounded bg-brand-primary/10 px-2 py-1">
          <Text className="text-xs font-bold uppercase tracking-wider text-brand-primary">
            {t('newAlarm.cognitiveActivation.required')}
          </Text>
        </View>
      </View>

      {/* Challenge cards horizontal scroll with animations */}
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={snapInterval}
        decelerationRate="fast"
        onScroll={scrollHandler}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        scrollEventThrottle={16}
        contentContainerClassName="pb-4"
        contentContainerStyle={{
          paddingHorizontal: HORIZONTAL_PADDING,
          gap: CARD_GAP,
        }}
      >
        {challenges.map((challenge, index) => (
          <AnimatedCard
            key={challenge.type}
            challenge={challenge}
            index={index}
            scrollX={scrollX}
            snapInterval={snapInterval}
            cardWidth={cardWidth}
            isSelected={selectedChallenge === challenge.type}
            title={t(`newAlarm.challenges.${challenge.type}.title`)}
            description={t(`newAlarm.challenges.${challenge.type}.description`)}
            onSelect={() => handleCardSelect(index, challenge.type)}
          />
        ))}
      </Animated.ScrollView>
    </View>
  );
}
