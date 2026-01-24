import React from 'react';

import Animated, { FadeInDown } from 'react-native-reanimated';

import { Text, View } from 'react-native';

import { Button } from '@/components/ui/button';

interface PermissionCardProps {
  title: string;
  description: string;
  additionalInfo?: string;
  icon?: React.ReactNode;
  onAllow: () => void;
  onDeny?: () => void;
  allowText?: string;
  denyText?: string;
  delay?: number;
}

export function PermissionCard({
  title,
  description,
  additionalInfo,
  icon,
  onAllow,
  onDeny,
  allowText = 'Allow',
  denyText = "Don't Allow",
  delay = 0,
}: PermissionCardProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify()}
      className="mx-6 rounded-3xl bg-neutral-200 p-6 dark:bg-neutral-800"
    >
      {icon ? <View className="mb-4 items-center">{icon}</View> : null}

      <Text className="mb-3 text-center text-xl font-bold text-neutral-900 dark:text-neutral-100">
        {title}
      </Text>

      <Text className="mb-4 text-center text-base leading-6 text-neutral-700 dark:text-neutral-300">
        {description}
      </Text>

      {additionalInfo ? (
        <Text className="mb-6 text-center text-sm leading-5 text-neutral-600 dark:text-neutral-400">
          {additionalInfo}
        </Text>
      ) : null}

      <View className="gap-3">
        {onDeny ? (
          <Button
            variant="outline"
            onPress={onDeny}
            className="border-neutral-300 dark:border-neutral-700"
          >
            <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              {denyText}
            </Text>
          </Button>
        ) : null}

        <Button onPress={onAllow} className="bg-blue-600">
          <Text className="text-base font-semibold text-white">{allowText}</Text>
        </Button>
      </View>
    </Animated.View>
  );
}
