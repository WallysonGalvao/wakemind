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

#### Causa Raiz

O problema está na configuração do `fullScreenAction` no arquivo [alarm-scheduler.ts](../src/services/alarm-scheduler.ts#L236-L241):

```typescript
fullScreenAction: {
  id: 'alarm-triggered',
  launchActivity: 'default',
  mainComponent: 'default',
},
```

**Análise:**

1. ✅ O Android Manifest tem a permissão `USE_FULL_SCREEN_INTENT` configurada
2. ✅ O MainActivity.kt tem os flags corretos (`setShowWhenLocked`, `setTurnScreenOn`)
3. ❌ Mas o `fullScreenAction` não está configurado corretamente para lançar uma intent específica

**Problema Específico:**

- O `fullScreenAction` está usando `launchActivity: 'default'` que não garante que o app seja aberto em fullscreen
- Falta configurar uma Intent explícita que force a abertura do app mesmo com tela bloqueada

#### Solução Proposta

**Opção 1: Usar Full Screen Intent Correto (Recomendado)**

Atualizar o `fullScreenAction` no [alarm-scheduler.ts](../src/services/alarm-scheduler.ts#L236-L241):

```typescript
fullScreenAction: {
  id: 'alarm-triggered',
  // Em vez de 'default', usar o caminho completo da activity
  launchActivity: 'com.wgsoftwares.wakemind.MainActivity',
  mainComponent: 'default',
},
```

**Opção 2: Criar uma Activity Dedicada para Alarmes**

Criar uma `AlarmActivity.kt` separada que seja lançada exclusivamente para alarmes:

```kotlin
// android/app/src/main/java/com/wgsoftwares/wakemind/AlarmActivity.kt
package com.wgsoftwares.wakemind

import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import com.facebook.react.ReactActivity

class AlarmActivity : ReactActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    // Flags para despertar o dispositivo
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      setShowWhenLocked(true)
      setTurnScreenOn(true)
    } else {
      window.addFlags(
        WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
        WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
        WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
      )
    }

    // Manter a tela ligada
    window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
  }

  override fun getMainComponentName(): String = "main"
}
```

E no AndroidManifest.xml:

```xml
<activity
  android:name=".AlarmActivity"
  android:launchMode="singleTask"
  android:showWhenLocked="true"
  android:turnScreenOn="true"
  android:exported="false">
</activity>
```

E no alarm-scheduler.ts:

```typescript
fullScreenAction: {
  id: 'alarm-triggered',
  launchActivity: 'com.wgsoftwares.wakemind.AlarmActivity',
  mainComponent: 'default',
},
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

### Para Full Screen Intent

- `src/services/alarm-scheduler.ts` (linha 236-241)
- `android/app/src/main/AndroidManifest.xml`
- `android/app/src/main/java/com/wgsoftwares/wakemind/MainActivity.kt`

### Para Salvamento de Dados

- `src/db/functions/performance.ts` (interface e funções)
- `src/features/alarms/screens/alarm-trigger-screen.tsx` (registro e falhas)
- `src/db/schema.ts` (schema do banco de dados)

### Para Visualização

- `src/features/dashboard/screens/index.tsx`
- `src/features/dashboard/hooks/use-execution-score.ts`
- `src/features/dashboard/hooks/use-weekly-heatmap.ts`
- `src/features/dashboard/hooks/use-current-streak.ts`

---

## 🔗 Referências

- [Notifee - Full Screen Intent](https://notifee.app/react-native/docs/android/behaviour#full-screen-intent)
- [Android - Wake Lock](https://developer.android.com/training/scheduling/wakelock)
- [Android - Show When Locked](<https://developer.android.com/reference/android/app/Activity#setShowWhenLocked(boolean)>)

---

## 🎯 Status de Implementação

| Problema                        | Status          | Data       |
| ------------------------------- | --------------- | ---------- |
| 1. App não abre automaticamente | ⏳ Pendente     | -          |
| 2. Dados não salvos (sucesso)   | ✅ Implementado | 24/01/2026 |
| 3. Dados não salvos (falha)     | ✅ Implementado | 24/01/2026 |

### Alterações Realizadas

#### ✅ Problema 2 e 3 - Salvamento de Dados

- **Arquivo:** `src/db/functions/performance.ts`
  - ✅ Adicionado campo `attempts` na interface `AlarmCompletionRecord`
  - ✅ Atualizada função `recordAlarmCompletion` para salvar `attempts`

- **Arquivo:** `src/features/alarms/screens/alarm-trigger-screen.tsx`
  - ✅ Adicionado `attempts: attempt` ao registrar conclusão com sucesso
  - ✅ Atualizada função `handleChallengeAttempt` para salvar dados mesmo em falhas
  - ✅ Navegação para tela de resumo mesmo quando falha

**Próximos Passos:**

1. Testar salvamento de dados com alarme real
2. Verificar se dashboard exibe dados corretamente
3. Implementar Problema 1 (Full Screen Intent)

---

**Data da Análise:** 24 de Janeiro de 2026  
**Versão:** 1.1  
**Status:** 🟢 Parcialmente Implementado - 2/3 Problemas Corrigidos
