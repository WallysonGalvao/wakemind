# RevenueCat Usage Examples

Real-world code examples for using RevenueCat in WakeMind.

---

## 🎯 Example 1: Simple Upgrade Button

Show the paywall when user clicks "Upgrade to Pro":

```typescript
import { Button } from '@/components/ui/Button';
import { useSubscriptionStore } from '@/stores/use-subscription-store';

export function UpgradeButton() {
  const { showPaywall, isPro, isLoading } = useSubscriptionStore();

  if (isPro) {
    return null; // Hide button for Pro users
  }

  return (
    <Button
      onPress={() => showPaywall()}
      loading={isLoading}
    >
      Upgrade to Pro
    </Button>
  );
}
```

---

## 🚫 Example 2: Block Feature Behind Paywall

Show paywall when user tries to access a premium feature:

```typescript
import { Alert } from 'react-native';
import { useSubscriptionStore } from '@/stores/use-subscription-store';

export function HardDifficultyButton() {
  const { isPro, showPaywall } = useSubscriptionStore();

  const handlePress = async () => {
    if (!isPro) {
      const purchased = await showPaywall();

      if (!purchased) {
        return; // User didn't purchase
      }
    }

    // User has Pro, navigate to hard difficulty
    navigateToHardMode();
  };

  return (
    <Button onPress={handlePress}>
      Hard Difficulty {!isPro && '🔒'}
    </Button>
  );
}
```

---

## 🎨 Example 3: Feature Gate Component

Declaratively gate features:

```typescript
import { FeatureGate } from '@/features/subscription/components';
import { CustomThemeSelector } from './CustomThemeSelector';

export function ThemesScreen() {
  return (
    <View>
      {/* Always visible */}
      <DefaultThemes />

      {/* Gated behind Pro */}
      <FeatureGate
        featureName="custom_themes"
        upgradeMessage="Unlock custom themes with Pro"
      >
        <CustomThemeSelector />
      </FeatureGate>
    </View>
  );
}
```

---

## 🔢 Example 4: Limit Free Tier Usage

Limit alarm creation to 3 for free users:

```typescript
import { Alert } from 'react-native';
import { useSubscriptionStore } from '@/stores/use-subscription-store';

export function CreateAlarmButton() {
  const { isPro, featureAccess, showPaywall } = useSubscriptionStore();
  const alarms = useAlarms(); // Your alarm hook

  const handleCreateAlarm = async () => {
    // Check if user can create more alarms
    if (!featureAccess.canCreateAlarm(alarms.length)) {
      Alert.alert(
        'Limit Reached',
        `Free users can create up to ${featureAccess.maxAlarms} alarms. Upgrade to Pro for unlimited alarms!`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Upgrade',
            onPress: async () => {
              const purchased = await showPaywall();
              if (purchased) {
                navigateToCreateAlarm();
              }
            }
          },
        ]
      );
      return;
    }

    // User can create alarm
    navigateToCreateAlarm();
  };

  return (
    <Button onPress={handleCreateAlarm}>
      Create Alarm {!isPro && `(${alarms.length}/${featureAccess.maxAlarms})`}
    </Button>
  );
}
```

---

## 📊 Example 5: Conditional Stats Display

Show advanced stats only to Pro users:

```typescript
import { useFeatureAccess } from '@/features/subscription/components';
import { UpgradeCard } from './UpgradeCard';

export function StatsScreen() {
  const hasAdvancedStats = useFeatureAccess('advanced_stats');

  return (
    <ScrollView>
      {/* Basic stats - always visible */}
      <BasicStatsWidget />
      <WeeklyProgressChart />

      {/* Advanced stats - Pro only */}
      {hasAdvancedStats ? (
        <>
          <DetailedAnalytics />
          <TrendPredictions />
          <ComparisonCharts />
        </>
      ) : (
        <UpgradeCard
          feature="Advanced Statistics"
          description="Get detailed analytics and trend predictions"
        />
      )}
    </ScrollView>
  );
}
```

---

## ⚙️ Example 6: Settings with Customer Center

Add subscription management to settings:

```typescript
import { CustomerCenter } from '@/features/subscription/components';
import { useSubscriptionStore } from '@/stores/use-subscription-store';

export function SettingsScreen() {
  const { isPro } = useSubscriptionStore();

  return (
    <ScrollView>
      <SettingSection title="Account">
        {/* Show Customer Center for Pro users */}
        {isPro ? (
          <CustomerCenter />
        ) : (
          <UpgradePrompt />
        )}
      </SettingSection>

      <SettingSection title="Preferences">
        <ThemeSetting />
        <LanguageSetting />
        <NotificationSetting />
      </SettingSection>
    </ScrollView>
  );
}
```

---

## 🔄 Example 7: Restore Purchases Flow

