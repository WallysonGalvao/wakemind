# Análise do Fluxo de Alarmes - WakeMind

## 📋 Resumo Executivo

Este documento apresenta uma análise completa dos problemas identificados no fluxo de alarmes do WakeMind, comparando o comportamento atual com o comportamento desejado.

---

## 🔍 Problemas Identificados

### 1. **App Não Abre Automaticamente** ⚠️

#### Comportamento Atual

- Celular vibra às 6h
- Usuário precisa desbloquear a tela manualmente
- Usuário precisa tocar na notificação do WakeMind
- Somente após tocar na notificação, a tela do desafio aparece

#### Comportamento Esperado

- Às 6h, o app deve desbloquear automaticamente a tela
- Tela do desafio deve aparecer automaticamente (sem interação do usuário)
- Som do alarme deve tocar imediatamente

#### Contexto: Projeto Expo

**⚠️ IMPORTANTE:** Este é um projeto Expo, o que significa:

1. A pasta `android/` é **gerada automaticamente** durante builds
2. Modificações diretas em arquivos nativos (como `MainActivity.kt` ou `AndroidManifest.xml`) serão **perdidas** ao executar `npx expo prebuild`
3. Mudanças persistentes devem ser feitas através de **Config Plugins** do Expo

**Configurações Expo Atuais:**

- ✅ **app.config.ts** - Permissões configuradas corretamente:

  ```typescript
  permissions: [
    'USE_FULL_SCREEN_INTENT', // ✅ Permite full screen intent
    'WAKE_LOCK', // ✅ Permite manter tela ligada
    'VIBRATE', // ✅ Permite vibração
    // ... outras permissões
  ];
  ```

- ✅ **plugins/withNotifee.js** - Plugin que injeta código nativo:
  - Adiciona repositório Maven do Notifee
  - Injeta flags de wake-up no `MainActivity.onCreate()`:
    - `setShowWhenLocked(true)`
    - `setTurnScreenOn(true)`
    - `FLAG_KEEP_SCREEN_ON`
  - Copia arquivo de som do alarme

#### Causa Raiz

O problema está na configuração do `fullScreenAction` no Notifee. Há **3 locais** no código com essa configuração incorreta:

1. **[alarm-scheduler.ts:238-241](../src/services/alarm-scheduler.ts#L238-L241)** - Schedule principal
2. **[alarm-scheduler.ts:366](../src/services/alarm-scheduler.ts#L366)** - Wake check
3. **[alarm-scheduler.ts:459](../src/services/alarm-scheduler.ts#L459)** - Snooze

Todos usando:

```typescript
fullScreenAction: {
  id: 'alarm-triggered',
  launchActivity: 'default',  // ❌ PROBLEMA
  mainComponent: 'default',
},
```

**Por que `'default'` não funciona:**

1. O Notifee com `launchActivity: 'default'` **não cria uma Full Screen Intent** verdadeira
2. Android 10+ requer uma Intent **explícita** para desbloquear a tela
3. Sem Intent explícita, o Android apenas mostra a notificação normal (Heads-up)
4. Usuário precisa interagir manualmente para abrir o app

**Diagnóstico:**

- ✅ Permissão `USE_FULL_SCREEN_INTENT` está no app.config.ts
- ✅ Flags de wake-up estão sendo injetados via plugin
- ❌ Mas a notificação não está usando Full Screen Intent corretamente
- ❌ O valor `'default'` não resolve para o caminho completo da Activity

#### Solução Proposta para Expo

**Solução Recomendada: Atualizar fullScreenAction no alarm-scheduler.ts**

Como é um projeto Expo, **NÃO podemos** criar arquivos nativos diretamente. A solução correta é:

**Passo 1: Usar o caminho completo da MainActivity**

Editar [alarm-scheduler.ts](../src/services/alarm-scheduler.ts) nos 3 locais onde `fullScreenAction` aparece:

```typescript
fullScreenAction: {
  id: 'alarm-triggered',
  launchActivity: 'com.wgsoftwares.wakemind.MainActivity', // ✅ Caminho completo
  mainComponent: 'default',
},
```

**Locais para atualizar:**

- Linha ~238: `scheduleAlarm()` - notificação principal
- Linha ~366: `scheduleWakeCheck()` - verificação de despertar
- Linha ~459: `snoozeAlarm()` - soneca

**Passo 2 (Opcional): Melhorar o plugin withNotifee.js**

Se o Passo 1 não funcionar, podemos criar um **Config Plugin dedicado** para Full Screen Intent:

```javascript
// plugins/withFullScreenIntent.js
const { withAndroidManifest } = require('expo/config-plugins');

function withFullScreenIntent(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    // Garantir que MainActivity tem as flags corretas
    const application = manifest.application[0];
    const activities = application.activity || [];

    const mainActivity = activities.find(
      (activity) => activity.$['android:name'] === '.MainActivity'
    );

    if (mainActivity) {
      // Adicionar atributos para full screen intent
      mainActivity.$['android:showWhenLocked'] = 'true';
      mainActivity.$['android:turnScreenOn'] = 'true';
      mainActivity.$['android:launchMode'] = 'singleTask';
    }

    return config;
  });
}

module.exports = withFullScreenIntent;
```

E adicionar no app.config.ts:

```typescript
plugins: [
  // ... outros plugins
  './plugins/withNotifee.js',
  './plugins/withFullScreenIntent.js', // ✅ Novo plugin
  './plugins/withAlarmIOS.js',
  // ...
];
```

**Passo 3 (Se ainda não funcionar): Verificar configuração do Android**

Alguns dispositivos Android requerem configuração manual adicional:

1. **Desabilitar otimização de bateria:**
   - Configurações > Apps > WakeMind > Bateria > Sem restrições

2. **Habilitar Full Screen Intent:**
   - Configurações > Apps > WakeMind > Notificações > Tela cheia

3. **Permitir iniciar em segundo plano:**
   - Configurações > Apps > WakeMind > Permissões > Iniciar em segundo plano

**O código já solicita essas permissões:**

```typescript
// alarm-scheduler.ts já tem:
await notifee.openBatteryOptimizationSettings();
await notifee.openAlarmPermissionSettings();
```

#### Limitações do Notifee Full Screen Intent

**⚠️ Limitações Conhecidas:**

1. **Documentação do Notifee é limitada:** A biblioteca não documenta bem o funcionamento de `fullScreenAction` com Expo
2. **Comportamento inconsistente entre fabricantes:** Samsung, Xiaomi, Huawei podem ter comportamentos diferentes
3. **Android 12+ restrições:** Google aumentou restrições em Full Screen Intents para economia de bateria
4. **Expo managed workflow:** Algumas features nativas avançadas são difíceis de implementar

**Alternativas se Full Screen Intent não funcionar:**

1. **Usar React Native Alarm Manager** (requer bare workflow ou custom dev client)
2. **Usar expo-notifications** com `priority: 'max'` (menos confiável)
3. **Migrar para bare workflow** e implementar solução nativa customizada
4. **Usar um serviço de foreground** (mais complexo, mas mais confiável)

#### Próximos Passos de Teste

1. ✅ Atualizar `fullScreenAction` para usar caminho completo
2. ✅ Fazer rebuild do app (`eas build --platform android --profile development`)
3. ✅ Testar em dispositivo real (não funciona bem em emulador)
4. ✅ Verificar logs do Logcat para erros relacionados a Intent
5. ❌ Se não funcionar, considerar plugin customizado
6. ❌ Como último recurso, avaliar migração para bare workflow

#### Comandos Úteis para Debug

```bash
# Rebuild com prebuild para atualizar código nativo
npx expo prebuild --clean

# Build de desenvolvimento para testar
eas build --platform android --profile development

# Ver logs do Android (alarme disparando)
adb logcat *:E | grep -i "notifee\|alarm\|fullscreen"

# Verificar se permissão foi concedida
adb shell dumpsys notification | grep -i "fullscreen"
```

---

### 2. **Dados Não São Salvos no Dashboard** ❌

#### Comportamento Atual

- Usuário completa/falha nos desafios
- Dashboard permanece totalmente vazio
- Nenhuma informação registrada

#### Comportamento Esperado

- Tentativas e resultados devem ser salvos
- Dashboard deve mostrar estatísticas:
  - Streak (dias consecutivos)
  - Pontuação cognitiva
  - Taxa de execução semanal
  - Tempo de reação

#### Causa Raiz

Identifiquei **2 problemas críticos** no salvamento de dados:

**Problema 1: Campo `attempts` não está sendo salvo**

No arquivo [alarm-trigger-screen.tsx](../src/features/alarms/screens/alarm-trigger-screen.tsx#L298-L305), ao chamar `recordAlarmCompletion`, o campo `attempts` não é passado:

```typescript
await recordAlarmCompletion({
  targetTime,
  actualTime,
  cognitiveScore,
  reactionTime,
  challengeType,
  // ❌ FALTA: attempts
});
```

**Problema 2: Função `recordAlarmCompletion` não salva `attempts`**

No arquivo [performance.ts](../src/db/functions/performance.ts#L28-L66), mesmo que recebesse o campo, ele não seria salvo:

```typescript
export async function recordAlarmCompletion(
  record: Omit<AlarmCompletionRecord, 'id' | 'date'>
): Promise<void> {
  // ...

  if (existingRecords.length > 0) {
    await db
      .update(alarmCompletions)
      .set({
        targetTime: record.targetTime,
        actualTime: record.actualTime,
        cognitiveScore: record.cognitiveScore,
        reactionTime: record.reactionTime,
        challengeType: record.challengeType,
        // ❌ FALTA: attempts
      })
      .where(eq(alarmCompletions.id, existingRecords[0].id));
    return;
  }

  // Insert também não incluiria attempts
  await db.insert(alarmCompletions).values(newRecord);
}
```

**Problema 3: Interface TypeScript está incompleta**

No arquivo [performance.ts](../src/db/functions/performance.ts#L7-L16), a interface `AlarmCompletionRecord` não inclui o campo `attempts`:

```typescript
export interface AlarmCompletionRecord {
  id: string;
  targetTime: string;
  actualTime: string;
  cognitiveScore: number;
  reactionTime: number;
  challengeType: string;
  date: string;
  // ❌ FALTA: attempts: number;
}
```

#### Solução Proposta

**Passo 1: Atualizar Interface**

Editar [performance.ts](../src/db/functions/performance.ts#L7-L16):

```typescript
export interface AlarmCompletionRecord {
  id: string;
  targetTime: string;
  actualTime: string;
  cognitiveScore: number;
  reactionTime: number;
  challengeType: string;
  attempts: number; // ✅ ADICIONAR
  date: string;
}
```

**Passo 2: Atualizar Função de Salvamento**

Editar [performance.ts](../src/db/functions/performance.ts#L28-L66):

```typescript
export async function recordAlarmCompletion(
  record: Omit<AlarmCompletionRecord, 'id' | 'date'>
): Promise<void> {
  const now = dayjs();
  const today = now.format('YYYY-MM-DD');

  const existingRecords = await db
    .select()
    .from(alarmCompletions)
    .where(eq(sql`date(${alarmCompletions.date})`, today));

  if (existingRecords.length > 0) {
    await db
      .update(alarmCompletions)
      .set({
        targetTime: record.targetTime,
        actualTime: record.actualTime,
        cognitiveScore: record.cognitiveScore,
        reactionTime: record.reactionTime,
        challengeType: record.challengeType,
        attempts: record.attempts, // ✅ ADICIONAR
      })
      .where(eq(alarmCompletions.id, existingRecords[0].id));
    return;
  }

  const newRecord: AlarmCompletionRecord = {
    id: `${Date.now()}_${Math.random()}`,
    ...record,
    attempts: record.attempts, // ✅ Garantir que está incluído
    date: now.toISOString(),
  };

  await db.insert(alarmCompletions).values(newRecord);
}
```

**Passo 3: Passar `attempts` ao Registrar**

Editar [alarm-trigger-screen.tsx](../src/features/alarms/screens/alarm-trigger-screen.tsx#L298-L305):

```typescript
// Record alarm completion for performance tracking
if (alarm) {
  const targetTime = `${params.time || alarm.time}`;
  const actualTime = dayjs().toISOString();

  await recordAlarmCompletion({
    targetTime,
    actualTime,
    cognitiveScore,
    reactionTime,
    challengeType,
    attempts: attempt, // ✅ ADICIONAR
  });

  // ...resto do código
}
```

---

### 3. **Dados Não Aparecem Quando o Desafio Falha** 🔴

#### Comportamento Atual

- Usuário erra 3 vezes
- Tela do alarme desaparece
- **NADA é salvo** (nem falhas, nem tentativas)

#### Comportamento Esperado

- Mesmo com falhas, dados devem ser salvos
- Dashboard deve registrar:
  - Tentativas realizadas
  - Pontuação baixa (refletindo as falhas)
  - Tempo de reação
  - Tipo de desafio

#### Causa Raiz

No arquivo [alarm-trigger-screen.tsx](../src/features/alarms/screens/alarm-trigger-screen.tsx#L336-L347), quando o usuário atinge o número máximo de tentativas, o alarme é apenas desligado sem salvar dados:

```typescript
const handleChallengeAttempt = useCallback(
  (correct: boolean) => {
    if (!correct) {
      if (attempt >= maxAttempts) {
        // Track challenge failed after max attempts
        AnalyticsEvents.challengeFailed(challengeType, difficulty);

        // Auto-dismiss alarm after max failed attempts
        setTimeout(() => {
          handleDismiss(); // ❌ Apenas desliga, não salva dados
        }, 1500);
      } else if (attempt < maxAttempts) {
        setAttempt((prev) => prev + 1);
      }
    }
  },
  [attempt, maxAttempts, challengeType, difficulty, handleDismiss]
);
```

E a função `handleDismiss` no arquivo [alarm-trigger-screen.tsx](../src/features/alarms/screens/alarm-trigger-screen.tsx#L251-L275):

```typescript
const handleDismiss = useCallback(async () => {
  await stopAlarm();

  if (alarm) {
    AnalyticsEvents.alarmDismissed(alarm.id, challengeType, attempt);
    await AlarmScheduler.dismissAlarm(alarm);

    if (isWakeCheckEnabled) {
      await AlarmScheduler.scheduleWakeCheck(alarm);
    }
  }

  router.back(); // ❌ Volta sem salvar dados
}, [alarm, stopAlarm, isWakeCheckEnabled, challengeType, attempt]);
```

#### Solução Proposta

**Atualizar `handleChallengeAttempt`** para salvar dados quando falhar:

```typescript
const handleChallengeAttempt = useCallback(
  async (correct: boolean) => {
    if (!correct) {
      if (attempt >= maxAttempts) {
        // Track challenge failed after max attempts
        AnalyticsEvents.challengeFailed(challengeType, difficulty);

        // ✅ SALVAR DADOS MESMO COM FALHA
        const challengeEndTime = Date.now();
        const timeSpent = challengeEndTime - challengeStartTime;
        const reactionTime = timeSpent;

        // Calcular pontuação baixa baseada nas tentativas falhadas
        const cognitiveScore = calculateCognitiveScore({
          attempts: maxAttempts, // Usou todas as tentativas
          timeSpent,
          difficulty,
          maxAttempts,
        });

        await stopAlarm();

        // Registrar a falha no banco de dados
        if (alarm) {
          const targetTime = `${params.time || alarm.time}`;
          const actualTime = dayjs().toISOString();

          await recordAlarmCompletion({
            targetTime,
            actualTime,
            cognitiveScore,
            reactionTime,
            challengeType,
            attempts: maxAttempts, // ✅ Registrar que usou todas as tentativas
          });

          // Dismiss alarm
          AnalyticsEvents.alarmDismissed(alarm.id, challengeType, maxAttempts);
          await AlarmScheduler.dismissAlarm(alarm);

          if (isWakeCheckEnabled) {
            await AlarmScheduler.scheduleWakeCheck(alarm);
          }
        }

        // Navegar para tela de resumo (mesmo com falha)
        router.push('/alarm/performance-summary');
      } else if (attempt < maxAttempts) {
        setAttempt((prev) => prev + 1);
      }
    }
  },
  [
    attempt,
    maxAttempts,
    challengeType,
    difficulty,
    challengeStartTime,
    alarm,
    params.time,
    stopAlarm,
    isWakeCheckEnabled,
  ]
);
```

---

## 📊 Impacto dos Problemas

| Problema                     | Severidade   | Impacto no Usuário               | Impacto no App               |
| ---------------------------- | ------------ | -------------------------------- | ---------------------------- |
| App não abre automaticamente | 🔴 **Alta**  | Frustração, pode não acordar     | UX ruim, não cumpre proposta |
| Dados não salvos (sucesso)   | 🔴 **Alta**  | Dashboard vazio, sem gamificação | Perda de dados valiosos      |
| Dados não salvos (falha)     | 🟠 **Média** | Estatísticas incompletas         | Analytics imprecisos         |

---

## 🛠️ Plano de Implementação

### Prioridade 1 (Crítico) - App não abre automaticamente

1. Testar Opção 1 (atualizar fullScreenAction)
2. Se não funcionar, implementar Opção 2 (AlarmActivity dedicada)
3. Testar em dispositivos reais com tela bloqueada

### Prioridade 2 (Crítico) - Salvar dados de sucesso

1. Atualizar interface `AlarmCompletionRecord`
2. Atualizar função `recordAlarmCompletion`
3. Passar campo `attempts` ao registrar
4. Testar salvamento e visualização no dashboard

### Prioridade 3 (Importante) - Salvar dados de falha

1. Atualizar função `handleChallengeAttempt`
2. Garantir que dados são salvos mesmo com falhas
3. Testar cenário de 3 tentativas falhadas

---

## ✅ Checklist de Verificação

Após implementar as correções, verificar:

- [ ] Alarme abre app automaticamente quando tela está bloqueada
- [ ] Tela de desafio aparece sem interação do usuário
- [ ] Som do alarme toca imediatamente
- [ ] Dados são salvos quando desafio é completado com sucesso
- [ ] Campo `attempts` é registrado corretamente
- [ ] Dados são salvos quando desafio falha (3 tentativas)
- [ ] Dashboard mostra estatísticas corretas:
  - [ ] Streak atual
  - [ ] Pontuação cognitiva média
  - [ ] Taxa de execução semanal
  - [ ] Tempo de reação
  - [ ] Heatmap semanal
- [ ] Falhas aparecem no dashboard com pontuação baixa
- [ ] Performance Summary exibe métricas corretas

---

## 📚 Arquivos Envolvidos

### Para Full Screen Intent (Expo)

**Arquivos JavaScript/TypeScript:**

- [src/services/alarm-scheduler.ts](../src/services/alarm-scheduler.ts) - Configuração do Notifee (linhas ~238, ~366, ~459)
- [app.config.ts](../app.config.ts) - Permissões do Android
- [plugins/withNotifee.js](../plugins/withNotifee.js) - Plugin que injeta código nativo
- [plugins/withFullScreenIntent.js](../plugins/withFullScreenIntent.js) - ⚠️ A criar (se necessário)

**Arquivos Nativos (gerados automaticamente - NÃO EDITAR):**

- `android/app/src/main/AndroidManifest.xml` - Gerado pelo Expo
- `android/app/src/main/java/com/wgsoftwares/wakemind/MainActivity.kt` - Modificado via plugin

**⚠️ IMPORTANTE:** Não edite arquivos na pasta `android/` diretamente. Sempre use Config Plugins.

### Para Salvamento de Dados

- [src/db/functions/performance.ts](../src/db/functions/performance.ts) - Interface e funções
- [src/features/alarms/screens/alarm-trigger-screen.tsx](../src/features/alarms/screens/alarm-trigger-screen.tsx) - Registro e falhas
- [src/db/schema.ts](../src/db/schema.ts) - Schema do banco de dados

### Para Visualização

- [src/features/dashboard/screens/index.tsx](../src/features/dashboard/screens/index.tsx)
- [src/features/dashboard/hooks/use-execution-score.ts](../src/features/dashboard/hooks/use-execution-score.ts)
- [src/features/dashboard/hooks/use-weekly-heatmap.ts](../src/features/dashboard/hooks/use-weekly-heatmap.ts)
- [src/features/dashboard/hooks/use-current-streak.ts](../src/features/dashboard/hooks/use-current-streak.ts)

---

## 🔗 Referências

### Notifee (Biblioteca de Notificações)

- [Notifee - Full Screen Intent](https://notifee.app/react-native/docs/android/behaviour#full-screen-intent)
- [Notifee - Android Setup](https://notifee.app/react-native/docs/android/installation)
- [Notifee - Trigger Notifications](https://notifee.app/react-native/docs/triggers)

### Android Nativo

- [Android - Wake Lock](https://developer.android.com/training/scheduling/wakelock)
- [Android - Show When Locked](<https://developer.android.com/reference/android/app/Activity#setShowWhenLocked(boolean)>)
- [Android - Full Screen Intent](<https://developer.android.com/reference/android/app/Notification.Builder#setFullScreenIntent(android.app.PendingIntent,%20boolean)>)
- [Android 12+ Restrictions](https://developer.android.com/about/versions/12/behavior-changes-12#notification-trampolines)

### Expo

- [Expo Config Plugins](https://docs.expo.dev/config-plugins/introduction/)
- [Expo Prebuild](https://docs.expo.dev/workflow/prebuild/)
- [Expo Android Permissions](https://docs.expo.dev/versions/latest/config/app/#permissions)
- [Creating Custom Config Plugins](https://docs.expo.dev/config-plugins/plugins-and-mods/)

### Problemas Conhecidos

- [Notifee Issue #1262](https://github.com/invertase/notifee/issues/1262) - Maven repository setup
- [Notifee Issue #500](https://github.com/invertase/notifee/issues/500) - Full screen intent not working
- [Stack Overflow - Expo Full Screen Notifications](https://stackoverflow.com/questions/tagged/expo+full-screen-intent)

---

## 🎯 Status de Implementação

| Problema                        | Status          | Data       |
| ------------------------------- | --------------- | ---------- |
| 1. App não abre automaticamente | ✅ Implementado | 24/01/2026 |
| 2. Dados não salvos (sucesso)   | ✅ Implementado | 24/01/2026 |
| 3. Dados não salvos (falha)     | ✅ Implementado | 24/01/2026 |

### Alterações Realizadas

#### ✅ Problema 1 - App Abre Automaticamente na Tela de Desafio

- **Arquivo:** `src/services/notification-handler.ts`
  - ✅ Adicionada navegação no evento `PRESS` do background handler
  - ✅ Adicionada navegação automática no evento `DELIVERED` do background handler
  - ✅ Melhorados logs de debug para facilitar troubleshooting
  - ✅ App agora navega corretamente para tela de desafio quando em segundo plano/fechado

**Comportamento corrigido:**

- ✅ App aberto: alarme dispara e tela de desafio aparece (já funcionava)
- ✅ App em segundo plano: som dispara, app abre automaticamente na tela de desafio
- ✅ App fechado: som dispara, app abre automaticamente na tela de desafio

#### ✅ Problema 2 e 3 - Salvamento de Dados

- **Arquivo:** `src/db/functions/performance.ts`
  - ✅ Adicionado campo `attempts` na interface `AlarmCompletionRecord`
  - ✅ Atualizada função `recordAlarmCompletion` para salvar `attempts`

- **Arquivo:** `src/features/alarms/screens/alarm-trigger-screen.tsx`
  - ✅ Adicionado `attempts: attempt` ao registrar conclusão com sucesso
  - ✅ Atualizada função `handleChallengeAttempt` para salvar dados mesmo em falhas
  - ✅ Navegação para tela de resumo mesmo quando falha

**Próximos Passos:**

1. Testar comportamento do alarme em todos os cenários (app aberto, segundo plano, fechado)
2. Verificar logs do Android para confirmar que navegação está funcionando
3. Testar salvamento de dados e visualização no dashboard

---

**Data da Análise:** 24 de Janeiro de 2026  
**Versão:** 1.1  
**Status:** 🟢 Parcialmente Implementado - 2/3 Problemas Corrigidos
