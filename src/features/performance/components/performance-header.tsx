/**
 * Performance Summary Header
 * Contains close and share buttons with title
 */

import { useTranslation } from 'react-i18next';

import { Pressable, View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';

interface PerformanceHeaderProps {
  onClose: () => void;
  onShare: () => void;
  topInset: number;
}

export function PerformanceHeader({ onClose, onShare, topInset }: PerformanceHeaderProps) {
  const { t } = useTranslation();

  return (
    <View
      className="flex-row items-center justify-between border-b border-slate-200/50 bg-background-light/95 px-4 backdrop-blur-md dark:border-white/5 dark:bg-background-dark/90"
      style={{ paddingTop: topInset + 16 }}
    >
      <Pressable
        onPress={onClose}
        className="flex size-12 shrink-0 items-center justify-start transition-opacity active:opacity-70"
        accessibilityRole="button"
        accessibilityLabel={t('common.close')}
        accessibilityHint={t('performance.a11y.closeHint')}
      >
        <MaterialSymbol name="close" size={28} className="text-slate-900 dark:text-white" />
      </Pressable>

      <Text className="flex-1 text-center text-xs font-extrabold uppercase tracking-widest text-slate-900/70 dark:text-white/80">
        {t('performance.summary')}
      </Text>

      <View className="flex w-12 items-center justify-end">
        <Pressable
          onPress={onShare}
          className="flex h-12 items-center justify-center overflow-hidden rounded-lg bg-transparent transition-opacity active:opacity-70"
          accessibilityRole="button"
          accessibilityLabel={t('common.share')}
          accessibilityHint={t('performance.a11y.shareHint')}
        >
          <MaterialSymbol name="share" size={24} className="text-slate-900 dark:text-white" />
        </Pressable>
      </View>
    </View>
  );
}