Add a restore purchases option:

```typescript
import { Alert } from 'react-native';
import { useSubscriptionStore } from '@/stores/use-subscription-store';

export function LoginScreen() {
  const { restore } = useSubscriptionStore();
  const [restoring, setRestoring] = React.useState(false);

  const handleRestore = async () => {
    setRestoring(true);

    const success = await restore();

    setRestoring(false);

    if (success) {
      Alert.alert(
        'Restored! 🎉',
        'Your Pro subscription has been restored.',
        [{ text: 'Continue', onPress: () => navigateToApp() }]
      );
    } else {
      Alert.alert(
        'No Purchases Found',
        'We couldn\'t find any previous purchases associated with this account.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View>
      <LoginForm />

      <Button
        variant="ghost"
        onPress={handleRestore}
        loading={restoring}
      >
        Restore Purchases
      </Button>
    </View>
  );
}
```

---

## 🎁 Example 8: Welcome Screen with Paywall

Show paywall during onboarding:

```typescript
import { router } from 'expo-router';
import { useSubscriptionStore } from '@/stores/use-subscription-store';

export function WelcomeScreen() {
  const { showPaywallIfNeeded } = useSubscriptionStore();
  const [loading, setLoading] = React.useState(false);

  const handleGetStarted = async () => {
    setLoading(true);

    // Show paywall if user isn't Pro
    await showPaywallIfNeeded('onboarding');

    setLoading(false);

    // Continue to app regardless of purchase
    router.replace('/dashboard');
  };

  return (
    <View>
      <Image source={require('@/assets/welcome.png')} />
      <Text>Welcome to WakeMind!</Text>

      <Button
        onPress={handleGetStarted}
        loading={loading}
      >
        Get Started
      </Button>

      <Text variant="caption">
        7-day free trial, then $2.99/month
      </Text>
    </View>
  );
}
```

---

## 🧪 Example 9: A/B Testing Different Offerings

Show different offerings to different users:

```typescript
import { useSubscriptionStore } from '@/stores/use-subscription-store';

export function DynamicPaywall() {
  const { showPaywall } = useSubscriptionStore();

  // Determine which offering to show
  const offering = React.useMemo(() => {
    // Example: 50/50 split
    const userGroup = Math.random() < 0.5 ? 'A' : 'B';

    return userGroup === 'A' ? 'default' : 'promo_v2';
  }, []);

  const handleUpgrade = async () => {
    await showPaywall(offering);
  };

  return <Button onPress={handleUpgrade}>Upgrade</Button>;
}
```

---

## 📅 Example 10: Show Trial Status

Display remaining trial days:

```typescript
import { useSubscriptionStore } from '@/stores/use-subscription-store';
import { getActiveSubscription } from '@/services/revenue-cat-service';

export function TrialBanner() {
  const { isPro, customerInfo } = useSubscriptionStore();
  const [trialInfo, setTrialInfo] = React.useState<{
    isTrial: boolean;
    daysRemaining: number;
  } | null>(null);

  React.useEffect(() => {
    loadTrialInfo();
  }, [customerInfo]);

  const loadTrialInfo = async () => {
    const subscription = await getActiveSubscription();

    if (!subscription || !subscription.expirationDate) {
      setTrialInfo(null);
      return;
    }

    const expirationDate = new Date(subscription.expirationDate);
    const today = new Date();
    const daysRemaining = Math.ceil(
      (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    setTrialInfo({
      isTrial: daysRemaining <= 7, // Assuming 7-day trial
      daysRemaining,
    });
  };

  if (!isPro || !trialInfo?.isTrial) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <Text>
        🎉 {trialInfo.daysRemaining} days left in your free trial
      </Text>
    </View>
  );
}
```

---

## 🔔 Example 11: Paywall on Feature Access

Show paywall when user tries to use a premium feature:

```typescript
import { useSubscriptionStore } from '@/stores/use-subscription-store';

export function StreakFreezeButton() {
  const { isPro, featureAccess, showPaywall } = useSubscriptionStore();

  const handleUseStreakFreeze = async () => {
    // Check if user has streak freeze available
    if (featureAccess.streakFreeze === 0) {
      Alert.alert(
        'Premium Feature',
        'Streak Freeze is available for Pro users. Get 3 streak freezes per month!',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Upgrade',
            onPress: async () => {
              await showPaywall();
            }
          },
        ]
      );
      return;
    }

    // Use streak freeze
    useStreakFreeze();
  };

  return (
    <Button
      onPress={handleUseStreakFreeze}
      disabled={!isPro && featureAccess.streakFreeze === 0}
    >
      Use Streak Freeze {isPro && `(${featureAccess.streakFreeze} left)`}
    </Button>
  );
}
```

---

## 📱 Example 12: Deep Link to Paywall

