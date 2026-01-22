# Analytics e Melhorias de UX - RevenueCat

## 📊 Analytics Implementado

### Eventos de Analytics Adicionados

#### 1. **Eventos de Paywall**

- `paywallViewed(source)` - Quando o paywall é exibido
- `paywallDismissed(source, duration)` - Quando o paywall é fechado (rastreia tempo de visualização)

#### 2. **Eventos de Conversão**

- `purchaseStarted(packageId)` - Quando compra é iniciada
- `purchaseCompleted(packageId, duration)` - Compra bem-sucedida (rastreia tempo)
- `purchaseCancelled(packageId)` - Usuário cancelou compra
- `packageSelected(packageId, packageType)` - Quando usuário seleciona um plano

#### 3. **Eventos de Restore**

- `restoreStarted()` - Quando restore é iniciado
- `restoreCompleted(duration, hasActiveEntitlements)` - Restore completado
- `subscriptionRestoreFailed(error)` - Falha no restore

#### 4. **Eventos de Offerings**

- `offeringsLoaded(offeringsCount, loadTime)` - Offerings carregadas (rastreia tempo e quantidade)
- `offeringsLoadFailed(error, retryCount)` - Falha ao carregar offerings

#### 5. **Eventos de Status**

- `customerInfoRefreshed(isPro)` - Status do cliente atualizado

#### 6. **Eventos de Erro**

- `subscriptionError(operation, error, metadata)` - Erros gerais de subscription
- `networkError(operation, retryCount)` - Erros de rede e retentativas

### Métricas Rastreadas

- **Tempo de carregamento** de offerings
- **Duração de compra** (do início ao fim)
- **Duração de restore**
- **Tempo de visualização** do paywall
- **Taxa de conversão** por pacote
- **Taxa de cancelamento**
- **Taxa de erro** por operação
- **Tentativas de retry** em falhas de rede

---

## 🎨 Melhorias de UX Implementadas

### 1. **Error Boundary para Subscription**

Componente criado: [`SubscriptionErrorBoundary`](../features/subscription/components/subscription-error-boundary.tsx)

#### Funcionalidades:

- ✅ Captura erros relacionados a compras/subscriptions
- ✅ Detecta automaticamente erros de rede
- ✅ Fornece UI de erro amigável com botão de retry
- ✅ Rastreia erros no analytics
- ✅ Suporta fallback customizado
- ✅ Exibe detalhes de erro em modo dev

#### Como Usar:

```tsx
import { SubscriptionErrorBoundary } from '@/features/subscription/components';

// Envolver componentes de subscription
<SubscriptionErrorBoundary>
  <PaywallScreen />
</SubscriptionErrorBoundary>

// Com fallback customizado
<SubscriptionErrorBoundary
  fallback={(error, retry) => (
    <CustomErrorUI error={error} onRetry={retry} />
  )}
  onError={(error, errorInfo) => {
    // Log customizado
    console.error('Subscription error:', error);
  }}
>
  <YourComponent />
</SubscriptionErrorBoundary>
```

---

### 2. **Retry Logic com Exponential Backoff**

Utilitário criado: [`retry.ts`](../utils/retry.ts)

#### Funcionalidades:

- ✅ Retry automático com exponential backoff
- ✅ Configurável (maxRetries, delays, backoffMultiplier)
- ✅ Detecta automaticamente erros de rede retryáveis
- ✅ Nunca retenta cancelamentos de usuário
- ✅ Rastreia tentativas no analytics
- ✅ Callbacks para cada retry

#### Configuração Padrão:

- **Max Retries**: 3 tentativas
- **Initial Delay**: 1000ms (1 segundo)
- **Max Delay**: 10000ms (10 segundos)
- **Backoff Multiplier**: 2x (exponencial)

#### Como Usar:

```typescript
import { retryWithBackoff, retryRevenueCatOperation } from '@/utils/retry';

// Uso genérico
const result = await retryWithBackoff(
  async () => {
    return await someNetworkOperation();
  },
  {
    maxRetries: 3,
    initialDelay: 1000,
    onRetry: (error, attempt) => {
      console.log(`Retry attempt ${attempt}`);
    },
  }
);

// Uso específico para RevenueCat (já configurado)
const offerings = await retryRevenueCatOperation(
  () => RevenueCatService.getOfferings(),
  'loadOfferings'
);
```

#### Operações com Retry Automático:

- ✅ `initializeRevenueCat()`
- ✅ `getCustomerInfo()`
- ✅ `getCurrentOffering()`
- ✅ `restorePurchases()`

---

### 3. **Loading States Granulares**

Melhorias na [`useSubscriptionStore`](../stores/use-subscription-store.ts)

#### Novos Estados:

