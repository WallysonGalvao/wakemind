import { lazy, Suspense } from 'react';

import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { COLORS } from '@/constants/colors';

const AlarmTriggerScreen = lazy(() => import('@/features/alarms/screens/alarm-trigger-screen'));

export default function TriggerRoute() {
  return (
    <Suspense
      fallback={
        <View style={styles.fallback}>
          <ActivityIndicator size="large" color={COLORS.brandPrimary} />
        </View>
      }
    >
      <AlarmTriggerScreen />
    </Suspense>
  );
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F1621',
  },
});
