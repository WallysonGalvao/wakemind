# WakeMind - Roadmap

Este documento descreve os próximos passos planejados para o desenvolvimento do WakeMind.

## 📊 Status Atual - MVP PRONTO ✅

### ✅ Concluído (Core MVP)

- [x] Sistema de alarmes com Zustand + MMKV persistência
- [x] Criação de alarmes com time picker
- [x] Edição de alarmes completa
- [x] Exclusão de alarmes
- [x] Toggle de ativação de alarmes
- [x] Seleção de desafios cognitivos (Math, Memory, Logic)
- [x] Seleção de dificuldade (Easy, Medium, Hard)
- [x] Backup protocols (Snooze, Wake Check) - funcionais
- [x] Refatoração completa para TypeScript Enums
- [x] Sistema de settings (Tema, Idioma)
- [x] Validação de input com sanitização
- [x] UUID único para alarmes (expo-crypto)
- [x] Validação de alarmes duplicados
- [x] Error handling com i18n
- [x] Componente genérico `SegmentedControl` com animações
- [x] Descrições dinâmicas por nível de dificuldade
- [x] Animações no `TimePickerWheel` (scale, opacity, 3D rotation)
- [x] Animações no carousel de challenges (scale, opacity durante scroll)
- [x] Componente `ProtocolToggle` usando `Switch` padrão
- [x] Refatoração do `Header` para dark mode
- [x] Cores corretamente aplicadas em dark/light mode
- [x] GestureHandlerRootView configurado no root layout
- [x] Documentação de regras expo-image em CLAUDE.md
- [x] Componente `ScheduleSelector` implementado
- [x] Suporte a seleção customizada de dias da semana
- [x] Modo de edição de alarmes completo
- [x] Navegação edit-alarm com query params
- [x] Botão de exclusão no formulário de edição
- [x] Suite de testes unitários (store, validations, components)
- [x] Validação de alarmes duplicados com excludeId
- [x] **Notificações locais com Notifee** (agendamento real)
- [x] **Tela de Alarme Disparado** (alarm-trigger-screen.tsx)
- [x] **3 Challenges completos** (Math, Memory, Logic)
- [x] **Som de alarme em loop**
- [x] **Vibração contínua**
- [x] **Keep Awake** durante alarme
- [x] **Full Screen Intent** (Android)
- [x] **Internacionalização 3 idiomas** (EN, PT, ES)
- [x] **Wake Check protocol** (notificação 5min após dismiss)
- [x] **Snooze condicional** (baseado no protocol)
- [x] **iOS Critical Alerts** (notificações que ignoram Do Not Disturb)

### 🟡 Em Progresso

- [ ] Settings adicionais (volume, vibração, som custom)

### 🔮 Features Futuras (Pós-MVP)

- [ ] Barcode Scan protocol (requer implementação de câmera)
- [ ] Difficulty Adaptive (requer ML/histórico de performance)

## 🎯 Fase 1 - Funcionalidades Core (Prioritário)

### 1.1 Sistema de Agendamento Completo

**Status:** ✅ Concluído
**Prioridade:** Alta
**Tempo Estimado:** 2-3 dias

#### Objetivos:

- [x] Implementar seletor de schedule na tela de criação
- [x] Criar componente `ScheduleSelector`
- [x] Suportar seleção customizada de dias da semana
- [x] Implementar multi-select com `SegmentedControl`
- [x] Lógica para formatação de labels (Daily, Weekdays, Weekends, Custom)
- [x] Integração com `alarm-form.tsx` e `AlarmFormData`
- [ ] Lógica para determinar próximo disparo do alarme (pendente)

#### Arquivos criados/modificados:

```
✅ src/features/alarms/components/schedule-selector.tsx (criado)
✅ src/features/alarms/schemas/alarm-form.schema.ts (atualizado)
✅ src/features/alarms/screens/alarm-form.tsx (integrado)
✅ src/types/alarm.ts (suporta schedule string)
```

---

### 1.2 Edição de Alarmes

**Status:** ✅ Concluído
**Prioridade:** Alta
**Tempo Estimado:** 1-2 dias

#### Objetivos:

- [x] Criar tela `edit-alarm.tsx` com roteamento
- [x] Implementar navegação com parâmetro `alarmId`
- [x] Pré-popular formulário com dados existentes
- [x] Usar `updateAlarm` do store
- [x] Adicionar botão "Save Changes" dinâmico
- [x] Manter validação de duplicatas com `excludeId`
- [x] Implementar botão de exclusão no modo edição
- [x] Navegação via `AlarmCard` ao pressionar

#### Arquivos criados/modificados:

```
✅ src/app/alarm/edit-alarm.tsx (criado)
✅ src/features/alarms/screens/alarm-form.tsx (modo dual: create/edit)
✅ src/features/alarms/components/alarm-card.tsx (onPress handler)
✅ src/features/alarms/screens/index.tsx (handleEditAlarm)
✅ src/stores/use-alarms-store.ts (updateAlarm com validação)
```

---✅ Concluído (Parcial)
**Prioridade:** Média
**Tempo Estimado:** 0.5-1 dia

#### Objetivos:

- [x] Usar `deleteAlarm` do store
- [x] Botão de exclusão no modo edição do formulário
- [x] Navegação automática após exclusão

#### Arquivos modificados:

```
✅ src/stores/use-alarms-store.ts (deleteAlarm implementado)
✅ src/features/alarms/screens/alarm-form.tsx (botão delete no edit mode)
⚠️ src/features/alarms/components/alarm-card.tsx (swipe action pendente)
⚠️ src/features/alarms/screens/index.tsx (confirmação pendente)

```

src/features/� Parcial
**Prioridade:** Média
**Tempo Estimado:** 1 dia

#### Objetivos:

- [x] Lista de alarmes com `FlashList` (otimizado)
- [x] Toggle de ativação individual por alarme
- [x] Pull-to-refresh implementado
- [x] Animações de entrada (FadeIn/FadeOut)
- [x] Empty state com ilustração
- [x] Ordenar alarmes por horário (AM primeiro, depois PM)
- [ ] Agrupar alarmes ativos/inativos
- [ ] Adicionar filtros (Todos, Ativos, Inativos)
- [ ] Indicador visual de próximo alarme
- [ ] Badge com contagem de alarmes ativos

#### Arquivos implementados/pendentes:

```
✅ src/features/alarms/screens/index.tsx (lista com sorting)
✅ src/features/alarms/components/alarm-card.tsx (card component)
✅ src/utils/alarm-sorting.ts (sorting logic)
⚠️ src/features/alarms/components/alarms-header.tsx (filtros pendentes)

#### Arquivos a serem modificados:

```

src/features/alarms/screens/index.tsx
src/utils/alarm-sorting.ts (novo)

````

---

## 🚀 Fase 2 - Notificações e Alarmes Reais

### 2.1 Notificações Locais

**Status:** ✅ Concluído
**Prioridade:** Alta

#### Objetivos:

- [x] Configurar `@notifee/react-native` (substituiu expo-notifications)
- [x] Solicitar permissões de notificação
- [x] Agendar notificação ao criar alarme
- [x] Cancelar notificação ao deletar alarme
- [x] Reagendar ao editar alarme
- [x] Configurar som de alarme
- [x] Configurar vibração
- [x] Notificação persistente (ongoing)
- [x] Full Screen Intent (Android)
- [x] Canal de alta prioridade com bypassDnd

#### Arquivos implementados:

```
✅ src/services/alarm-scheduler.ts (412 linhas)
✅ src/services/notification-handler.ts (229 linhas)
✅ src/hooks/use-alarm-permissions.ts
```

---

### 2.2 Foreground Service para Alarmes

**Status:** ✅ Concluído
**Prioridade:** Alta

#### Objetivos:

- [x] Usar Notifee para foreground/background handling
- [x] Alarme dispara com app fechado (TimestampTrigger)
- [x] Wake lock via expo-keep-awake
- [x] Abrir app automaticamente (pressAction)
- [x] Tela fullscreen de alarme

#### Arquivos implementados:

```
✅ src/services/alarm-scheduler.ts
✅ src/services/notification-handler.ts
✅ src/features/alarms/screens/alarm-trigger-screen.tsx
✅ src/app/alarm/trigger.tsx
```

---

## 🎮 Fase 3 - Desafios Interativos

### 3.1 Math Challenge

**Status:** ✅ Concluído
**Prioridade:** Média

#### Objetivos:

