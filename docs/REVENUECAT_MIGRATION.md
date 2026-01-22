# Migração para RevenueCat UI Nativo

Este guia mostra como usar os componentes nativos do RevenueCat que substituíram os componentes customizados.

---

## ❌ Componentes Removidos → ✅ Substituídos Por:

### 1. Paywall Screen

#### ❌ Antes (Deletado):

```typescript
// src/features/subscription/screens/paywall-screen.tsx
import { PaywallScreen } from '@/features/subscription/screens/paywall-screen';

<PaywallScreen source="settings" onDismiss={() => {}} />
```

#### ✅ Agora:

```typescript
// Opção 1: Usar a store (Recomendado)
import { useSubscriptionStore } from '@/stores/use-subscription-store';

const { showPaywall } = useSubscriptionStore();

// Mostrar paywall
await showPaywall();

// Opção 2: Usar o serviço diretamente
import { presentPaywallUI } from '@/services/revenue-cat-service';

await presentPaywallUI({ offering: 'default' });

// Opção 3: Usar RevenueCat UI diretamente
import RevenueCatUI from 'react-native-purchases-ui';

const result = await RevenueCatUI.presentPaywall({
  offering: undefined, // default offering
  displayCloseButton: true,
});
```

---

### 2. Modern Paywall Screen

#### ❌ Antes (Deletado):

```typescript
// src/features/subscription/screens/modern-paywall-screen.tsx
import { ModernPaywallScreen } from '@/features/subscription/screens/modern-paywall-screen';

<ModernPaywallScreen source="feature" offering="default" onDismiss={() => {}} />
```

#### ✅ Agora:

```typescript
// Mesma solução do anterior - usar store ou serviço
import { useSubscriptionStore } from '@/stores/use-subscription-store';

const { showPaywall, showPaywallIfNeeded } = useSubscriptionStore();

// Mostrar sempre
await showPaywall('default');

// Mostrar só se não for Pro
await showPaywallIfNeeded('onboarding');
```

---

### 3. Customer Center

#### ❌ Antes (Deletado):

```typescript
// src/features/subscription/components/customer-center.tsx
import { CustomerCenter } from '@/features/subscription/components';

<CustomerCenter />
```

#### ✅ Agora:

```typescript
// Opção 1: Como componente embutido (Recomendado)
import RevenueCatUI from 'react-native-purchases-ui';

function SubscriptionManagementScreen() {
  return (
    <View style={{ flex: 1 }}>
      <RevenueCatUI.CustomerCenterView
        style={{ flex: 1 }}
        onDismiss={() => router.back()}
        shouldShowCloseButton={true}
      />
    </View>
  );
}

// Opção 2: Como modal
import RevenueCatUI from 'react-native-purchases-ui';

async function showCustomerCenter() {
  await RevenueCatUI.presentCustomerCenter({
    callbacks: {
      onRestoreCompleted: ({ customerInfo }) => {
        console.log('Restore completed', customerInfo);
      },
      onRestoreFailed: ({ error }) => {
        console.log('Restore failed', error);
      },
    },
  });
}
```

---

## 📝 Exemplos Práticos

### Exemplo 1: Botão "Upgrade to Pro"

```typescript
import { useSubscriptionStore } from '@/stores/use-subscription-store';

function UpgradeButton() {
  const { showPaywall, isPro } = useSubscriptionStore();

  if (isPro) return null;

  return (
    <Button onPress={() => showPaywall()}>
      Upgrade to Pro
    </Button>
  );
}
```

### Exemplo 2: Feature Bloqueada

```typescript
import { useSubscriptionStore } from '@/stores/use-subscription-store';

function PremiumFeature() {
  const { isPro, showPaywall } = useSubscriptionStore();

  const handleAccess = async () => {
    if (!isPro) {
      const purchased = await showPaywall();
      if (!purchased) return; // User didn't purchase
    }

    // Access granted
    navigateToFeature();
  };

  return (
    <Button onPress={handleAccess}>
      Access Premium Feature {!isPro && '🔒'}
    </Button>
  );
}
```

### Exemplo 3: Settings com Customer Center

```typescript
import RevenueCatUI from 'react-native-purchases-ui';
import { router } from 'expo-router';

function SettingsScreen() {
  const { isPro } = useSubscriptionStore();

  const handleManageSubscription = () => {
    // Navigate to Customer Center screen
    router.push('/settings/manage-subscription');
  };

  return (
    <ScrollView>
      {/* Subscription Status */}
      <SubscriptionCard />

      {/* Manage button */}
      {isPro && (
        <Button onPress={handleManageSubscription}>
          Manage Subscription
        </Button>
      )}
    </ScrollView>
  );
}

// In /settings/manage-subscription.tsx
export default function ManageSubscriptionScreen() {
  return (
    <View style={{ flex: 1 }}>
      <RevenueCatUI.CustomerCenterView
        style={{ flex: 1 }}
        onDismiss={() => router.back()}
      />
    </View>
  );
}
```

