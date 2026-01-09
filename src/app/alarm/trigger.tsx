import { Stack } from 'expo-router';

import { AlarmTriggerScreen } from '@/features/alarms/screens/alarm-trigger-screen';

export default function AlarmTriggerPage() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: 'fullScreenModal',
          animation: 'fade',
          gestureEnabled: false,
        }}
      />
      <AlarmTriggerScreen />
    </>
  );
}
