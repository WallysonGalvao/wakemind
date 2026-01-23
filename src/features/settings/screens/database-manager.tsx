import { useCallback, useMemo, useState } from 'react';

import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Alert, Pressable, RefreshControl, ScrollView, View } from 'react-native';

import type { IconButton } from '@/components/header';
import { Header } from '@/components/header';
import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/constants/colors';
import { db } from '@/db';
import {
  alarmCompletions,
  alarms,
  goals,
  routineCompletions,
  routineItems,
  snoozeLogs,
} from '@/db/schema';
import { seedDatabase } from '@/db/seed';
import { useShadowStyle } from '@/hooks/use-shadow-style';

// ============================================================================
// Types
// ============================================================================

interface DatabaseStats {
  alarms: number;
  completions: number;
  goals: number;
  routineItems: number;
  routineCompletions: number;
  snoozeLogs: number;
}

interface SeedOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  action: () => Promise<void>;
}

// ============================================================================
// Sub-Components
// ============================================================================

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: string;
  color: string;
}) {
  const shadowStyle = useShadowStyle('sm');

  return (
    <View
      className="flex-1 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-surface-dark"
      style={shadowStyle}
    >
      <View className="flex-row items-center gap-2">
        <MaterialSymbol name={icon} size={20} color={color} />
        <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</Text>
      </View>
      <Text className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{value}</Text>
    </View>
  );
}

function SeedOptionCard({ option, onPress }: { option: SeedOption; onPress: () => void }) {
  const shadowStyle = useShadowStyle('sm');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={option.title}
      accessibilityHint={option.description}
      onPress={onPress}
      className="flex-row items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 active:bg-slate-50 dark:border-slate-800 dark:bg-surface-dark dark:active:bg-slate-900"
      style={shadowStyle}
    >
      <View className={`h-12 w-12 items-center justify-center rounded-full ${option.iconBg}`}>
        <MaterialSymbol name={option.icon} size={24} color={option.iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-slate-900 dark:text-white">
          {option.title}
        </Text>
        <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">{option.description}</Text>
      </View>
      <MaterialSymbol name="chevron_right" size={20} color={COLORS.gray[400]} />
    </Pressable>
  );
}

