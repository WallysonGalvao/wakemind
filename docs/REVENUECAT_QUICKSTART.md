# RevenueCat Integration - Quick Start

## ✅ O que foi implementado

### 1. **Configuração Base**

- ✅ SDK do RevenueCat instalado (`react-native-purchases`)
- ✅ Configurações centralizadas em `src/configs/revenue-cat.ts`
- ✅ Service layer completo em `src/services/revenue-cat-service.ts`
- ✅ Store global Zustand em `src/stores/use-subscription-store.ts`

### 2. **UI Components**

- ✅ Paywall completo em `src/features/subscription/screens/paywall-screen.tsx`
- ✅ Feature Gate component para controle de acesso
- ✅ Subscription Card para Settings
- ✅ Traduções em 3 idiomas (EN, PT, ES)

### 3. **Produtos Configurados**

```typescript
enum ProductId {
  PRO_MONTHLY = 'wakemind_pro_monthly', // $2.99/mês
  PRO_ANNUAL = 'wakemind_pro_annual', // $19.99/ano (44% off)
  PRO_LIFETIME = 'wakemind_pro_lifetime', // $49.99 (compra única)
}
```

### 4. **Features Premium**

```typescript
// Free Tier
- 3 alarmes máximo
- Easy e Medium difficulty
- 30 dias de histórico

// Premium Tier
- Alarmes ilimitados
- Todas as dificuldades (+ Hard + Adaptive AI)
- 365 dias de histórico
- 3 Streak Freeze tokens/mês
- Temas customizados
- Sons premium
- Cloud backup
- Suporte prioritário
```

### 5. **Analytics**

Eventos implementados:

- `paywall_viewed`
- `subscription_purchased`
- `subscription_failed`
- `subscription_restored`
- `feature_gated`

---

## 🚀 Próximos Passos

### 1. Configurar RevenueCat Dashboard

📖 **Guia Completo:** [docs/REVENUECAT_SETUP.md](./REVENUECAT_SETUP.md)

**Resumo:**

