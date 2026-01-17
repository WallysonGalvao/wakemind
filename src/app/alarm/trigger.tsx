import { Stack } from 'expo-router';

import AlarmTriggerScreen from '@/features/alarms/screens/alarm-trigger-screen';

export default function TriggerRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          // Disable back gesture on iOS
          gestureEnabled: false,
          // Hide header back button
          headerBackVisible: false,
          // Prevent the user from dismissing the screen
          headerLeft: () => null,
        }}
      />
      <AlarmTriggerScreen />
    </>
  );
}
