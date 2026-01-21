# RevenueCat Cheat Sheet

Quick reference for using RevenueCat in WakeMind.

---

## 🔧 Common Imports

```typescript
// Store (most common)
import { useSubscriptionStore } from '@/stores/use-subscription-store';

// Components
import { FeatureGate, CustomerCenter } from '@/features/subscription/components';

// Services (for advanced use)
import { presentPaywallUI, getActiveSubscription, isProUser } from '@/services/revenue-cat-service';
```

---

## ✅ Quick Checks

### Is user Pro?

```typescript
const { isPro } = useSubscriptionStore();
```

### Check specific feature

```typescript
const { featureAccess } = useSubscriptionStore();

featureAccess.unlimitedAlarms; // boolean
featureAccess.advancedStats; // boolean
featureAccess.customThemes; // boolean
featureAccess.streakFreeze; // number (0-3)
featureAccess.maxAlarms; // number (3 for free, Infinity for pro)
featureAccess.maxHistoryDays; // number (30 for free, 365 for pro)
```

---

## 🎯 Show Paywall

### Basic

```typescript
const { showPaywall } = useSubscriptionStore();

await showPaywall();
```

### Only if needed

```typescript
const { showPaywallIfNeeded } = useSubscriptionStore();

await showPaywallIfNeeded();
```

### With specific offering

```typescript
await showPaywall('onboarding');
```

---

## 🚫 Block Features

### Inline check

```typescript
const { isPro, showPaywall } = useSubscriptionStore();

const handleFeature = async () => {
  if (!isPro) {
    await showPaywall();
    return;
  }

  // Feature code
};
```

### Feature Gate component

```typescript
<FeatureGate featureName="custom_themes">
  <PremiumContent />
</FeatureGate>
```

### Feature Gate hook

```typescript
const hasFeature = useFeatureAccess('advanced_stats');

if (!hasFeature) {
  return <UpgradePrompt />;
}
```

---

## 🔄 Restore Purchases

```typescript
const { restore } = useSubscriptionStore();

const success = await restore();

if (success) {
  // Restored!
} else {
  // No purchases found
}
```

---

## 👤 Customer Center

```typescript
import { CustomerCenter } from '@/features/subscription/components';

<CustomerCenter />
```

---

## 🔢 Limit Free Tier

### Alarm creation limit

```typescript
const { featureAccess } = useSubscriptionStore();
const alarms = useAlarms();

if (!featureAccess.canCreateAlarm(alarms.length)) {
  // Show upgrade prompt
  return;
}

// Create alarm
```

### Check difficulty access

```typescript
const difficulties = ['easy', 'medium', 'hard'];
const available = difficulties.filter((d) => featureAccess.availableDifficulties.includes(d));
```

---

## 📊 Get Subscription Info

```typescript
import { getActiveSubscription } from '@/services/revenue-cat-service';

const subscription = await getActiveSubscription();

subscription.productId; // 'monthly' | 'yearly'
subscription.expirationDate; // '2026-02-20'
subscription.willRenew; // true | false
subscription.periodType; // 'monthly' | 'yearly' | null
```

---

## 🎨 UI Patterns

### Upgrade button

```typescript
const { isPro, showPaywall } = useSubscriptionStore();

if (isPro) return null;

return <Button onPress={showPaywall}>Upgrade to Pro</Button>;
```

### Pro badge

```typescript
const { isPro } = useSubscriptionStore();

{isPro && <Badge>PRO</Badge>}
```

### Feature count

```typescript
const { isPro, featureAccess } = useSubscriptionStore();

<Text>
  Alarms: {alarms.length}
  {!isPro && ` / ${featureAccess.maxAlarms}`}
</Text>
```

---

## 🔔 Alerts

### Limit reached

```typescript
Alert.alert('Limit Reached', 'Free users can create up to 3 alarms.', [
  { text: 'Cancel', style: 'cancel' },
  { text: 'Upgrade', onPress: () => showPaywall() },
]);
```

### Success

```typescript
Alert.alert('Welcome to Pro! 🎉', 'You now have access to all premium features.', [
  { text: 'Continue' },
]);
```

---

## 🧪 Testing

### Check initialization

```typescript
const { customerInfo, error } = useSubscriptionStore();

console.log('Customer Info:', customerInfo);
console.log('Error:', error);
```

### Force refresh

```typescript
const { refreshStatus } = useSubscriptionStore();

await refreshStatus();
```

### Check offerings

```typescript
const { offerings } = useSubscriptionStore();

console.log('Available packages:', offerings);
```

---

## 📱 Platform-Specific

### Manage subscription URL

```typescript
import { getManageSubscriptionURL } from '@/services/revenue-cat-service';

const url = await getManageSubscriptionURL();

if (url) {
  await WebBrowser.openBrowserAsync(url);
}
```

### Platform fallback

```typescript
const fallbackURL = Platform.select({
  ios: 'https://apps.apple.com/account/subscriptions',
  android: 'https://play.google.com/store/account/subscriptions',
});
```

---

## 🎯 Product IDs

```typescript
// These are your product IDs
'monthly'; // Monthly subscription
'yearly'; // Yearly subscription

// Entitlement
'WakeMind Pro';
```

---

## 📈 Analytics

```typescript
import { AnalyticsEvents } from '@/analytics';

// Track paywall view
AnalyticsEvents.paywallViewed('alarm_creation');

// Track feature gate
AnalyticsEvents.featureGated('hard_difficulty', false);
```

---

## 🐛 Debug

### Enable debug logs

Already enabled in dev mode (`__DEV__`). Check console for:

```
[RevenueCat] Initialized successfully
[RevenueCat] Offerings fetched: ...
[RevenueCat] Customer info updated: ...
```

### Check state

```typescript
const store = useSubscriptionStore.getState();
console.log('Full store state:', store);
```

---

## ⚙️ Configuration

### API Key

Test key (dev): `test_brhnDrWRyBlNoHVTqHlmssTpNhV`

Location: `src/configs/revenue-cat.ts`

### Products

Location: `src/configs/revenue-cat.ts`

```typescript
export enum ProductId {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}
```

---

## 🔗 Useful Links

- [RevenueCat Dashboard](https://app.revenuecat.com)
- [Documentation](https://www.revenuecat.com/docs)
- [React Native SDK Docs](https://www.revenuecat.com/docs/getting-started/installation/reactnative)
- [Paywall Builder](https://www.revenuecat.com/docs/tools/paywalls)

---

## 💡 Pro Tips

1. Always check `isPro`, never check product IDs directly
2. Use `showPaywallIfNeeded()` to avoid showing paywall to Pro users
3. Add restore button to login/settings screens
4. Refresh status when app becomes active
5. Handle errors gracefully - don't block user flow
6. Track paywall views for analytics
7. Test in sandbox before production

---

**Need more details?** See [REVENUECAT_STEP_BY_STEP.md](./REVENUECAT_STEP_BY_STEP.md) or [REVENUECAT_EXAMPLES.md](./REVENUECAT_EXAMPLES.md)