- [x] Criar componente de desafio matemático
- [x] Gerar problemas baseados na dificuldade:
  - Easy: Adição/subtração simples (2+3)
  - Medium: Duas operações (12+5-3)
  - Hard: Multiplicação incluída (8×7)
- [x] Teclado numérico customizado
- [x] Feedback háptico e visual
- [x] Número de dígitos dinâmico
- [x] Animações de sucesso/erro

#### Arquivos implementados:

```
✅ src/features/alarms/components/challenges/math-challenge.tsx (271 linhas)
src/features/challenges/screens/math-challenge.tsx (novo)
src/features/challenges/utils/math-generator.ts (novo)
src/stores/use-challenge-stats-store.ts (novo)
```

---

### 3.2 Memory Challenge

**Status:** ✅ Concluído
**Prioridade:** Média

#### Objetivos:

- [x] Jogo de memória estilo Simon Says
- [x] Padrão de cores (3-6 cores baseado em dificuldade)
- [x] Countdown antes de mostrar padrão (5s inicial, 3s review)
- [x] Animações de destaque
- [x] Opção de revisar padrão após 3 erros
- [x] Feedback háptico

#### Arquivos implementados:

```
✅ src/features/alarms/components/challenges/memory-challenge.tsx (508 linhas)
```

---

### 3.3 Logic Challenge

**Status:** ✅ Concluído
**Prioridade:** Média

#### Objetivos:

- [x] 2 tipos de puzzles: Sequence e Odd One Out
- [x] Geração procedural por dificuldade
- [x] Sistema de hints
- [x] Animações de sucesso/erro
- [x] Múltiplas tentativas

#### Arquivos implementados:

```
✅ src/features/alarms/components/challenges/logic-challenge.tsx (289 linhas)
```

---

## 📊 Fase 4 - Analytics e Insights (Pós-MVP)

### 4.1 Estatísticas de Uso

**Status:** 🔴 Não Iniciado
**Prioridade:** Baixa
**Tempo Estimado:** 2-3 dias

#### Objetivos:

- [ ] Tela de estatísticas
- [ ] Gráficos com `react-native-chart-kit`
- [ ] Métricas:
  - Taxa de sucesso nos desafios
  - Horário médio de despertar
  - Streaks (dias consecutivos)
  - Desafios mais difíceis
  - Tempo médio para resolver
- [ ] Exportar dados (CSV/JSON)

#### Arquivos a serem criados:

```
src/features/stats/screens/index.tsx (novo)
src/stores/use-stats-store.ts (novo)
src/utils/stats-calculator.ts (novo)
```

---

### 4.2 Insights e Recomendações

**Status:** 🔴 Não Iniciado
**Prioridade:** Baixa
**Tempo Estimado:** 2 dias

#### Objetivos:

- [ ] Analisar padrões de sono
- [ ] Sugerir melhor horário de alarme
- [ ] Recomendar dificuldade adaptativa
- [ ] Tips para melhor despertar

---

## 🎨 Fase 5 - UX/UI Melhorias (Contínua)

### 5.1 Animações e Transições

**Status:** ✅ Concluído (Base)
**Prioridade:** Média

#### Objetivos:

- [x] Animações no TimePickerWheel (scale, opacity, 3D rotation)
- [x] Animações no carousel de challenges (scale, opacity)
- [x] Animações no SegmentedControl (sliding, gestures)
- [ ] Animação de criação de alarme (confetti?)
- [ ] Transição suave entre telas
- [ ] Loading states
- [ ] Skeleton screens
- [ ] Micro-interações

---

### 5.2 Acessibilidade

**Status:** 🟡 Em Progresso (Parcial)
**Prioridade:** Alta

#### Objetivos:

- [ ] Screen reader support completo
- [ ] Contraste de cores (WCAG AA)
- [ ] Font scaling
- [ ] Navegação por teclado
- [ ] Haptic feedback

---

### 5.3 Dark Mode Otimizado

**Status:** ✅ Concluído (Base)
**Prioridade:** Alta

#### Objetivos:

- [x] Setup Jest + React Native Testing Library
- [x] Testes para stores (Zustand) - `use-alarms-store.test.ts`
- [x] Testes para utils/validators - `alarm-validation.test.ts`
- [x] Testes para componentes principais - `alarm-form.test.tsx`
- [x] Cobertura de casos principais (add, update, delete, toggle, validation)
- [ ] Coverage mínimo de 70% (pendente medição)
- [ ] Testes para novos componentes (ScheduleSelector, DifficultySelector, etc.)