Handle deep links that trigger paywall:

```typescript
import { useEffect } from 'react';
import { Linking } from 'react-native';
import { useSubscriptionStore } from '@/stores/use-subscription-store';

export function useDeepLinkPaywall() {
  const { showPaywall } = useSubscriptionStore();

  useEffect(() => {
    const handleURL = (event: { url: string }) => {
      const url = event.url;

      // Example: wakemind://upgrade
      if (url.includes('upgrade')) {
        showPaywall();
      }
    };

    // Handle initial URL
    Linking.getInitialURL().then((url) => {
      if (url?.includes('upgrade')) {
        showPaywall();
      }
    });

    // Handle URL events
    const subscription = Linking.addEventListener('url', handleURL);

    return () => subscription.remove();
  }, []);
}

// Usage in app
export function App() {
  useDeepLinkPaywall();

  return <AppContent />;
}
```

---

## 🎯 Example 13: Feature Gate with Custom UI

Custom upgrade prompt instead of immediate paywall:

```typescript
import { useFeatureAccess } from '@/features/subscription/components';
import { useSubscriptionStore } from '@/stores/use-subscription-store';

export function PremiumSoundsScreen() {
  const hasPremiumSounds = useFeatureAccess('premium_sounds');
  const { showPaywall } = useSubscriptionStore();

  if (!hasPremiumSounds) {
    return (
      <View style={styles.lockedScreen}>
        <Icon name="lock" size={64} />
        <Text variant="h2">Premium Alarm Sounds</Text>
        <Text variant="body">
          Access over 50 premium alarm sounds designed by sleep experts
        </Text>

        <View style={styles.features}>
          <FeatureItem icon="music" text="50+ Premium Sounds" />
          <FeatureItem icon="waveform" text="Sleep Expert Curated" />
          <FeatureItem icon="download" text="Offline Available" />
        </View>

        <Button onPress={() => showPaywall()}>
          Unlock Premium Sounds
        </Button>
      </View>
    );
  }

  return <PremiumSoundsList />;
}
```

---

## 💎 Example 14: Highlight Pro Badge

Show Pro badge for premium users:

```typescript
import { useSubscriptionStore } from '@/stores/use-subscription-store';

export function UserProfile() {
  const { isPro } = useSubscriptionStore();

  return (
    <View style={styles.profile}>
      <Avatar source={user.avatar} />
      <View>
        <View style={styles.nameRow}>
          <Text variant="h3">{user.name}</Text>
          {isPro && (
            <View style={styles.proBadge}>
              <Icon name="star" size={16} color="#FFD700" />
              <Text style={styles.proText}>PRO</Text>
            </View>
          )}
        </View>
        <Text variant="caption">{user.email}</Text>
      </View>
    </View>
  );
}
```

---

## 📈 Example 15: Track Paywall Analytics

Track where users see the paywall:

```typescript
import { AnalyticsEvents } from '@/analytics';
import { useSubscriptionStore } from '@/stores/use-subscription-store';

export function usePaywallTracking(source: string) {
  const { showPaywall } = useSubscriptionStore();

  const showTrackedPaywall = async () => {
    // Track that paywall was shown
    AnalyticsEvents.paywallViewed(source);

    const purchased = await showPaywall();

    if (purchased) {
      // Track conversion
      AnalyticsEvents.subscriptionPurchased(
        'unknown',
        'unknown',
        'unknown'
      );
    }

    return purchased;
  };

  return showTrackedPaywall;
}

// Usage
export function AlarmCreationScreen() {
  const showPaywall = usePaywallTracking('alarm_creation');

  const handleCreateAlarm = async () => {
    if (!canCreateAlarm) {
      await showPaywall();
      return;
    }

    createAlarm();
  };

  return <Button onPress={handleCreateAlarm}>Create Alarm</Button>;
}
```

---

## ✅ Quick Reference

### Check if User is Pro

```typescript
const { isPro } = useSubscriptionStore();
```

### Show Paywall

```typescript
const { showPaywall } = useSubscriptionStore();
await showPaywall();
```

### Show Paywall Only if Needed

```typescript
const { showPaywallIfNeeded } = useSubscriptionStore();
await showPaywallIfNeeded();
```

### Check Feature Access

```typescript
const { featureAccess } = useSubscriptionStore();
if (featureAccess.advancedStats) {
  // Show feature
}
```

### Restore Purchases

```typescript
const { restore } = useSubscriptionStore();
const success = await restore();
```

### Get Subscription Details

```typescript
import { getActiveSubscription } from '@/services/revenue-cat-service';
const subscription = await getActiveSubscription();
```

---

**Need more examples?** Check the [Step-by-Step Guide](./REVENUECAT_STEP_BY_STEP.md) for detailed implementation instructions.
