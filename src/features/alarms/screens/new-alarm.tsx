import React, { useState } from 'react';

import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Pressable, ScrollView, View } from 'react-native';

import { BackupProtocolsSection } from '../components/backup-protocols-section';
import { CognitiveActivationSection } from '../components/cognitive-activation-section';
import { DifficultySelector } from '../components/difficulty-selector';
import { TimePickerWheel } from '../components/time-picker-wheel';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { useAlarmsStore } from '@/stores/use-alarms-store';
import { BackupProtocolId, ChallengeType, DifficultyLevel, Period } from '@/types/alarm-enums';

const DEFAULT_HOUR = 6;
const DEFAULT_MINUTE = 0;
const DEFAULT_PERIOD = Period.AM;

const CHALLENGE_CONFIG: Record<ChallengeType, { icon: string; label: string }> = {
  [ChallengeType.MATH]: { icon: 'calculate', label: 'Math Challenge' },
  [ChallengeType.MEMORY]: { icon: 'psychology', label: 'Memory Match' },
  [ChallengeType.LOGIC]: { icon: 'lightbulb', label: 'Logic Puzzle' },
};

export default function NewAlarmScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const addAlarm = useAlarmsStore((state) => state.addAlarm);

  // Time state
  const [hour, setHour] = useState(DEFAULT_HOUR);
  const [minute, setMinute] = useState(DEFAULT_MINUTE);
  const [period, setPeriod] = useState<Period>(DEFAULT_PERIOD);

  // Challenge state
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeType>(ChallengeType.MATH);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(DifficultyLevel.ADAPTIVE);

  // Backup protocols state
  const [protocols, setProtocols] = useState([
    { id: BackupProtocolId.SNOOZE, enabled: false },
    { id: BackupProtocolId.WAKE_CHECK, enabled: true },
    { id: BackupProtocolId.BARCODE_SCAN, enabled: false },
  ]);

  const handleClose = () => {
    router.back();
  };

  const handleReset = () => {
    setHour(DEFAULT_HOUR);
    setMinute(DEFAULT_MINUTE);
    setPeriod(DEFAULT_PERIOD);
    setSelectedChallenge(ChallengeType.MATH);
    setDifficulty(DifficultyLevel.ADAPTIVE);
    setProtocols([
      { id: BackupProtocolId.SNOOZE, enabled: false },
      { id: BackupProtocolId.WAKE_CHECK, enabled: true },
      { id: BackupProtocolId.BARCODE_SCAN, enabled: false },
    ]);
  };

  const handleTimeChange = (newHour: number, newMinute: number, newPeriod: Period) => {
    setHour(newHour);
    setMinute(newMinute);
    setPeriod(newPeriod);
  };

  const handleProtocolToggle = (id: BackupProtocolId) => {
    setProtocols((prev) =>
      prev.map((protocol) =>
        protocol.id === id ? { ...protocol, enabled: !protocol.enabled } : protocol
      )
    );
  };

  const handleCommit = () => {
    const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    const challengeConfig = CHALLENGE_CONFIG[selectedChallenge];

    addAlarm({
      time: timeString,
      period,
      challenge: challengeConfig.label,
      challengeIcon: challengeConfig.icon,
      schedule: 'Daily',
      difficulty,
      protocols,
    });

    router.back();
  };

  const formattedTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <View
        className="flex-row items-center justify-between border-b border-transparent bg-background-light/95 px-4 pb-2 dark:bg-background-dark/95"
        style={{ paddingTop: insets.top + 16 }}
      >
        <Pressable
          onPress={handleClose}
          className="flex size-12 shrink-0 items-center justify-start"
          accessibilityRole="button"
        >
          <MaterialSymbol name="close" size={24} />
        </Pressable>

        <Text className="flex-1 text-center text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
          {t('newAlarm.title')}
        </Text>

        <Pressable
          onPress={handleReset}
          className="flex w-12 items-center justify-end"
          accessibilityRole="button"
        >
          <Text className="text-base font-medium text-slate-500 transition-colors hover:text-brand-primary dark:text-slate-400">
            {t('newAlarm.reset')}
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      <ScrollView contentContainerClassName="pb-32">
        {/* Time Picker Section */}
        <TimePickerWheel
          hour={hour}
          minute={minute}
          period={period}
          onTimeChange={handleTimeChange}
        />

        {/* Cognitive Activation Section */}
        <CognitiveActivationSection
          selectedChallenge={selectedChallenge}
          onChallengeSelect={setSelectedChallenge}
        />

        {/* Difficulty Selector */}
        <DifficultySelector selectedDifficulty={difficulty} onDifficultyChange={setDifficulty} />

        {/* Divider */}
        <View className="bg-surface-highlight mx-4 my-4 h-px" />

        {/* Backup Protocols Section */}
        <BackupProtocolsSection protocols={protocols} onProtocolToggle={handleProtocolToggle} />
      </ScrollView>

      {/* Bottom CTA */}
      <View
        className="absolute bottom-0 left-0 right-0 z-30 w-full bg-gradient-to-t from-background-light p-4 dark:from-background-dark"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <Pressable
          onPress={handleCommit}
          className="h-14 w-full flex-row items-center justify-center rounded-xl bg-brand-primary active:scale-[0.98]"
          accessibilityRole="button"
        >
          <Text className="mr-2 text-lg font-bold text-white">
            {t('newAlarm.commit', { time: formattedTime })}
          </Text>
          <MaterialSymbol name="arrow_forward" size={24} className="text-white" />
        </Pressable>
      </View>
    </View>
  );
}