#### Arquivos implementados:

```
✅ src/stores/use-alarms-store.test.ts (criado - 10+ test cases)
✅ src/utils/alarm-validation.test.ts (criado - validações completas)
✅ src/features/alarms/screens/alarm-form.test.tsx (criado - rendering + edit mode)
✅ jest.config.js (configurado)
✅ jest.setup.js (configurado)
✅ jest.polyfills.js (configurada

#### Objetivos:

- [ ] Setup Jest + React Native Testing Library
- [ ] Testes para stores (Zustand)
- [ ] Testes para utils/validators
- [ ] Testes para componentes principais
- [ ] Coverage mínimo de 70%

#### Arquivos:

```

src/stores/**tests**/use-alarms-store.test.ts (novo)
src/utils/**tests**/alarm-validation.test.ts (novo)
jest.config.js (novo)

````

---

### 6.2 Testes de Integração

**Status:** 🔴 Não Iniciado
**Prioridade:** Média

#### Objetivos:

- [ ] Fluxo completo de criar alarme
- [ ] Fluxo de editar alarme
- [ ] Fluxo de deletar alarme
- [ ] Fluxo de notificações

---

### 6.3 E2E Testing

**Status:** 🔴 Não Iniciado
**Prioridade:** Baixa

#### Objetivos:

- [ ] Setup Detox ou Maestro
- [ ] Testes de user journeys críticos
- [ ] CI/CD integration

---

## 📱 Fase 7 - Plataforma e Performance

### 7.1 Otimizações Android

**Status:** 🔴 Não Iniciado

#### Objetivos:

- [ ] Battery optimization
- [ ] Doze mode handling
- [ ] Background restrictions
- [ ] Deep links

---

### 7.2 Otimizações iOS

**Status:** 🔴 Não Iniciado

#### Objetivos:

- [ ] Background modes
- [ ] Critical alerts permission
- [ ] Widget support
- [ ] Siri shortcuts

---

### 7.3 Performance

**Status:** 🟡 Parcial

#### Objetivos:

- [ ] Profiling com Flipper
- [ ] Otimizar re-renders
- [ ] Lazy loading de telas
- [ ] Image optimization
- [ ] Bundle size reduction

---

## 🔐 Fase 8 - Segurança e Privacidade

### 8.1 Data Privacy

**Status:** 🟡 Parcial

#### Objetivos:

- [ ] Criptografia de dados sensíveis
- [ ] Privacy policy
- [ ] Terms of service
- [ ] Data export/delete

---

### 8.2 Backup e Sync

**Status:** 🔴 Não Iniciado

#### Objetivos:

- [ ] Cloud backup (opcional)
- [ ] Import/Export alarmes
- [ ] Migração entre dispositivos

---

## 📝 Melhorias Técnicas Identificadas

### Refatorações Sugeridas

#### Hooks Customizados

```typescript
// Criar hooks para lógicas reutilizáveis
src / hooks / use - alarm - form.ts;
src / hooks / use - time - formatting.ts;
src / hooks / use - alarm - schedule.ts;
```

#### Utils e Helpers

```typescript
// Helpers para formatação e cálculos
src / utils / time - helpers.ts;
src / utils / schedule - calculator.ts;
src / utils / next - alarm - time.ts;
```

#### Constantes Centralizadas

```typescript
// Mover magic numbers para constantes
src / constants / alarm - limits.ts;
src / constants / notification - config.ts;
```

---

## 📚 Documentação

### Necessário

- [ ] README.md atualizado
- [ ] API documentation (se houver backend)
- [ ] Component library (Storybook?)
- [ ] Contributing guidelines
- [ ] Architecture decision records (ADR)

---

## 🐛 Bugs Conhecidos

Nenhum bug crítico reportado no momento.

---

## 🎯 STATUS MVP

### ✅ MVP COMPLETO - Pronto para Beta Testing

O WakeMind possui todas as funcionalidades core implementadas:

