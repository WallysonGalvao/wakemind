import React from 'react';

import { useTranslation } from 'react-i18next';

import { ScrollView, View } from 'react-native';

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

interface CognitiveActivationSectionProps {
  selectedChallenge: ChallengeType;
  onChallengeSelect: (type: ChallengeType) => void;
}

export function CognitiveActivationSection({
  selectedChallenge,
  onChallengeSelect,
}: CognitiveActivationSectionProps) {
  const { t } = useTranslation();

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

      {/* Challenge cards horizontal scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={296}
        decelerationRate="fast"
        contentContainerClassName="gap-4 px-4 pb-4"
        className="snap-x"
      >
        {challenges.map((challenge) => (
          <View key={challenge.type} className="snap-center">
            <ChallengeCard
              type={challenge.type}
              title={t(`newAlarm.challenges.${challenge.type}.title`)}
              description={t(`newAlarm.challenges.${challenge.type}.description`)}
              icon={challenge.icon}
              imageUrl={challenge.imageUrl}
              isSelected={selectedChallenge === challenge.type}
              onSelect={() => onChallengeSelect(challenge.type)}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
