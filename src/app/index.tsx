import { Redirect } from 'expo-router';

import { useSettingsStore } from '@/stores/use-settings-store';

export default function Index() {
  const hasCompletedOnboarding = useSettingsStore((state) => state.hasCompletedOnboarding);

  if (!hasCompletedOnboarding) {
    return <Redirect href="/onboarding/problem" />;
  }

  return <Redirect href="/(tabs)" />;
}