| Feature          | Status | Notas                          |
| ---------------- | ------ | ------------------------------ |
| CRUD de Alarmes  | ✅     | Criar, editar, excluir, toggle |
| Agendamento Real | ✅     | Notifee com TimestampTrigger   |
| Tela de Alarme   | ✅     | Som, vibração, keep-awake      |
| Math Challenge   | ✅     | 3 níveis de dificuldade        |
| Memory Challenge | ✅     | Simon Says com review          |
| Logic Challenge  | ✅     | Sequence + Odd One Out         |
| Snooze Protocol  | ✅     | Reagendamento funcional        |
| Wake Check       | ✅     | Notificação 5min após          |
| Settings         | ✅     | Tema + Idioma                  |
| i18n             | ✅     | EN, PT, ES                     |
| Dark Mode        | ✅     | Light/Dark/System              |
| Persistência     | ✅     | MMKV + Zustand                 |

### 🔴 Faltando para MVP Completo

1. **Barcode Scan** - Implementar câmera
2. **iOS Critical Alerts** - Habilitar entitlement
3. **Testes E2E** - Maestro/Detox

### 📈 Métricas do Projeto

- **~60 arquivos TypeScript/TSX**
- **~8000+ linhas de código**
- **5 arquivos de teste (~1915 linhas)**
- **~25 componentes UI**
- **7 hooks customizados**
- **2 stores Zustand**

---

## 🚀 Features Futuras (Pós-MVP)

- [ ] Wearables (smartwatch)
- [ ] Análise de qualidade do sono
- [ ] Integração com calendário
- [ ] Alarmes compartilhados (família/amigos)
- [ ] Gamificação (badges, achievements)
- [ ] Social features (leaderboards)
- [ ] Machine learning para horário ótimo
- [ ] Voice commands (Siri/Google Assistant)
- [ ] Spotify/Apple Music integration para alarme
- [ ] Sunrise simulation (brightness control)

---

## 📅 Timeline - ATUALIZADA

### Sprint 1-3 ✅ CONCLUÍDO

- ✅ Sistema de agendamento completo
- ✅ Edição de alarmes
- ✅ Exclusão de alarmes
- ✅ Notificações locais (Notifee)
- ✅ Foreground service
- ✅ Tela de alarme disparado
- ✅ Math Challenge
- ✅ Memory Challenge
- ✅ Logic Challenge
- ✅ Backup Protocols (Snooze, Wake Check)

### Sprint 4 (Atual)

- 🔄 Testes E2E
- 🔄 Barcode Scan (câmera)
- 🔄 Polimento de UX
- 🔄 Beta testing

### Sprint 5+ (Futuro)

- 🔄 Estatísticas e analytics
- 🔄 Features avançadas
- 🔄 Otimizações de performance
- 🔄 Publicação nas stores

---

## 📝 Notas da Última Atualização

### ✅ Features Implementadas (Janeiro 2026)

1. **Sistema de Notificações Completo** (Fase 2)
   - Notifee substituiu expo-notifications
   - Agendamento real com TimestampTrigger
   - Full Screen Intent (Android)
   - Canal de alta prioridade

2. **Tela de Alarme Disparado** (alarm-trigger-screen.tsx)
   - Integração com 3 challenges
   - Som em loop + vibração
   - Efficiency timer (30s)
   - Keep awake

3. **Challenges Completos** (Fase 3)
   - Math: 3 níveis, teclado numérico
   - Memory: Simon Says com countdown e review
   - Logic: Sequence + Odd One Out

4. **Backup Protocols**
   - Snooze condicional
   - Wake Check (notificação 5min após dismiss)

### ✅ Pronto para MVP

O aplicativo está funcional para uso real. Próximos passos são polimento e testes.

---

**Última atualização:** 2026-01-09
**Versão do Roadmap:** 2.0 (MVP Ready)

---

## 📊 Legenda

- ✅ Concluído
- 🟡 Em Progresso
- 🔴 Não Iniciado
- 🔄 Planejado para próximo sprint

---

**Última atualização:** 2026-01-08
**Versão do Roadmap:** 1.1
**Mantido por:** Time WakeMind

⚠️ Nota importante sobre iOS Critical Alerts:

Para publicar na App Store com Critical Alerts, você precisa:

Solicitar aprovação especial da Apple (entitlement especial)
Justificar o uso (apps de alarme geralmente são aprovados)
Formulário: https://developer.apple.com/contact/request/notifications-critical-alerts-entitlement/
