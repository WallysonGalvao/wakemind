import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Pressable, ScrollView, View } from 'react-native';

import { AnalyticsEvents } from '@/analytics';
import { Header } from '@/components/header';
import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import type { AlarmTone } from '@/constants/alarm-tones';
import { ALARM_TONES, getToneAudioSource } from '@/constants/alarm-tones';
import { COLORS } from '@/constants/colors';
import { useAnalyticsScreen } from '@/hooks/use-analytics-screen';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSettingsStore } from '@/stores/use-settings-store';

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Animated waveform visualization for audio preview
 * Uses unique pattern from tone metadata
 */
function Waveform({
  isPlaying,
  isActive,
  pattern,
}: {
  isPlaying: boolean;
  isActive: boolean;
  pattern: number[];
}) {
  return (
    <View className="h-8 w-16 flex-row items-center justify-center gap-[2px]">
      {pattern.map((height, index) => (
        <WaveformBar
          key={index}
          baseHeight={height}
          delay={index * 80}
          isPlaying={isPlaying}
          isActive={isActive}
        />
      ))}
    </View>
  );
}

function WaveformBar({
  baseHeight,
  delay,
  isPlaying,
  isActive,
}: {
  baseHeight: number;
  delay: number;
  isPlaying: boolean;
  isActive: boolean;
}) {
  const animatedHeight = useSharedValue(baseHeight);

  useEffect(() => {
    if (isPlaying) {
      // Animate when playing
      animatedHeight.value = withRepeat(
        withSequence(
          withTiming(Math.random() * 0.5 + 0.5, { duration: 200 + delay }),
          withTiming(Math.random() * 0.5 + 0.3, { duration: 200 + delay })
        ),
        -1,
        true
      );
    } else {
      // Reset to base height when not playing
      animatedHeight.value = withTiming(baseHeight, { duration: 300 });
    }
  }, [isPlaying, baseHeight, delay, animatedHeight]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value * 24, // Max 24px height
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className={`w-1 rounded-full ${
        isPlaying
          ? 'bg-brand-primary'
          : isActive
            ? 'bg-brand-primary/40'
            : 'bg-gray-300 dark:bg-gray-600'
      }`}
    />
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
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const toneName = t(tone.nameKey);

  return (
    <Pressable
      onPress={onSelect}
      accessibilityRole="button"
      accessibilityLabel={toneName}
      accessibilityHint={`Select ${toneName} as alarm tone`}
      accessibilityState={{ selected: isActive }}
      className={`mx-4 mb-3 overflow-hidden rounded-xl border p-4 ${
        isActive
          ? 'border-brand-primary ring-1 ring-brand-primary/20'
          : 'border-gray-100 dark:border-white/5'
      } bg-white shadow-sm dark:bg-surface-dark`}
    >
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onPlay();
          }}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
          accessibilityHint={`${isPlaying ? 'Pause' : 'Play'} ${toneName} preview`}
          className={`h-12 w-12 items-center justify-center rounded-full ${
            isPlaying
              ? 'bg-brand-primary'
              : isActive
                ? 'bg-brand-primary/20'
                : 'bg-gray-100 dark:bg-gray-800'
          }`}
          /* eslint-disable react-native/no-inline-styles, react-native/no-color-literals -- shadow-* in conditional className causes navigation context error with NativeWind + Expo Router + React 19 */
          style={
            isPlaying
              ? {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 4,
                }
              : undefined
          }
          /* eslint-enable react-native/no-inline-styles, react-native/no-color-literals */
        >
          <MaterialSymbol
            name={isPlaying ? 'pause' : 'play_arrow'}
            size={24}
            color={
              isPlaying
                ? COLORS.white
                : isActive
                  ? COLORS.brandPrimary
                  : colorScheme === 'dark'
                    ? COLORS.white
                    : COLORS.gray[600]
            }
          />
        </Pressable>
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="font-bold text-gray-900 dark:text-white">{toneName}</Text>
            {isActive ? (
              <View className="rounded bg-brand-primary/20 px-1.5 py-0.5">
                <Text className="text-[9px] font-bold text-brand-primary">
                  {t('common.active')}
                </Text>
              </View>
            ) : null}
          </View>
          <Text className="text-xs font-medium text-brand-primary">{t(tone.categoryKey)}</Text>
          <Text className="mt-0.5 text-[11px] leading-tight text-gray-500 dark:text-gray-400">
            {t(tone.descriptionKey)}
          </Text>
        </View>
        <Waveform isPlaying={isPlaying} isActive={isActive} pattern={tone.waveformPattern} />
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

  // Analytics tracking
  useAnalyticsScreen('Alarm Tone Settings');

  const { alarmToneId, setAlarmToneId } = useSettingsStore();
  const [playingToneId, setPlayingToneId] = useState<string | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const stopCurrentSound = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
  }, []);

  const handlePlay = useCallback(
    async (toneId: string) => {
      // If same tone is playing, stop it
      if (playingToneId === toneId) {
        await stopCurrentSound();
        setPlayingToneId(null);
        return;
      }

      // Stop any currently playing sound
      await stopCurrentSound();

      try {
        // Configure audio mode for playback
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });

        // Get the audio source for this tone
        const audioSource = getToneAudioSource(toneId);

        // Create and play the sound
        const { sound } = await Audio.Sound.createAsync(audioSource, {
          shouldPlay: true,
          isLooping: true,
        });

        soundRef.current = sound;
        setPlayingToneId(toneId);

        // Listen for playback status to handle when sound finishes
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && !status.isPlaying && !status.isLooping) {
            setPlayingToneId(null);
          }
        });
      } catch (error) {
        console.error('Error playing alarm tone:', error);
        setPlayingToneId(null);
      }
    },
    [playingToneId, stopCurrentSound]
  );

  const handleSelect = (toneId: string) => {
    setAlarmToneId(toneId);
    AnalyticsEvents.alarmToneChanged(toneId);
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
              isActive={tone.id === alarmToneId}
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
