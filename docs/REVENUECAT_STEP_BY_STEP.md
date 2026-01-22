# RevenueCat Integration Guide for WakeMind

Complete step-by-step guide for integrating RevenueCat SDK with modern Paywall UI and Customer Center support.

---

## 📦 Step 1: Installation

### Using Yarn (Recommended)

```bash
yarn add react-native-purchases react-native-purchases-ui
```

### Using npm

```bash
npm install react-native-purchases react-native-purchases-ui
```

### iOS Setup

```bash
cd ios && pod install && cd ..
```

---

## 🔑 Step 2: API Key Configuration

### Test API Key (Development)

For development and testing, use the test API key:

```typescript
// src/configs/revenue-cat.ts
export const REVENUE_CAT_CONFIG = {
  apiKey: __DEV__
    ? 'test_brhnDrWRyBlNoHVTqHlmssTpNhV' // Test key
    : (Platform.select({
        ios: Constants.expoConfig?.extra?.revenueCatAppleApiKey || '',
        android: Constants.expoConfig?.extra?.revenueCatGoogleApiKey || '',
      }) as string),
  enableDebugLogs: __DEV__,
};
```

### Production API Keys

1. Go to [RevenueCat Dashboard](https://app.revenuecat.com)
2. Create a new app
3. Get your API keys:
   - iOS: `appl_xxxxxxxxx`
   - Android: `goog_xxxxxxxxx`

4. Add to `.env`:

```bash
REVENUECAT_APPLE_API_KEY=appl_xxxxxxxxx
REVENUECAT_GOOGLE_API_KEY=goog_xxxxxxxxx
```

---

## 🎯 Step 3: Product Configuration

### Create Products in RevenueCat Dashboard

1. **Entitlement**: Create "WakeMind Pro"
2. **Products**:
   - `monthly` - Monthly subscription
   - `yearly` - Yearly subscription
   - `lifetime` - Lifetime purchase

### Configure in Code

```typescript
// src/configs/revenue-cat.ts
export enum ProductId {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  LIFETIME = 'lifetime',
}

export enum Entitlement {
  PRO = 'WakeMind Pro',
}
```

---

## 🚀 Step 4: Initialize SDK

### In App Layout

```typescript
// src/app/_layout.tsx
import { useSubscriptionStore } from '@/stores/use-subscription-store';

export default function RootLayout() {
  const { initialize } = useSubscriptionStore();

  React.useEffect(() => {
    // Initialize RevenueCat on app start
    initialize();
  }, []);

  // ... rest of your layout
}
```

---

## 💳 Step 5: Using the Modern Paywall UI

RevenueCat provides a prebuilt, configurable paywall that you can customize entirely from the dashboard.

### Method 1: Show Paywall from Store

```typescript
import { useSubscriptionStore } from '@/stores/use-subscription-store';

function UpgradeButton() {
  const { showPaywall, isPro } = useSubscriptionStore();

  const handleUpgrade = async () => {
    const purchased = await showPaywall();

    if (purchased) {
      console.log('User purchased!');
    }
  };

  if (isPro) return null;

  return <Button onPress={handleUpgrade}>Upgrade to Pro</Button>;
}
```

### Method 2: Show Paywall Only if Needed

```typescript
function FeatureButton() {
  const { showPaywallIfNeeded } = useSubscriptionStore();

  const handleFeatureAccess = async () => {
    // Show paywall only if user doesn't have Pro
    const hasAccess = await showPaywallIfNeeded();

    if (hasAccess) {
      // User already had Pro or just purchased
      navigateToFeature();
    }
  };

  return <Button onPress={handleFeatureAccess}>Access Feature</Button>;
}
```

### Method 3: Direct Service Call

```typescript
import { presentPaywallUI } from '@/services/revenue-cat-service';

async function showUpgradeScreen() {
  const result = await presentPaywallUI({
    requiredEntitlement: 'WakeMind Pro',
    offering: 'default', // optional
  });

  if (!result.userCancelled) {
    console.log('Purchase completed!');
  }
}
```

---

## 🎨 Step 6: Configure Paywall in Dashboard

1. Go to **RevenueCat Dashboard** → **Paywalls**
2. Click **Create Paywall**
3. Configure:
   - **Template**: Choose a design
   - **Colors**: Match your brand
   - **Text**: Customize copy
   - **Features**: List premium benefits
   - **Packages**: Select which plans to show

4. **Attach to Offering**:
   - Go to **Offerings** → **default**
   - Set your configured paywall

---

## 🔐 Step 7: Check Entitlements

### Check if User is Pro

```typescript
import { useSubscriptionStore } from '@/stores/use-subscription-store';

function PremiumFeature() {
  const { isPro } = useSubscriptionStore();

  if (!isPro) {
    return <UpgradePrompt />;
  }

  return <PremiumContent />;
}
```

### Feature Gate Component

```typescript
import { FeatureGate } from '@/features/subscription/components';

function App() {
  return (
    <FeatureGate
      featureName="custom_themes"
      upgradeMessage="Upgrade to unlock custom themes"
    >
      <CustomThemeSelector />
    </FeatureGate>
  );
}
```

### Check Specific Feature Access

```typescript
const { featureAccess } = useSubscriptionStore();

// Check if user can create more alarms
if (!featureAccess.canCreateAlarm(currentAlarmCount)) {
  showUpgradePrompt();
  return;
}

// Check specific features
if (featureAccess.advancedStats) {
  showAdvancedStats();
}

if (featureAccess.streakFreeze > 0) {
  showStreakFreezeOption();
}
```

---

## 👤 Step 8: Customer Center

The Customer Center helps users manage their subscriptions.

### Add to Settings Screen

```typescript
import { CustomerCenter } from '@/features/subscription/components';

function SettingsScreen() {
  return (
    <ScrollView>
      <SettingSection title="Account">
        <CustomerCenter />
      </SettingSection>
    </ScrollView>
  );
}
```

### Features Provided

- ✅ View subscription details
- ✅ See expiration/renewal date
- ✅ Manage subscription (platform-specific)
- ✅ Restore purchases
- ✅ Cancel subscription

---

## 📱 Step 9: Handle Customer Info

### Listen to Customer Info Updates

```typescript
const { customerInfo, refreshStatus } = useSubscriptionStore();

React.useEffect(() => {
  // Refresh when app becomes active
  const subscription = AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      refreshStatus();
    }
  });

  return () => subscription.remove();
}, []);
```

### Get Active Subscription Details

```typescript
import { getActiveSubscription } from '@/services/revenue-cat-service';

async function showSubscriptionInfo() {
  const subscription = await getActiveSubscription();

  if (subscription) {
    console.log('Product:', subscription.productId);
    console.log('Expires:', subscription.expirationDate);
    console.log('Will Renew:', subscription.willRenew);
  }
}
```

---

## 🔄 Step 10: Restore Purchases

### Add Restore Button

```typescript
import { useSubscriptionStore } from '@/stores/use-subscription-store';

function RestorePurchasesButton() {
  const { restore } = useSubscriptionStore();
  const [loading, setLoading] = React.useState(false);

  const handleRestore = async () => {
    setLoading(true);
    const success = await restore();
    setLoading(false);

    if (success) {
      Alert.alert('Success', 'Your purchases have been restored!');
    } else {
      Alert.alert('No Purchases Found', 'No previous purchases to restore.');
    }
  };

  return (
    <Button
      onPress={handleRestore}
      loading={loading}
    >
      Restore Purchases
    </Button>
  );
}
```

---

## 🧪 Step 11: Testing

### iOS Testing

1. **Create Sandbox Test User**:
   - App Store Connect → Users and Access → Sandbox Testers
   - Create a test account

2. **Sign Out of Production App Store**:
   - Settings → App Store → Sign Out

3. **Test Purchase**:
   - Run app on device
   - Initiate purchase
   - Sign in with sandbox account when prompted

4. **Test Restore**:
   - Delete app
   - Reinstall
   - Click "Restore Purchases"

### Android Testing

1. **Add License Testers**:
   - Google Play Console → Setup → License Testing
   - Add test email addresses

2. **Create Test Track**:
   - Release → Testing → Internal Testing
   - Upload build

3. **Test Purchase**:
   - Install from Internal Testing track
   - Make purchase (no real charges for testers)

4. **Test Restore**:
   - Clear app data
   - Click "Restore Purchases"

---

## 📊 Step 12: Analytics Integration

All subscription events are automatically tracked:

```typescript
// These are called automatically by the service
AnalyticsEvents.paywallViewed(source);
AnalyticsEvents.subscriptionPurchased(productId, price, period);
AnalyticsEvents.subscriptionFailed(productId, error);
AnalyticsEvents.subscriptionRestored();
AnalyticsEvents.featureGated(featureName, isPro);
```

### Track Custom Events

```typescript
import { AnalyticsEvents } from '@/analytics';

// When user hits paywall
AnalyticsEvents.paywallViewed('alarm_creation');

// When user is blocked by feature gate
AnalyticsEvents.featureGated('hard_difficulty', false);
```

---

## 🎯 Best Practices

### 1. Always Check Entitlement, Not Product ID

```typescript
// ✅ Good
const isPro = customerInfo.entitlements.active['WakeMind Pro'] !== undefined;

// ❌ Bad
const isPro = customerInfo.activeSubscriptions.includes('monthly');
```

### 2. Refresh on App Resume

```typescript
React.useEffect(() => {
  const subscription = AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      refreshStatus();
    }
  });
  return () => subscription.remove();
}, []);
```

### 3. Handle Errors Gracefully

```typescript
const { showPaywall } = useSubscriptionStore();

try {
  await showPaywall();
} catch (error) {
  // Don't block user flow
  console.error('Paywall error:', error);
  Alert.alert('Error', 'Failed to load upgrade options. Please try again.');
}
```

### 4. Use Feature Gates

```typescript
// Don't repeat checks everywhere
<FeatureGate featureName="feature_name">
  <PremiumFeature />
</FeatureGate>
```

### 5. Provide Restore Option

```typescript
// Always visible for users who reinstall
<Button variant="ghost" onPress={restore}>
  Restore Purchases
</Button>
```

---

## 🐛 Troubleshooting

### "No offerings found"

**Cause**: Offerings not configured or synced

**Solution**:

1. Check RevenueCat Dashboard → Offerings
2. Ensure default offering exists
3. Wait 5-10 minutes for sync
4. Restart app

### "Invalid product IDs"

**Cause**: Product IDs don't match stores

**Solution**:

1. Verify IDs in App Store Connect / Google Play
2. Ensure IDs match exactly in code
3. Check that products are approved

### Paywall doesn't show

**Cause**: No paywall configured in dashboard

**Solution**:

1. Go to RevenueCat Dashboard → Paywalls
2. Create and configure a paywall
3. Attach to your offering

### Purchases not restoring

**Cause**: Different Apple ID / Google account

**Solution**:

1. Ensure user is signed in to correct account
2. Check sandbox account on iOS
3. Verify license tester on Android

---

## 📚 Additional Resources

- [RevenueCat Documentation](https://www.revenuecat.com/docs)
- [Paywall Builder Guide](https://www.revenuecat.com/docs/tools/paywalls)
- [Customer Center Guide](https://www.revenuecat.com/docs/tools/customer-center)
- [Testing Purchases](https://www.revenuecat.com/docs/test-and-launch/sandbox)
- [Migration Guide](https://www.revenuecat.com/docs/getting-started/installation/reactnative)

---

## ✅ Integration Checklist

- [ ] Install `react-native-purchases` and `react-native-purchases-ui`
- [ ] Configure API key (test key for development)
- [ ] Create entitlement "WakeMind Pro" in dashboard
- [ ] Create products: monthly, yearly, lifetime
- [ ] Configure default offering
- [ ] Create and design paywall in dashboard
- [ ] Initialize SDK in app layout
- [ ] Add paywall trigger buttons
- [ ] Implement feature gates
- [ ] Add Customer Center to settings
- [ ] Add restore purchases option
- [ ] Test purchases in sandbox
- [ ] Test restore functionality
- [ ] Configure production API keys
- [ ] Submit products for review in stores
- [ ] Test in production before launch

---

**Implementation Status**: ✅ Complete

All code is implemented and ready to use. Just configure your RevenueCat dashboard and you're good to go!
