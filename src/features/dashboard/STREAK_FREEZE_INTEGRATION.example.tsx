/**
 * EXEMPLO: Como integrar o Streak Freeze Widget ao Dashboard
 *
 * Este arquivo mostra como adicionar o widget de Streak Freeze ao dashboard principal.
 * Copie o código abaixo e integre ao arquivo:
 * src/features/dashboard/screens/index.tsx
 */

// ==============================================================================
// PASSO 1: Adicionar imports no topo do arquivo
// ==============================================================================

import { StreakFreezeWidget } from '@/features/dashboard/components/widgets/streak-freeze';
import { useStreakFreeze } from '@/hooks/use-streak-freeze';

// ==============================================================================
// PASSO 2: Adicionar o hook no componente DashboardScreen
// ==============================================================================

// Dentro do componente DashboardScreen(), após os outros hooks:
const { availableTokens, useFreezeToken } = useStreakFreeze();

// ==============================================================================
// PASSO 3: Adicionar o widget ao render, após CurrentStreak
// ==============================================================================

// Substituir a seção "Current Streak and Avg Latency Grid" por:

{
  /* Current Streak, Streak Freeze, and Avg Latency Grid */
}
{
  (enabledWidgets.has(WidgetType.CURRENT_STREAK) || enabledWidgets.has(WidgetType.AVG_LATENCY)) && (
    <View className="gap-4">
      {/* Primeira linha: CurrentStreak e AvgLatency */}
      <View className="flex-row gap-4">
        {enabledWidgets.has(WidgetType.CURRENT_STREAK) && <CurrentStreak streak={currentStreak} />}
        {enabledWidgets.has(WidgetType.AVG_LATENCY) && <AvgLatency latencyMinutes={avgLatency} />}
      </View>

      {/* Segunda linha: Streak Freeze (sempre visível) */}
      <StreakFreezeWidget availableTokens={availableTokens} onUseToken={useFreezeToken} />
    </View>
  );
}

// ==============================================================================
// ALTERNATIVA: Adicionar apenas quando o usuário tem streak ativa
// ==============================================================================

// Se quiser mostrar o widget apenas quando há uma streak:

{
  currentStreak > 0 && (
    <StreakFreezeWidget availableTokens={availableTokens} onUseToken={useFreezeToken} />
  );
}

// ==============================================================================
// EXEMPLO COMPLETO: Estrutura final do dashboard
// ==============================================================================

/*
<ScrollView>
  {/* Wake Consistency Chart }
  <WakeConsistencyChart ... />

  {/* Current Streak, Streak Freeze, and Avg Latency }
  <View className="gap-4">
    <View className="flex-row gap-4">
      <CurrentStreak streak={currentStreak} />
      <AvgLatency latencyMinutes={avgLatency} />
    </View>
    
    {/* Streak Freeze - Mostrar sempre ou condicionalmente }
    {currentStreak > 0 && (
      <StreakFreezeWidget
        availableTokens={availableTokens}
        onUseToken={useFreezeToken}
      />
    )}
  </View>

  {/* Outros widgets... }
</ScrollView>
*/

// ==============================================================================
// NOTAS IMPORTANTES
// ==============================================================================

/**
 * 1. O widget de Streak Freeze:
 *    - Mostra 3 ícones de "gelo" representando os tokens
 *    - Ícones preenchidos = tokens disponíveis
 *    - Ícones vazios = tokens já usados
 *    - Barra de progresso embaixo mostra visualmente os tokens restantes
 *
 * 2. Para usuários FREE:
 *    - Widget mostra badge "PRO"
 *    - Ao clicar, abre diálogo oferecendo upgrade
 *    - Redireciona para a tela de paywall
 *
 * 3. Para usuários PRO:
 *    - Mostra tokens disponíveis (0-3)
 *    - Ao clicar, abre confirmação para usar token
 *    - Após confirmação, protege o dia seguinte
 *    - Tokens resetam mensalmente (no dia 1)
 *
 * 4. Integração com Streak:
 *    - O hook useCurrentStreak já considera dias protegidos
 *    - Se um dia estiver protegido por freeze, a streak não quebra
 *    - Logs no console mostram quando um dia está protegido
 *
 * 5. Funcionalidades adicionais:
 *    - useStreakFreeze() retorna:
 *      * availableTokens: number - tokens disponíveis no mês
 *      * isLoading: boolean - estado de carregamento
 *      * useFreezeToken: () => Promise<boolean> - usa um token
 *      * isDateProtected: (date: string) => Promise<boolean> - verifica proteção
 *      * getHistory: () => Promise<StreakFreeze[]> - histórico de uso
 *      * refreshTokens: () => Promise<void> - recarrega contagem
 */

export {};
