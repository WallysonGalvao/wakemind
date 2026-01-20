import { router, Stack } from 'expo-router';
import RevenueCatUI from 'react-native-purchases-ui';

import { View } from 'react-native';

import { useSubscriptionStore } from '@/stores/use-subscription-store';

export default function PaywallModal() {
  const { refreshStatus } = useSubscriptionStore();

  return (
    <>
      <Stack.Screen
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <View style={{ flex: 1 }}>
        <RevenueCatUI.Paywall
          options={{
            offering: undefined, // Uses default offering
            displayCloseButton: true,
          }}
          onPurchaseCompleted={async ({ customerInfo }) => {
            console.log('[Paywall] Purchase completed:', customerInfo);
            await refreshStatus();
            router.back();
          }}
          onPurchaseCancelled={() => {
            console.log('[Paywall] Purchase cancelled');
          }}
          onRestoreCompleted={async ({ customerInfo }) => {
            console.log('[Paywall] Restore completed:', customerInfo);
            await refreshStatus();
            router.back();
          }}
          onRestoreError={({ error }) => {
            console.error('[Paywall] Restore error:', error);
          }}
          onDismiss={() => {
            router.back();
          }}
        />
      </View>
    </>
  );
}