```typescript
type LoadingState =
  | 'idle' // Nenhuma operação em andamento
  | 'initializing' // Inicializando SDK
  | 'loading' // Carregando offerings/paywall
  | 'purchasing' // Processando compra
  | 'restoring'; // Restaurando compras
```

#### Como Usar:

```tsx
const { loadingState, isLoading } = useSubscriptionStore();

// Feedback específico baseado no estado
if (loadingState === 'purchasing') {
  return <Text>Processing your purchase...</Text>;
}

if (loadingState === 'restoring') {
  return <Text>Restoring purchases...</Text>;
}

// Para compatibilidade com código existente
if (isLoading) {
  return <ActivityIndicator />;
}
```

---

### 4. **Feedback Visual Melhorado no Paywall**

Melhorias em [`paywall.tsx`](../features/subscription/screens/paywall.tsx)

#### Novos Recursos:

##### 1. **Loading Indicator com Texto Contextual**

```tsx
{
  isLoading ? (
    <View className="flex-row items-center gap-2">
      <ActivityIndicator color="white" size="small" />
      <Text>{loadingState === 'purchasing' ? 'Processing...' : 'Loading...'}</Text>
    </View>
  ) : (
    <Text>Start Free Trial</Text>
  );
}
```

##### 2. **Mensagens de Erro Inline**

```tsx
{
  error && !isLoading ? (
    <View className="rounded-lg bg-red-50 p-3">
      <Text className="text-center text-sm text-red-600">{error}</Text>
    </View>
  ) : null;
}
```

##### 3. **Loading Overlay para Offerings**

```tsx
{
  isLoading && loadingState === 'loading' && !offerings ? (
    <View className="absolute inset-0 items-center justify-center">
      <ActivityIndicator size="large" />
      <Text>Loading plans...</Text>
    </View>
  ) : null;
}
```

##### 4. **Botão Desabilitado Durante Loading**

```tsx
<Pressable
  disabled={isLoading || !monthlyPackage || !yearlyPackage}
  className="disabled:opacity-50"
>
```

##### 5. **Tracking de Seleção de Plano**

```tsx
const handlePlanSelect = (plan: PlanType) => {
  setSelectedPlan(plan);

  // Track selection
  const pkg = plan === 'yearly' ? yearlyPackage : monthlyPackage;
  if (pkg) {
    AnalyticsEvents.packageSelected(pkg.identifier, plan);
  }
};
```

##### 6. **Tracking de Tempo de Visualização**

```tsx
const [viewStartTime] = useState(Date.now());

useEffect(() => {
  AnalyticsEvents.paywallViewed(source);

  return () => {
    const duration = Math.floor((Date.now() - viewStartTime) / 1000);
    AnalyticsEvents.paywallDismissed(source, duration);
  };
}, []);
```

---

## 📈 Monitoramento no Mixpanel

Todos os eventos são automaticamente enviados para o Mixpanel. Você pode criar dashboards para:

### KPIs Principais:

- **Conversion Rate**: `subscription_purchased` / `paywall_viewed`
- **Cancellation Rate**: `purchase_cancelled` / `purchase_started`
- **Average View Time**: Média de `duration_seconds` em `paywall_dismissed`
- **Success Rate**: `purchase_completed` / `purchase_started`
- **Retry Rate**: Count de `network_error` com `retrying`

### Funnels Sugeridos:

1. `paywall_viewed` → `package_selected` → `purchase_started` → `purchase_completed`
2. `offerings_loaded` → `package_selected` → `subscription_purchased`
3. `restore_started` → `restore_completed`

### Segmentações Úteis:

- Por `source` (de onde veio o paywall)
- Por `package_id` (qual plano foi escolhido)
- Por `error` (tipos de erros mais comuns)
- Por `retry_count` (quantas tentativas foram necessárias)

---

## 🔧 Próximos Passos Opcionais

### Testes (se necessário):

1. **Testes Unitários** do Error Boundary
2. **Testes de Integração** do fluxo de compra
3. **Testes do hook** `useRevenueCat`

### Melhorias Futuras:

1. A/B testing de diferentes layouts de paywall
2. Personalização de mensagens baseada em comportamento
3. Push notifications para recover abandoned checkouts
4. Ofertas especiais baseadas em analytics

---

## ✅ Checklist de Implementação Completa

- [x] Eventos de analytics adicionados
- [x] Tracking integrado no RevenueCat service
- [x] Error Boundary criado
- [x] Retry logic implementado
- [x] Loading states granulares
- [x] Feedback visual melhorado
- [x] Tracking de tempo de visualização
- [x] Tracking de seleção de planos
- [x] Mensagens de erro amigáveis
- [x] Loading indicators contextuais
- [x] Retry automático em falhas de rede
- [x] Analytics para todas operações críticas

---

**Tudo implementado e pronto para produção! 🎉**
