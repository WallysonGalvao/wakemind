import React, { useState } from 'react';

import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Alert, Pressable, ScrollView, View } from 'react-native';

import { BackupProtocolsSection } from '../components/backup-protocols-section';
import { CognitiveActivationSection } from '../components/cognitive-activation-section';
import { DifficultySelector } from '../components/difficulty-selector';
import { TimePickerWheel } from '../components/time-picker-wheel';

import { Header } from '@/components/header';
import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { useCustomShadow } from '@/hooks/use-shadow-style';
import { useAlarmsStore } from '@/stores/use-alarms-store';
import { BackupProtocolId, ChallengeType, DifficultyLevel, Period } from '@/types/alarm-enums';

const BRAND_PRIMARY_SHADOW = 'rgba(19, 91, 236, 0.3)';

const DEFAULT_HOUR = 6;
const DEFAULT_MINUTE = 0;
const DEFAULT_PERIOD = Period.AM;

const CHALLENGE_ICONS: Record<ChallengeType, string> = {
  [ChallengeType.MATH]: 'calculate',
  [ChallengeType.MEMORY]: 'psychology',
  [ChallengeType.LOGIC]: 'lightbulb',
};

export default function NewAlarmScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const addAlarm = useAlarmsStore((state) => state.addAlarm);

  // CTA shadow style
  const ctaShadow = useCustomShadow({
    offset: { width: 0, height: 4 },
    opacity: 1,
    radius: 14,
    elevation: 4,
    color: BRAND_PRIMARY_SHADOW,
  });

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
    const challengeIcon = CHALLENGE_ICONS[selectedChallenge];
    const challengeLabel = t(`newAlarm.challenges.${selectedChallenge}.title`);

    try {
      addAlarm({
        time: timeString,
        period,
        challenge: challengeLabel,
        challengeIcon,
        schedule: 'Daily',
        difficulty,
        protocols,
      });

      router.back();
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(t('newAlarm.validationError.title'), error.message, [
          { text: t('common.ok'), style: 'default' },
        ]);
      } else {
        // Handle unexpected errors
        Alert.alert(t('newAlarm.error.title'), t('newAlarm.error.message'), [
          { text: t('common.ok'), style: 'default' },
        ]);
      }
    }
  };

  const formattedTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;

  return (
    <View
      className="flex-1 bg-background-light dark:bg-background-dark"
      style={{ paddingTop: insets.top }}
    >
      {/* Header */}
      <Header
        title={t('newAlarm.title')}
        leftIcons={[
          {
            icon: (
              <MaterialSymbol name="close" size={24} className="text-slate-900 dark:text-white" />
            ),
            onPress: handleClose,
            accessibilityLabel: t('common.close'),
          },
        ]}
        rightIcons={[
          {
            label: (
              <Text className="text-base font-medium text-slate-500 dark:text-slate-400">
                {t('newAlarm.reset')}
              </Text>
            ),
            onPress: handleReset,
            accessibilityLabel: t('newAlarm.reset'),
          },
        ]}
      />

      {/* Content */}
      <ScrollView contentContainerClassName="pb-32" showsVerticalScrollIndicator={false}>
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
        <View className="mx-4 my-4 h-px bg-slate-200 dark:bg-surface-highlight" />

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
          style={ctaShadow}
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