### Exemplo 4: Onboarding com Paywall

```typescript
function WelcomeScreen() {
  const { showPaywallIfNeeded } = useSubscriptionStore();

  const handleGetStarted = async () => {
    // Show paywall if user isn't Pro
    await showPaywallIfNeeded('onboarding');

    // Continue to app (regardless of purchase)
    router.replace('/dashboard');
  };

  return (
    <View>
      <Text>Welcome to WakeMind!</Text>
      <Button onPress={handleGetStarted}>Get Started</Button>
    </View>
  );
}
```

### Exemplo 5: Embedded Paywall (Avançado)

Se você quiser um paywall embutido na tela ao invés de modal:

```typescript
import RevenueCatUI from 'react-native-purchases-ui';

function UpgradeScreen() {
  return (
    <View style={{ flex: 1 }}>
      <RevenueCatUI.Paywall
        options={{
          offering: undefined, // default
          displayCloseButton: false,
        }}
        onPurchaseCompleted={({ customerInfo }) => {
          console.log('Purchase completed!', customerInfo);
          router.back();
        }}
        onPurchaseCancelled={() => {
          console.log('Purchase cancelled');
        }}
        onRestoreCompleted={({ customerInfo }) => {
          console.log('Restore completed', customerInfo);
          router.back();
        }}
        onDismiss={() => {
          router.back();
        }}
      />
    </View>
  );
}
```

---

## 🎨 Configurar Paywall no Dashboard

O paywall agora é configurado no RevenueCat Dashboard:

1. Acesse [app.revenuecat.com](https://app.revenuecat.com)
2. Vá em **Paywalls** → **Create Paywall**
3. Configure:
   - **Template**: Escolha um design
   - **Colors**: Cores da sua marca
   - **Text**: Personalize os textos
   - **Features**: Liste os benefícios premium
   - **Packages**: Selecione quais planos mostrar

4. **Anexe ao Offering**:
   - Vá em **Offerings** → **default**
   - Selecione seu paywall configurado

**Vantagens**:

- ✅ Atualize design sem deploy do app
- ✅ A/B test diferentes designs
- ✅ Suporte a múltiplos idiomas
- ✅ Analytics integrado
- ✅ Templates otimizados para conversão

---

## 🔧 Componentes que PERMANECERAM

Estes componentes ainda são úteis e devem ser mantidos:

### FeatureGate

```typescript
import { FeatureGate } from '@/features/subscription/components';

<FeatureGate featureName="custom_themes">
  <CustomThemeSelector />
</FeatureGate>
```

### SubscriptionCard

```typescript
import { SubscriptionCard } from '@/features/subscription/components';

<SubscriptionCard />
```

### useFeatureAccess Hook

```typescript
import { useFeatureAccess } from '@/features/subscription/components';

const hasFeature = useFeatureAccess('advanced_stats');
```

---

## 📊 Comparação: Antes vs Depois

| Aspecto             | Antes (Customizado)                    | Depois (RevenueCat UI)                   |
| ------------------- | -------------------------------------- | ---------------------------------------- |
| **Paywall**         | Componente customizado em React Native | Hosted paywall configurável no dashboard |
| **Updates**         | Requer novo deploy do app              | Atualiza sem deploy                      |
| **Design**          | Código hardcoded                       | Configurável no dashboard                |
| **A/B Testing**     | Difícil                                | Built-in no dashboard                    |
| **Customer Center** | Componente custom                      | Componente nativo otimizado              |
| **Maintenance**     | Alta (você mantém)                     | Baixa (RevenueCat mantém)                |
| **Conversão**       | Depende do seu design                  | Templates otimizados                     |

---

## ✅ Checklist de Migração

- [x] Deletar `paywall-screen.tsx`
- [x] Deletar `modern-paywall-screen.tsx`
- [x] Deletar `customer-center.tsx`
- [x] Atualizar `components/index.ts`
- [ ] Configurar paywall no RevenueCat Dashboard
- [ ] Criar tela de gerenciamento com `CustomerCenterView`
- [ ] Testar paywall em sandbox
- [ ] Testar customer center
- [ ] Atualizar rotas se necessário

---

**Resultado**: Menos código para manter, mais flexibilidade, melhor UX! 🎉
