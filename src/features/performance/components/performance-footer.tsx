/**
 * Performance Summary Footer
 * Contains CTA button and motivational quote
 */

import { useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import { Pressable, View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { useShadowStyle } from '@/hooks/use-shadow-style';

interface PerformanceFooterProps {
  onStartDay: () => void;
  bottomInset: number;
}

export function PerformanceFooter({ onStartDay, bottomInset }: PerformanceFooterProps) {
  const { t } = useTranslation();
  const shadowStyleLg = useShadowStyle('lg');

  // Select a random motivational quote
  const randomQuote = useMemo(() => {
    const quotes = t('performance.quotes', { returnObjects: true }) as string[];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }, [t]);

  return (
    <View
      className="z-10 bg-gradient-to-t from-background-light via-background-light to-transparent p-5 dark:from-background-dark dark:via-background-dark"
      style={{ paddingBottom: bottomInset + 20 }}
    >
      <Pressable
        onPress={onStartDay}
        style={shadowStyleLg}
        className="flex h-14 w-full flex-row items-center justify-center gap-2 rounded-xl bg-primary-500 transition-transform active:scale-[0.98]"
        accessibilityRole="button"
      >
        <Text className="text-base font-bold text-white">{t('performance.startDay')}</Text>
        <MaterialSymbol name="arrow_forward" size={24} className="text-white" />
      </Pressable>

      <Text className="mt-4 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400 opacity-70">
        "{randomQuote}"
      </Text>
    </View>
  );
}
