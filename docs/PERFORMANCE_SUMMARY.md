# Performance Summary - Guia de Integração

## Visão Geral

A tela de **Performance Summary** exibe estatísticas e métricas após o usuário completar com sucesso um desafio de alarme, mostrando:

- 🔥 **Streak**: Dias consecutivos de sucesso
- 🧠 **Cognitive Score**: Pontuação média nos desafios
- 📊 **Weekly Execution**: Taxa de execução semanal
- ⚡ **Reaction Speed**: Velocidade de reação nos últimos dias

## Arquivos Criados

### 1. Store de Performance

- **Arquivo**: `src/stores/use-performance-store.ts`
- **Função**: Gerencia histórico de alarmes, streaks, pontuações e estatísticas
- **Métodos principais**:
  - `recordAlarmCompletion()`: Registra conclusão de alarme
  - `getWeeklyStats()`: Retorna estatísticas semanais
  - `getCurrentStreak()`: Retorna streak atual
  - `getAverageCognitiveScore()`: Retorna pontuação média

### 2. Componentes de UI

- `src/features/performance/components/metric-card.tsx`
- `src/features/performance/components/progress-bar-card.tsx`
- `src/features/performance/components/trend-chart-card.tsx`

### 3. Tela Principal

- **Arquivo**: `src/features/performance/screens/morning-performance-summary-screen.tsx`
- **Rota**: `/alarm/performance-summary`

## Como Integrar com Alarm Trigger

### Exemplo de Integração

Adicione este código na tela de **Alarm Trigger** após o usuário completar o desafio:

```typescript
import { usePerformanceStore } from '@/stores/use-performance-store';
import { router } from 'expo-router';

// No seu componente AlarmTriggerScreen
export default function AlarmTriggerScreen() {
  const recordAlarmCompletion = usePerformanceStore((state) => state.recordAlarmCompletion);

  const handleChallengeSuccess = async () => {
    // Seus cálculos de pontuação e tempo de reação
    const cognitiveScore = calculateCognitiveScore(); // 0-100
    const reactionTime = Date.now() - challengeStartTime; // em ms
    const targetTime = alarm.time; // "05:00"
    const actualTime = dayjs().toISOString();
    const challengeType = alarm.challenge; // "Math Challenge", etc.

    // Registrar conclusão
    recordAlarmCompletion({
      targetTime,
      actualTime,
      cognitiveScore,
      reactionTime,
      challengeType,
    });

    // Navegar para summary
    router.replace('/alarm/performance-summary');
  };

  // ... resto do código
}
```

### Cálculo de Cognitive Score (Exemplo)

```typescript
function calculateCognitiveScore(
  attempts: number,
  timeSpent: number,
  difficulty: 'easy' | 'medium' | 'hard'
): number {
  // Pontuação base por dificuldade
  const baseScore = {
    easy: 60,
    medium: 75,
    hard: 90,
  }[difficulty];

  // Penalidade por tentativas extras (-5 pontos por tentativa extra)
  const attemptPenalty = Math.max(0, (attempts - 1) * 5);

  // Bônus por velocidade (se completar em menos de 30s)
  const speedBonus = timeSpent < 30000 ? 10 : 0;

  // Calcular score final
  const finalScore = Math.max(0, Math.min(100, baseScore - attemptPenalty + speedBonus));

  return Math.round(finalScore);
}
```

## Traduções

As traduções já foram adicionadas em EN, PT e ES:

- `performance.summary`
- `performance.wakeUpSuccess`
- `performance.missionAccomplished`
- `performance.target`
- `performance.actual`
- `performance.streak`
- `performance.daysConsistent`
- `performance.score`
- `performance.outOf100`
- `performance.weeklyExecution`
- `performance.reactionSpeed`
- `performance.startDay`
- `performance.quote`

## Analytics

Eventos rastreados automaticamente:

- `performance_summary_viewed`: Quando a tela é visualizada
- `performance_summary_shared`: Quando o usuário compartilha os resultados

## Próximos Passos Sugeridos

1. **Integrar com Alarm Trigger**: Adicionar chamada para `recordAlarmCompletion()` após desafio bem-sucedido
2. **Implementar cálculo de Cognitive Score**: Criar lógica de pontuação baseada em performance
3. **Personalizar métricas**: Ajustar valores de trending e comparações
4. **Testar fluxo completo**: Alarme → Desafio → Summary → Home

## Exemplo de Dados de Teste

Para testar a tela, você pode adicionar dados fictícios:

```typescript
// Em qualquer lugar do app (dev mode)
import { usePerformanceStore } from '@/stores/use-performance-store';

const { recordAlarmCompletion } = usePerformanceStore.getState();

// Adicionar algumas conclusões de teste
for (let i = 0; i < 7; i++) {
  recordAlarmCompletion({
    targetTime: '06:00',
    actualTime: dayjs().subtract(i, 'day').toISOString(),
    cognitiveScore: 70 + Math.random() * 30,
    reactionTime: 200 + Math.random() * 100,
    challengeType: 'Math Challenge',
  });
}
```

## Funcionalidades Implementadas

✅ Store de performance com persistência
✅ Cálculo automático de streaks
✅ Estatísticas semanais
✅ Componentes de UI reutilizáveis
✅ Traduções i18n (EN, PT, ES)
✅ Analytics integrado
✅ Funcionalidade de compartilhamento
✅ Roteamento configurado
✅ Dark mode suportado

## Funcionalidades Pendentes

⏳ Integração com Alarm Trigger Screen
⏳ Lógica de cálculo de Cognitive Score
⏳ Testes unitários
⏳ Animações de entrada/saída
⏳ Histórico detalhado de performances