function DangerZone({ onClearAll }: { onClearAll: () => void }) {
  const shadowStyle = useShadowStyle('sm');

  return (
    <View className="gap-4">
      <Text className="px-1 text-xs font-bold uppercase tracking-wider text-red-500 dark:text-red-400">
        Danger Zone
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Clear all database data"
        accessibilityHint="Warning: This will permanently delete all data"
        onPress={onClearAll}
        className="flex-row items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 active:bg-red-100 dark:border-red-900 dark:bg-red-950 dark:active:bg-red-900"
        style={shadowStyle}
      >
        <View className="flex-row items-center gap-3">
          <MaterialSymbol name="delete_forever" size={24} color={COLORS.red[500]} />
          <View>
            <Text className="text-base font-semibold text-red-700 dark:text-red-400">
              Clear All Data
            </Text>
            <Text className="mt-1 text-xs text-red-600 dark:text-red-500">
              Permanently delete all database records
            </Text>
          </View>
        </View>
        <MaterialSymbol name="warning" size={20} color={COLORS.red[500]} />
      </Pressable>
    </View>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function DatabaseManagerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<DatabaseStats>({
    alarms: 0,
    completions: 0,
    goals: 0,
    routineItems: 0,
    routineCompletions: 0,
    snoozeLogs: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  // Load database stats
  const loadStats = useCallback(async () => {
    try {
      const [
        alarmsData,
        completionsData,
        goalsData,
        routineItemsData,
        routineCompletionsData,
        snoozeLogsData,
      ] = await Promise.all([
        db.select().from(alarms),
        db.select().from(alarmCompletions),
        db.select().from(goals),
        db.select().from(routineItems),
        db.select().from(routineCompletions),
        db.select().from(snoozeLogs),
      ]);

      setStats({
        alarms: alarmsData.length,
        completions: completionsData.length,
        goals: goalsData.length,
        routineItems: routineItemsData.length,
        routineCompletions: routineCompletionsData.length,
        snoozeLogs: snoozeLogsData.length,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  }, [loadStats]);

  // Load stats on mount
  useState(() => {
    loadStats();
  });

  // Seed functions
  const seedFullDatabase = async () => {
    try {
      await seedDatabase();
      Alert.alert('Success', 'Database seeded with complete sample data!');
      await loadStats();
    } catch (error) {
      Alert.alert('Error', 'Failed to seed database. Check console for details.');
      console.error(error);
    }
  };

  const seedSampleAlarms = async () => {
    try {
      const sampleAlarms = [
        {
          id: `alarm-${Date.now()}-1`,
          time: '06:00',
          period: 'AM',
          challenge: 'Math Challenge',
          challengeType: 'math',
          challengeIcon: 'calculate',
          schedule: 'Mon, Tue, Wed, Thu, Fri',
          isEnabled: true,
          difficulty: 'medium',
          protocols: JSON.stringify([]),
          createdAt: dayjs().toISOString(),
          updatedAt: dayjs().toISOString(),
        },
        {
          id: `alarm-${Date.now()}-2`,
          time: '07:30',
          period: 'AM',
          challenge: 'Memory Challenge',
          challengeType: 'memory',
          challengeIcon: 'psychology',
          schedule: 'Sat, Sun',
          isEnabled: true,
          difficulty: 'easy',
          protocols: JSON.stringify([]),
          createdAt: dayjs().toISOString(),
          updatedAt: dayjs().toISOString(),
        },
      ];

      for (const alarm of sampleAlarms) {
        await db.insert(alarms).values(alarm);
      }

      Alert.alert('Success', 'Added 2 sample alarms!');
      await loadStats();
    } catch (error) {
      Alert.alert('Error', 'Failed to add sample alarms.');
      console.error(error);
    }
  };

  const seedPerformanceData = async () => {
    try {
      const today = dayjs();
      const completionsToAdd = [];

      // Generate 30 days of performance data
      for (let i = 0; i < 30; i++) {
        const date = today.subtract(i, 'day');
        completionsToAdd.push({
          id: `completion-${Date.now()}-${i}`,
          alarmId: null,
          targetTime: '06:00',
          actualTime: date
            .hour(6)
            .minute(Math.floor(Math.random() * 20))
            .toISOString(),
          cognitiveScore: Math.floor(Math.random() * 30) + 70, // 70-100
          reactionTime: Math.floor(Math.random() * 5000) + 3000, // 3-8 seconds
          challengeType: ['math', 'memory', 'logic'][Math.floor(Math.random() * 3)],
          date: date.format('YYYY-MM-DD'),
        });
      }

      for (const completion of completionsToAdd) {
        await db.insert(alarmCompletions).values(completion);
      }

      Alert.alert('Success', 'Added 30 days of performance data!');
      await loadStats();
    } catch (error) {
      Alert.alert('Error', 'Failed to add performance data.');
      console.error(error);
    }
  };

  const seedGoals = async () => {
    try {
      const sampleGoals = [
        {
          id: `goal-${Date.now()}-1`,
          type: 'streak',
          target: 30,
          currentValue: 7,
          startDate: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
          endDate: dayjs().add(23, 'day').format('YYYY-MM-DD'),
          isCompleted: false,
          completedAt: null,
          createdAt: dayjs().toISOString(),
          updatedAt: dayjs().toISOString(),
        },
        {
          id: `goal-${Date.now()}-2`,
          type: 'execution_score',
          target: 90,
          currentValue: 85,
          startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
          endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
          isCompleted: false,
          completedAt: null,
          createdAt: dayjs().toISOString(),
          updatedAt: dayjs().toISOString(),
        },
      ];

      for (const goal of sampleGoals) {
        await db.insert(goals).values(goal);
      }

      Alert.alert('Success', 'Added 2 sample goals!');
      await loadStats();
    } catch (error) {
      Alert.alert('Error', 'Failed to add goals.');
      console.error(error);
    }
  };

  const seedRoutineItems = async () => {
    try {
      const items = [
        { title: 'Drink Water', icon: 'water_drop', order: 1 },
        { title: 'Exercise', icon: 'exercise', order: 2 },
        { title: 'Breakfast', icon: 'restaurant', order: 3 },
        { title: 'Meditation', icon: 'self_improvement', order: 4 },
        { title: 'Review Goals', icon: 'flag', order: 5 },
      ];

      for (const item of items) {
        await db.insert(routineItems).values({
          id: `routine-${Date.now()}-${item.order}`,
          title: item.title,
          icon: item.icon,
          order: item.order,
          isEnabled: true,
          createdAt: dayjs().toISOString(),
          updatedAt: dayjs().toISOString(),
        });
      }

      Alert.alert('Success', 'Added 5 routine items!');
      await loadStats();
    } catch (error) {
      Alert.alert('Error', 'Failed to add routine items.');
      console.error(error);
    }
  };

  const seedSnoozeData = async () => {
    try {
      const today = dayjs();
      const logsToAdd = [];

      // Generate 14 days of snooze data
      for (let i = 0; i < 14; i++) {
        const date = today.subtract(i, 'day');
        const snoozeCount = Math.floor(Math.random() * 4); // 0-3 snoozes

        logsToAdd.push({
          id: `snooze-${Date.now()}-${i}`,
          alarmId: `alarm-sample-${i}`,
          triggeredAt: date.hour(6).minute(0).toISOString(),
          snoozedAt: date.hour(6).minute(5).toISOString(),
          snoozeCount,
          finalAction: snoozeCount === 0 ? 'dismissed' : 'snoozed',
          date: date.format('YYYY-MM-DD'),
          createdAt: dayjs().toISOString(),
        });
      }

      for (const log of logsToAdd) {
        await db.insert(snoozeLogs).values(log);
      }

      Alert.alert('Success', 'Added 14 days of snooze data!');
      await loadStats();
    } catch (error) {
      Alert.alert('Error', 'Failed to add snooze data.');
      console.error(error);
    }
  };

  const clearAllData = async () => {
    try {
      await db.delete(alarms);
      await db.delete(alarmCompletions);
      await db.delete(goals);
      await db.delete(routineItems);
      await db.delete(routineCompletions);
      await db.delete(snoozeLogs);

      Alert.alert('Success', 'All data cleared!');
      await loadStats();
    } catch (error) {
      Alert.alert('Error', 'Failed to clear data.');
      console.error(error);
    }
  };

  const clearTable = async (
    tableName: string,
    table:
      | typeof alarms
      | typeof alarmCompletions
      | typeof goals
      | typeof routineItems
      | typeof snoozeLogs
  ) => {
    try {
      await db.delete(table);
      Alert.alert('Success', `Cleared ${tableName} table!`);
      await loadStats();
    } catch (error) {
      Alert.alert('Error', `Failed to clear ${tableName} table.`);
      console.error(error);
    }
  };

  const handleSeedOption = (action: () => Promise<void>, confirmMessage: string) => {
    Alert.alert('Confirm', confirmMessage, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Continue',
        style: 'default',
        onPress: action,
      },
    ]);
  };

  const handleClearAll = () => {
    Alert.alert(
      'Warning',
      'This will permanently delete ALL data from the database. This action cannot be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: clearAllData,
        },
      ]
    );
  };

  const seedOptions: SeedOption[] = [
    {
      id: 'full',
      title: 'Seed Complete Database',
      description: 'Populate all tables with comprehensive sample data',
      icon: 'database',
      iconColor: COLORS.brandPrimary,
      iconBg: 'bg-brand-primary/10',
      action: seedFullDatabase,
    },
    {
      id: 'alarms',
      title: 'Add Sample Alarms',
      description: 'Create 2 sample alarms (weekday & weekend)',
      icon: 'alarm',
      iconColor: COLORS.blue[500],
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      action: seedSampleAlarms,
    },
    {
      id: 'performance',
      title: 'Add Performance Data',
      description: 'Generate 30 days of alarm completion history',
      icon: 'trending_up',
      iconColor: COLORS.green[500],
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      action: seedPerformanceData,
    },
    {
      id: 'goals',
      title: 'Add Sample Goals',
      description: 'Create 2 active goals (streak & execution score)',
      icon: 'flag',
      iconColor: COLORS.purple[500],
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      action: seedGoals,
    },
    {
      id: 'routine',
      title: 'Add Routine Items',
      description: 'Create 5 morning routine checklist items',
      icon: 'checklist',
      iconColor: COLORS.orange[500],
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      action: seedRoutineItems,
    },
    {
      id: 'snooze',
      title: 'Add Snooze Data',
      description: 'Generate 14 days of snooze behavior data',
      icon: 'snooze',
      iconColor: COLORS.red[500],
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      action: seedSnoozeData,
    },
  ];

  const clearOptions = [
    {
      id: 'alarms',
      title: 'Clear Alarms',
      table: alarms,
    },
    {
      id: 'completions',
      title: 'Clear Completions',
      table: alarmCompletions,
    },
    {
      id: 'goals',
      title: 'Clear Goals',
      table: goals,
    },
    {
      id: 'routine',
      title: 'Clear Routine Items',
      table: routineItems,
    },
    {
      id: 'snooze',
      title: 'Clear Snooze Logs',
      table: snoozeLogs,
    },
  ];

  const rightIcons: IconButton[] = [
    {
      icon: <MaterialSymbol name="refresh" size={24} color={COLORS.brandPrimary} />,
      onPress: onRefresh,
    },
  ];

  const leftIcons = useMemo(
    () => [
      {
        icon: (
          <MaterialSymbol name="arrow_back" size={24} className="text-slate-900 dark:text-white" />
        ),
        onPress: () => router.back(),
      } as IconButton,
    ],
    [router]
  );

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <View style={{ paddingTop: insets.top }}>
        <Header title="Database Manager" leftIcons={leftIcons} rightIcons={rightIcons} />
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 gap-6"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Stats Overview */}
        <View className="gap-4">
          <Text className="px-1 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Database Statistics
          </Text>
          <View className="flex-row gap-3">
            <StatCard label="Alarms" value={stats.alarms} icon="alarm" color={COLORS.blue[500]} />
            <StatCard
              label="Completions"
              value={stats.completions}
              icon="check_circle"
              color={COLORS.green[500]}
            />
          </View>
          <View className="flex-row gap-3">
            <StatCard label="Goals" value={stats.goals} icon="flag" color={COLORS.purple[500]} />
            <StatCard
              label="Routine"
              value={stats.routineItems}
              icon="checklist"
              color={COLORS.orange[500]}
            />
          </View>
          <View className="flex-row gap-3">
            <StatCard
              label="Snooze Logs"
              value={stats.snoozeLogs}
              icon="snooze"
              color={COLORS.red[500]}
            />
            <StatCard
              label="R. Completions"
              value={stats.routineCompletions}
              icon="done_all"
              color={COLORS.teal[500]}
            />
          </View>
        </View>

        {/* Seed Options */}
        <View className="gap-4">
          <Text className="px-1 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Seed Database
          </Text>
          {seedOptions.map((option) => (
            <SeedOptionCard
              key={option.id}
              option={option}
              onPress={() => handleSeedOption(option.action, `Add ${option.title.toLowerCase()}?`)}
            />
          ))}
        </View>

        {/* Clear Individual Tables */}
        <View className="gap-4">
          <Text className="px-1 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Clear Individual Tables
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {clearOptions.map((option) => (
              <Pressable
                key={option.id}
                accessibilityRole="button"
                accessibilityLabel={option.title}
                accessibilityHint={`Clear ${option.title.toLowerCase()} from database`}
                onPress={() =>
                  Alert.alert('Confirm', `Clear ${option.title.toLowerCase()}?`, [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Clear',
                      style: 'destructive',
                      onPress: () => clearTable(option.title, option.table),
                    },
                  ])
                }
                className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-2 active:bg-orange-100 dark:border-orange-900 dark:bg-orange-950"
              >
                <Text className="text-sm font-medium text-orange-700 dark:text-orange-400">
                  {option.title}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Danger Zone */}
        <DangerZone onClearAll={handleClearAll} />
      </ScrollView>
    </View>
  );
}