1. Criar conta em [app.revenuecat.com](https://app.revenuecat.com)
2. Criar app "WakeMind"
3. Conectar App Store Connect
4. Conectar Google Play Console
5. Criar entitlement `pro`
6. Criar produtos e offering
7. Copiar API Keys

### 2. Configurar Variáveis de Ambiente

Crie `.env` na raiz do projeto:

```bash
REVENUECAT_APPLE_API_KEY=appl_your_key_here
REVENUECAT_GOOGLE_API_KEY=goog_your_key_here
```

### 3. Criar Produtos nas Lojas

**App Store Connect:**

- `wakemind_pro_monthly` - Auto-Renewable Subscription - $2.99/month
- `wakemind_pro_annual` - Auto-Renewable Subscription - $19.99/year
- `wakemind_pro_lifetime` - Non-Consumable - $49.99

**Google Play Console:**

- Mesmos produtos com mesmos IDs

### 4. Testar

```bash
# iOS (com Sandbox Account)
npm run ios

# Android (com License Tester)
npm run android
```

---

## 💻 Como Usar

### Verificar Status de Subscription

```typescript
import { useSubscriptionStore } from '@/stores/use-subscription-store';

function MyComponent() {
  const { isPro, isLoading } = useSubscriptionStore();

  if (isLoading) return <Loading />;

  return <Text>{isPro ? 'Pro User' : 'Free User'}</Text>;
}
```

### Bloquear Feature Premium

```typescript
import { FeatureGate } from '@/features/subscription/components';

function MyScreen() {
  return (
    <FeatureGate featureName="custom_themes">
      <CustomThemeSelector />
    </FeatureGate>
  );
}
```

### Mostrar Paywall

```typescript
import { router } from 'expo-router';
import { useSubscriptionStore } from '@/stores/use-subscription-store';

function CreateAlarmButton() {
  const { featureAccess } = useSubscriptionStore();
  const alarmsCount = 5; // exemplo

  const handlePress = () => {
    if (!featureAccess.canCreateAlarm(alarmsCount)) {
      router.push('/subscription/paywall');
      return;
    }

    // Criar alarme
    router.push('/alarm/create-alarm');
  };

  return <Button onPress={handlePress}>Create Alarm</Button>;
}
```

### Mostrar Status em Settings

```typescript
import { SubscriptionCard } from '@/features/subscription/components';

function SettingsScreen() {
  return (
    <View>
      <SubscriptionCard />
      {/* Outras configurações */}
    </View>
  );
}
```

### Restaurar Compras

```typescript
import { useSubscriptionStore } from '@/stores/use-subscription-store';

function RestoreButton() {
  const { restore, isLoading } = useSubscriptionStore();

  const handleRestore = async () => {
    const success = await restore();
    if (success) {
      Alert.alert('Success', 'Purchases restored!');
    } else {
      Alert.alert('Failed', 'No purchases found');
    }
  };

  return (
    <Button onPress={handleRestore} loading={isLoading}>
      Restore Purchases
    </Button>
  );
}
```

---

## 🎨 Customizações Comuns

### Alterar Limites Free Tier

`src/configs/revenue-cat.ts`:

```typescript
export const FREE_TIER_LIMITS = {
  maxAlarms: 5, // ← Mudar de 3 para 5
  maxHistoryDays: 60, // ← Mudar de 30 para 60
  // ...
};
```

### Adicionar Nova Feature Premium

1. **Configuração:**

```typescript
// src/configs/revenue-cat.ts
export const PREMIUM_FEATURES = {
  // ...existentes
  aiChallenges: true, // ← Nova feature
};
```

2. **Feature Gate:**

```typescript
// src/features/subscription/components/feature-gate.tsx
export function useFeatureAccess(featureName: string): boolean {
  const { isPro, featureAccess } = useSubscriptionStore();

  const hasAccess = (() => {
    switch (featureName) {
      // ...existentes
      case 'ai_challenges':
        return isPro && PREMIUM_FEATURES.aiChallenges;
      // ...
    }
  })();
  // ...
}
```

3. **Uso:**

```typescript
<FeatureGate featureName="ai_challenges">
  <AIChallengeComponent />
</FeatureGate>
```

### Mudar Messaging do Paywall

`src/i18n/en/subscription.ts`:

```typescript
'paywall.title': 'Your Custom Title Here',
'paywall.subtitle': 'Your custom subtitle',
// ...
```

---

## 📊 Monitoramento

### RevenueCat Dashboard

Acesse [app.revenuecat.com](https://app.revenuecat.com) para ver:

- **MRR (Monthly Recurring Revenue)**
- **Active Subscribers**
- **Trials**
- **Churn Rate**
- **Customer List**

### Mixpanel

Funnels para criar:

```
1. paywall_viewed
   ↓ (X%)
2. subscription_purchased
```

Segmentos:

- Free users
- Trial users
- Paying users
- Churned users

---

## 🐛 Debug

### Verificar se SDK inicializou

```typescript
// src/app/_layout.tsx já tem isso:
await initializeSubscription();
```

### Logs do RevenueCat

```typescript
// src/services/revenue-cat-service.ts
// DEBUG já habilitado em __DEV__
```

### Verificar Offerings

```typescript
import { useSubscriptionStore } from '@/stores/use-subscription-store';

function DebugOfferings() {
  const { offerings } = useSubscriptionStore();

  console.log('Offerings:', offerings);

  return (
    <View>
      {offerings?.map(pkg => (
        <Text key={pkg.identifier}>
          {pkg.product.title} - {pkg.product.priceString}
        </Text>
      ))}
    </View>
  );
}
```

---

## 📚 Documentação Completa

- **Setup Detalhado:** [docs/REVENUECAT_SETUP.md](./REVENUECAT_SETUP.md)
- **RevenueCat Docs:** https://docs.revenuecat.com/docs/reactnative
- **Troubleshooting:** [docs/REVENUECAT_SETUP.md#troubleshooting](./REVENUECAT_SETUP.md#troubleshooting)

---

## ✅ Checklist Pré-Lançamento

- [ ] API Keys configuradas no `.env`
- [ ] Produtos criados no App Store Connect
- [ ] Produtos criados no Google Play Console
- [ ] RevenueCat dashboard configurado
- [ ] Testado compra no iOS Sandbox
- [ ] Testado compra no Android Testing
- [ ] Testado restore em ambas plataformas
- [ ] Feature gates funcionando
- [ ] Paywall exibindo corretamente
- [ ] Analytics rastreando eventos
- [ ] Traduções verificadas (EN, PT, ES)

---

**Última atualização:** Janeiro 2026  
**Versão:** 1.0.0
