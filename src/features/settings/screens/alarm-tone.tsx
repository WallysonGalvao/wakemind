import React, { useState } from 'react';

import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Pressable, ScrollView, View } from 'react-native';

import { Header } from '@/components/header';
import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';

// ============================================================================
// Types
// ============================================================================

interface AlarmTone {
  id: string;
  name: string;
  category: string;
  score: number;
  trend: number[]; // 5 bars representing trend
}

// ============================================================================
// Constants
// ============================================================================

const ALARM_TONES: AlarmTone[] = [
  { id: 'orbit', name: 'Orbit', category: 'Synthwave', score: 98, trend: [60, 75, 85, 100, 90] },
  {
    id: 'deep-focus',
    name: 'Deep Focus',
    category: 'Binaural',
    score: 96,
    trend: [80, 70, 90, 95, 85],
  },
  { id: 'ascent', name: 'Ascent', category: 'Cinematic', score: 89, trend: [50, 40, 60, 70, 45] },
  { id: 'radar', name: 'Radar', category: 'Classic', score: 65, trend: [30, 40, 20, 35, 25] },
  { id: 'sunrise', name: 'Sunrise', category: 'Nature', score: 82, trend: [55, 65, 75, 80, 78] },
];

// ============================================================================
// Sub-Components
// ============================================================================

function TrendBars({ trend, isActive }: { trend: number[]; isActive: boolean }) {
  return (
    <View className="min-w-[80px] flex-col items-end gap-1.5">
      <Text className="text-[9px] font-bold uppercase tracking-wide text-gray-400">
        Success Trend
      </Text>
      <View className="h-6 flex-row items-end gap-[3px]">
        {trend.map((value, index) => {
          const isHighlighted = value >= 70;
          const heightPercent = Math.round(value * 0.24); // Convert to pixels (max ~24px)
          return (
            <View
              key={index}
              className={`w-1.5 rounded-t-sm ${
                isActive && isHighlighted
                  ? 'bg-brand-primary'
                  : isHighlighted
                    ? 'bg-brand-primary/50'
                    : 'bg-gray-200 dark:bg-gray-700'
              }`}
              style={{ height: heightPercent }}
            />
          );
        })}
      </View>
    </View>
  );
}

function ToneItem({
  tone,
  isActive,
  isPlaying,
  onPlay,
  onSelect,
}: {
  tone: AlarmTone;
  isActive: boolean;
  isPlaying: boolean;
  onPlay: () => void;
  onSelect: () => void;
}) {
  const colorScheme = useColorScheme();

  return (
    <Pressable
      onPress={onSelect}
      accessibilityRole="button"
      accessibilityLabel={tone.name}
      accessibilityHint={`Select ${tone.name} as alarm tone`}
      accessibilityState={{ selected: isActive }}
      className={`mx-4 mb-3 overflow-hidden rounded-xl border p-4 ${
        isActive
          ? 'border-brand-primary ring-1 ring-brand-primary/20'
          : 'border-gray-100 dark:border-white/5'
      } bg-white shadow-sm dark:bg-surface-dark`}
    >
      <View className="flex-row items-center justify-between gap-4">
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={onPlay}
            accessibilityRole="button"
            accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
            accessibilityHint={`${isPlaying ? 'Pause' : 'Play'} ${tone.name} preview`}
            className={`h-10 w-10 items-center justify-center rounded-full ${
              isActive ? 'bg-brand-primary shadow-lg' : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            <MaterialSymbol
              name={isPlaying ? 'pause' : 'play_arrow'}
              size={24}
              color={
                isActive ? COLORS.white : colorScheme === 'dark' ? COLORS.white : COLORS.gray[600]
              }
            />
          </Pressable>
          <View>
            <View className="flex-row items-center gap-2">
              <Text className="font-bold text-gray-900 dark:text-white">{tone.name}</Text>
              {isActive ? (
                <View className="rounded bg-brand-primary/20 px-1.5 py-0.5">
                  <Text className="text-[9px] font-bold text-brand-primary">ACTIVE</Text>
                </View>
              ) : null}
            </View>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {tone.category} • {tone.score}% Score
            </Text>
          </View>
        </View>
        <TrendBars trend={tone.trend} isActive={isActive} />
      </View>
    </Pressable>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function AlarmToneScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [selectedToneId, setSelectedToneId] = useState('orbit');
  const [playingToneId, setPlayingToneId] = useState<string | null>(null);

  const handlePlay = (toneId: string) => {
    if (playingToneId === toneId) {
      setPlayingToneId(null);
      // TODO: Stop audio playback
    } else {
      setPlayingToneId(toneId);
      // TODO: Start audio playback
    }
  };

  const handleSelect = (toneId: string) => {
    setSelectedToneId(toneId);
  };

  const handleSave = () => {
    // TODO: Save selected tone to settings
    router.back();
  };

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <View style={{ paddingTop: insets.top }}>
        <Header
          title={t('alarmTone.title')}
          leftIcons={[
            {
              icon: (
                <MaterialSymbol
                  name="arrow_back"
                  size={24}
                  className="text-slate-900 dark:text-white"
                />
              ),
              onPress: () => router.back(),
              accessibilityLabel: t('common.back'),
            },
          ]}
        />
      </View>

      {/* Content */}
      <ScrollView className="flex-1 pb-10" showsVerticalScrollIndicator={false}>
        {/* Section Header */}
        <View className="mb-2 flex-row items-end justify-between px-4">
          <Text className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
            {t('alarmTone.availableTones')}
          </Text>
        </View>

        {/* Tone List */}
        <View className="pb-4">
          {ALARM_TONES.map((tone) => (
            <ToneItem
              key={tone.id}
              tone={tone}
              isActive={tone.id === selectedToneId}
              isPlaying={tone.id === playingToneId}
              onPlay={() => handlePlay(tone.id)}
              onSelect={() => handleSelect(tone.id)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
