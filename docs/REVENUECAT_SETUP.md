# RevenueCat Setup Guide - WakeMind

Este guia cobre a configuração completa do RevenueCat para monetização no WakeMind.

## 📋 Tabela de Conteúdo

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Configuração no RevenueCat Dashboard](#configuração-no-revenuecat-dashboard)
4. [Configuração de Produtos](#configuração-de-produtos)
5. [Configuração da Aplicação](#configuração-da-aplicação)
6. [Variáveis de Ambiente](#variáveis-de-ambiente)
7. [Testando Compras](#testando-compras)
8. [Produção](#produção)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O WakeMind utiliza **RevenueCat** para gerenciar:

- ✅ Assinaturas mensais e anuais
- ✅ Compras lifetime (uma vez)
- ✅ Free trials
- ✅ Restore de compras
- ✅ Cross-platform subscriptions (iOS + Android)

### Estrutura Implementada

```
src/
├── configs/
│   └── revenue-cat.ts          # Configurações e constantes
├── services/
│   └── revenue-cat-service.ts  # Lógica de compras
├── stores/
│   └── use-subscription-store.ts # Estado global
└── features/subscription/
    ├── screens/
    │   └── paywall-screen.tsx   # Tela de upgrade
    └── components/
        └── feature-gate.tsx     # Controle de acesso
```

---

## 🔑 Pré-requisitos

### 1. Conta no RevenueCat

- Criar conta em [app.revenuecat.com](https://app.revenuecat.com)
- É gratuito até $10k MRR

### 2. Produtos Configurados nas Lojas

#### App Store Connect (iOS)

1. Acesse [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Vá em **Apps** → **WakeMind** → **Subscriptions**
3. Crie os seguintes produtos:

| Product ID              | Type           | Price  | Duration |
| ----------------------- | -------------- | ------ | -------- |
| `wakemind_pro_monthly`  | Auto-Renewable | $2.99  | 1 month  |
| `wakemind_pro_annual`   | Auto-Renewable | $19.99 | 1 year   |
| `wakemind_pro_lifetime` | Non-Consumable | $49.99 | -        |

**Free Trial:**

- Para ambos os subscriptions, configure:
  - Introductory Offer: 7 days free
  - Eligibility: New subscribers only

#### Google Play Console (Android)

1. Acesse [play.google.com/console](https://play.google.com/console)
2. Vá em **Monetize** → **Products** → **Subscriptions**
3. Crie os mesmos produtos:

| Product ID              | Type           | Price  | Billing Period |
| ----------------------- | -------------- | ------ | -------------- |
| `wakemind_pro_monthly`  | Subscription   | $2.99  | 1 month        |
| `wakemind_pro_annual`   | Subscription   | $19.99 | 1 year         |
| `wakemind_pro_lifetime` | In-app Product | $49.99 | -              |

---

## 🎛️ Configuração no RevenueCat Dashboard

### 1. Criar Projeto

1. No RevenueCat dashboard, clique em **Create new app**
2. Nome: `WakeMind`
3. Plataformas: iOS e Android

### 2. Conectar App Store

1. Vá em **App Settings** → **Apple App Store**
2. Clique em **Connect**
3. Você precisará:
   - **App Bundle ID:** `com.wgsoftwares.wakemind`
   - **Shared Secret:** Obtido no App Store Connect
     - App Store Connect → Apps → WakeMind → General → App Information → App-Specific Shared Secret
4. Salve

### 3. Conectar Google Play

1. Vá em **App Settings** → **Google Play Store**
2. Clique em **Connect**
3. Você precisará:
   - **Package Name:** `com.wgsoftwares.wakemind`
   - **Service Account JSON:**
     1. No Google Cloud Console, crie uma Service Account
     2. Dê permissões de Financeiro
     3. Baixe o JSON key
     4. Upload no RevenueCat
4. Salve

### 4. Configurar Entitlements

1. Vá em **Entitlements**
2. Clique em **+ New Entitlement**
3. Criar:
   - **Identifier:** `pro`
   - **Display Name:** `WakeMind Pro`
4. Salve

### 5. Configurar Products

1. Vá em **Products**
2. Para cada produto (monthly, annual, lifetime):
   - Clique em **+ New Product**
   - **Product Identifier:** `wakemind_pro_monthly` (exemplo)
   - **Store:** App Store / Google Play
   - **Store Product ID:** (mesmo ID do produto na loja)
   - **Attach to Entitlement:** `pro`
3. Salve cada um

### 6. Criar Offerings

1. Vá em **Offerings**
2. Criar **Default Offering:**
   - **Identifier:** `default`
   - **Display Name:** `Default Offering`
3. Adicionar packages:
   - **Monthly:** Package type `$rc_monthly`, Product `wakemind_pro_monthly`
   - **Annual:** Package type `$rc_annual`, Product `wakemind_pro_annual`
   - **Lifetime:** Package type `$rc_lifetime`, Product `wakemind_pro_lifetime`
4. Marque **Annual** como **Default**
5. Salve

### 7. Obter API Keys

1. Vá em **API Keys** (ícone de chave no menu)
2. Copie:
   - **Apple API Key** (começa com `appl_`)
   - **Google API Key** (começa com `goog_`)
3. Guarde em local seguro

---

## 🛠️ Configuração da Aplicação

### 1. Variáveis de Ambiente

Crie/atualize o arquivo `.env` na raiz do projeto:

```bash
# RevenueCat API Keys
REVENUECAT_APPLE_API_KEY=appl_xxxxxxxxxxxxxxxxxxx
REVENUECAT_GOOGLE_API_KEY=goog_xxxxxxxxxxxxxxxxxxx
```

⚠️ **IMPORTANTE:** Nunca commite o `.env` no Git! Ele já está no `.gitignore`.

### 2. Verificar Configuração

Os arquivos já foram criados:

- ✅ `src/configs/revenue-cat.ts` - Configurações
- ✅ `src/services/revenue-cat-service.ts` - Serviço
- ✅ `src/stores/use-subscription-store.ts` - Store
- ✅ `src/features/subscription/screens/paywall-screen.tsx` - UI
- ✅ `src/features/subscription/components/feature-gate.tsx` - Gates
- ✅ `src/app/subscription/paywall.tsx` - Rota

### 3. Traduções

As traduções já foram adicionadas:

- ✅ `src/i18n/en/subscription.ts`
- ✅ `src/i18n/pt/subscription.ts`
- ✅ `src/i18n/es/subscription.ts`

---

## 🧪 Testando Compras

### iOS (Sandbox)

1. **Criar Tester:**
   - App Store Connect → Users and Access → Sandbox Testers
   - Adicionar novo tester com email único

2. **Configurar Dispositivo:**
   - Settings → App Store → Sandbox Account
   - Login com o tester criado

3. **Testar:**

   ```bash
   npm run ios
   ```

   - Abra o app
   - Navegue para Settings → Subscription ou clique em feature bloqueada
   - Clique "Start Free Trial"
   - Confirme com Touch ID/senha (sandbox)
   - Verificar se o Pro foi ativado

4. **Verificar no RevenueCat:**
   - Dashboard → Customers
   - Procure pelo tester
   - Verifique entitlement `pro` ativo

### Android (Testing)

1. **Adicionar License Testers:**
   - Google Play Console → Setup → License testing
   - Adicionar emails dos testers

2. **Criar Internal Testing Track:**
   - Google Play Console → Testing → Internal testing
   - Upload do APK/AAB
   - Adicionar testers

3. **Testar:**

   ```bash
   npm run android
   ```

   - Mesmos passos do iOS

### Teste Rápido (Development)

Para testar a UI sem comprar:

```typescript
// src/stores/use-subscription-store.ts
// Temporariamente force isPro = true

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  isPro: true, // ← Mudar para true para testar UI
  // ...
}));
```

⚠️ **Lembre-se de reverter antes do commit!**

---

## 🚀 Produção

### 1. Build para Produção

```bash
# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production
```

### 2. Upload para Lojas

**App Store:**

1. Upload via EAS Submit:
   ```bash
   eas submit --platform ios
   ```
2. App Store Connect → TestFlight → Submit for Review
3. Aprovar questões de Review
4. Release

**Google Play:**

1. Upload via EAS Submit:
   ```bash
   eas submit --platform android
   ```
2. Google Play Console → Production → Submit for Review
3. Release

### 3. Monitoramento

**RevenueCat Dashboard:**

- **Overview:** MRR, ARR, subscribers
- **Charts:** Conversions, trials, churn
- **Customers:** Lista de assinantes
- **Events:** Log de transações

**Analytics (Mixpanel):**
Os eventos já estão implementados:

- `paywall_viewed`
- `subscription_purchased`
- `subscription_failed`
- `subscription_restored`
- `feature_gated`

---

## 🎨 Customização

### Alterar Preços

Edite `src/configs/revenue-cat.ts`:

```typescript
export const PRICING = {
  [ProductId.PRO_MONTHLY]: {
    displayPrice: '$2.99', // ← Mudar aqui
    period: 'month',
  },
  // ...
};
```

⚠️ Os preços reais vêm das lojas, isso é apenas display.

### Alterar Features Incluídas

Edite `src/configs/revenue-cat.ts`:

```typescript
export const PREMIUM_FEATURES = {
  unlimitedAlarms: true,
  maxHistoryDays: 365,
  streakFreeze: 3, // ← Mudar quantidade de tokens
  // ...
};
```

### Adicionar Novo Produto

1. **Criar nas lojas** (App Store + Google Play)
2. **RevenueCat Dashboard:**
   - Products → New Product
   - Attach to entitlement
3. **Código:**
   ```typescript
   // src/configs/revenue-cat.ts
   export enum ProductId {
     PRO_MONTHLY = 'wakemind_pro_monthly',
     PRO_ANNUAL = 'wakemind_pro_annual',
     PRO_LIFETIME = 'wakemind_pro_lifetime',
     PRO_QUARTERLY = 'wakemind_pro_quarterly', // ← Novo
   }
   ```

---

## 🔒 Feature Gating

### Uso Básico

```typescript
import { FeatureGate } from '@/features/subscription/components/feature-gate';

function MyComponent() {
  return (
    <FeatureGate featureName="custom_themes">
      {/* Conteúdo premium */}
      <CustomThemeSelector />
    </FeatureGate>
  );
}
```

### Com Hook

```typescript
import { useFeatureAccess } from '@/features/subscription/components/feature-gate';

function MyComponent() {
  const hasAdvancedStats = useFeatureAccess('advanced_stats');

  if (!hasAdvancedStats) {
    return <UpgradePrompt />;
  }

  return <AdvancedStatsView />;
}
```

### Limites Condicionais

```typescript
import { useSubscriptionStore } from '@/stores/use-subscription-store';

function AlarmListScreen() {
  const { featureAccess, isPro } = useSubscriptionStore();
  const alarms = useAlarms();

  const handleCreateAlarm = () => {
    if (!featureAccess.canCreateAlarm(alarms.length)) {
      // Mostrar paywall
      router.push('/subscription/paywall');
      return;
    }

    // Criar alarme
    router.push('/alarm/create-alarm');
  };

  return (
    <Button onPress={handleCreateAlarm}>
      Create Alarm
      {!isPro && alarms.length >= 3 && ' (Premium)'}
    </Button>
  );
}
```

---

## ❓ Troubleshooting

### "Could not find product"

**Causa:** Produto não existe na loja ou não foi sincronizado.

**Solução:**

1. Verificar que o Product ID está correto
2. Esperar 24h após criar produto (Apple)
3. Fazer build signed (não funciona no Simulator)
4. Verificar Bundle ID/Package Name corretos

### "Unable to purchase"

**Causa:** Sandbox não configurado ou expirado.

**Solução:**

1. Verificar que está logado com Sandbox Account (iOS)
2. Criar novo tester se antigo expirou
3. Limpar build e reinstalar app

### "Offerings are null"

**Causa:** API Key incorreta ou rede.

**Solução:**

1. Verificar `.env` tem chaves corretas
2. Rebuild app após mudar `.env`
3. Verificar conexão internet
4. Checar logs do RevenueCat dashboard

### "Subscription not showing"

**Causa:** Entitlement não attached ao produto.

**Solução:**

1. RevenueCat Dashboard → Products
2. Verificar cada produto tem entitlement `pro`
3. Re-fetch offerings no app

### Restore não funciona

**Causa:** Usando email diferente ou sem compra prévia.

**Solução:**

1. Verificar que está logado com mesma Apple ID/Google Account
2. Verificar que já fez compra anteriormente
3. Checar logs em RevenueCat → Customers

---

## 📊 Analytics de Monetização

### Eventos Rastreados

Todos já implementados via Mixpanel:

```typescript
// Quando paywall é exibido
AnalyticsEvents.paywallViewed(source);

// Quando compra é bem-sucedida
AnalyticsEvents.subscriptionPurchased(productId, price, period);

// Quando compra falha
AnalyticsEvents.subscriptionFailed(productId, error);

// Quando restaura compra
AnalyticsEvents.subscriptionRestored();

// Quando feature bloqueada é acessada
AnalyticsEvents.featureGated(featureName, isPro);
```

### Dashboards Recomendados

**Mixpanel Funnels:**

```
1. paywall_viewed
   ↓
2. subscription_purchased
```

**Cohorts:**

- Free users
- Trial users
- Paying subscribers
- Churned subscribers

---

## 📚 Recursos Adicionais

### Documentação Oficial

- [RevenueCat Docs](https://docs.revenuecat.com/)
- [React Native SDK](https://docs.revenuecat.com/docs/reactnative)
- [Offerings Guide](https://docs.revenuecat.com/docs/entitlements)

### Links Úteis

- [RevenueCat Dashboard](https://app.revenuecat.com)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Google Play Console](https://play.google.com/console)

### Suporte

- RevenueCat: support@revenuecat.com
- Docs de troubleshooting: https://docs.revenuecat.com/docs/errors

---

## ✅ Checklist de Produção

Antes de lançar, verificar:

- [ ] Produtos criados no App Store Connect
- [ ] Produtos criados no Google Play Console
- [ ] RevenueCat conectado a ambas as lojas
- [ ] Entitlements configurados
- [ ] Offerings criados e com produtos
- [ ] API Keys no `.env`
- [ ] `.env` no `.gitignore`
- [ ] API Keys no EAS Secrets (para builds)
- [ ] Testado compra no Sandbox (iOS)
- [ ] Testado compra no Testing (Android)
- [ ] Testado restore em ambas plataformas
- [ ] Feature gates funcionando
- [ ] Analytics rastreando eventos
- [ ] Paywall traduzido (EN, PT, ES)
- [ ] Terms & Privacy links atualizados
- [ ] App review guidelines seguidas

---

**Última atualização:** Janeiro 2026
