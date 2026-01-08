# WakeMind - Roadmap

Este documento descreve os próximos passos planejados para o desenvolvimento do WakeMind.

## 📊 Status Atual

### ✅ Concluído

- [x] Sistema de alarmes com Zustand + MMKV persistência
- [x] Criação de alarmes com time picker
- [x] Seleção de desafios cognitivos (Math, Memory, Logic)
- [x] Seleção de dificuldade (Easy, Medium, Hard, Adaptive)
- [x] Backup protocols (Snooze, Wake Check, Barcode Scan)
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

## 🎯 Fase 1 - Funcionalidades Core (Prioritário)

### 1.1 Sistema de Agendamento Completo

**Status:** 🔴 Não Iniciado
**Prioridade:** Alta
**Tempo Estimado:** 2-3 dias

#### Objetivos:

- [ ] Implementar seletor de schedule na tela de criação
- [ ] Criar componente `ScheduleSelector`
- [ ] Suportar todos os tipos do enum `Schedule`:
  - [ ] `DAILY` - Todos os dias
  - [ ] `WEEKDAYS` - Segunda a Sexta
  - [ ] `WEEKENDS` - Sábado e Domingo
  - [ ] `ONCE` - Apenas uma vez
  - [ ] `CUSTOM` - Seleção customizada de dias (novo)
- [ ] Atualizar `Alarm` interface para incluir `selectedDays?: number[]`
- [ ] Lógica para determinar próximo disparo do alarme

#### Arquivos a serem criados/modificados:

```
src/features/alarms/components/schedule-selector.tsx (novo)
src/types/alarm.ts (modificar)
src/features/alarms/screens/new-alarm.tsx (modificar)
```

---

### 1.2 Edição de Alarmes

**Status:** 🔴 Não Iniciado
**Prioridade:** Alta
**Tempo Estimado:** 1-2 dias

#### Objetivos:

- [ ] Criar tela `edit-alarm.tsx`
- [ ] Implementar navegação com parâmetro `alarmId`
- [ ] Pré-popular formulário com dados existentes
- [ ] Usar `updateAlarm` do store
- [ ] Adicionar botão "Save Changes"
- [ ] Manter validação de duplicatas

#### Arquivos a serem criados/modificados:

```
src/features/alarms/screens/edit-alarm.tsx (novo)
src/app/(tabs)/alarm/edit-alarm/[id].tsx (novo)
src/features/alarms/components/alarm-card.tsx (adicionar botão edit)
```

---

### 1.3 Exclusão de Alarmes

**Status:** 🔴 Não Iniciado
**Prioridade:** Média
**Tempo Estimado:** 0.5-1 dia

#### Objetivos:

- [ ] Adicionar swipe action no `AlarmCard`
- [ ] Implementar confirmação de exclusão
- [ ] Usar `deleteAlarm` do store
- [ ] Adicionar animação de remoção
- [ ] Feedback visual de sucesso

#### Arquivos a serem modificados:

```
src/features/alarms/components/alarm-card.tsx
src/features/alarms/screens/index.tsx
```

---

### 1.4 Ordenação e Visualização

**Status:** 🔴 Não Iniciado
**Prioridade:** Média
**Tempo Estimado:** 1 dia

#### Objetivos:

- [ ] Ordenar alarmes por horário (AM primeiro, depois PM)
- [ ] Agrupar alarmes ativos/inativos
- [ ] Adicionar filtros (Todos, Ativos, Inativos)
- [ ] Indicador visual de próximo alarme
- [ ] Badge com contagem de alarmes ativos

#### Arquivos a serem modificados:

```
src/features/alarms/screens/index.tsx
src/utils/alarm-sorting.ts (novo)
```

---

## 🚀 Fase 2 - Notificações e Alarmes Reais (Alta Prioridade)

### 2.1 Notificações Locais

**Status:** 🔴 Não Iniciado
**Prioridade:** Alta
**Tempo Estimado:** 3-4 dias

#### Objetivos:

- [ ] Instalar e configurar `expo-notifications`
- [ ] Solicitar permissões de notificação
- [ ] Agendar notificação ao criar alarme
- [ ] Cancelar notificação ao deletar alarme
- [ ] Reagendar ao editar alarme
- [ ] Configurar som personalizado
- [ ] Configurar vibração
- [ ] Notificação persistente (não pode ser dismissed)

#### Dependências:

```bash
npx expo install expo-notifications
```

#### Arquivos a serem criados:

```
src/services/notification-service.ts (novo)
src/hooks/use-notifications.ts (novo)
```

---

### 2.2 Foreground Service para Alarmes

**Status:** 🔴 Não Iniciado
**Prioridade:** Alta
**Tempo Estimado:** 3-5 dias

#### Objetivos:

- [ ] Implementar foreground service para Android
- [ ] Garantir que alarme dispare mesmo com app fechado
- [ ] Implementar wake lock
- [ ] Abrir app automaticamente ao disparar
- [ ] Tela fullscreen de alarme

#### Arquivos a serem criados:

```
src/services/alarm-service.ts (novo)
src/screens/alarm-trigger.tsx (novo)
android/app/src/main/java/AlarmModule.java (novo)
```

---

## 🎮 Fase 3 - Desafios Interativos (Média Prioridade)

### 3.1 Math Challenge

**Status:** 🔴 Não Iniciado
**Prioridade:** Média
**Tempo Estimado:** 2-3 dias

#### Objetivos:

- [ ] Criar tela de desafio matemático
- [ ] Gerar problemas baseados na dificuldade:
  - Easy: Adição/subtração simples (2+3)
  - Medium: Multiplicação/divisão (12x3)
  - Hard: Problemas complexos (15x8+23)
  - Adaptive: Ajusta baseado no desempenho
- [ ] Timer visual
- [ ] Feedback de resposta (correta/incorreta)
- [ ] Múltiplas tentativas baseadas em dificuldade
- [ ] Histórico de performance

#### Arquivos a serem criados:

```
src/features/challenges/screens/math-challenge.tsx (novo)
src/features/challenges/utils/math-generator.ts (novo)
src/stores/use-challenge-stats-store.ts (novo)
```

---

### 3.2 Memory Match

**Status:** 🔴 Não Iniciado
**Prioridade:** Média
**Tempo Estimado:** 2-3 dias

#### Objetivos:

- [ ] Jogo de memória com cards
- [ ] Número de pares baseado em dificuldade
- [ ] Animações de flip
- [ ] Timer
- [ ] Pontuação

---

### 3.3 Logic Puzzle

**Status:** 🔴 Não Iniciado
**Prioridade:** Média
**Tempo Estimado:** 2-3 dias

#### Objetivos:

- [ ] Puzzles lógicos (sequências, padrões)
- [ ] Geração procedural
- [ ] Múltiplos tipos de puzzle
- [ ] Adaptação de dificuldade

---

## 📊 Fase 4 - Analytics e Insights (Baixa Prioridade)

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

**Status:** ✅ Implementado

#### Objetivos:

- [x] Revisar cores em dark mode
- [x] Ajustar contrastes
- [ ] Otimizar gradientes
- [ ] Testar em diferentes dispositivos

---

## 🧪 Fase 6 - Qualidade e Testes (Contínua)

### 6.1 Testes Unitários

**Status:** 🔴 Não Iniciado
**Prioridade:** Alta

#### Objetivos:

- [ ] Setup Jest + React Native Testing Library
- [ ] Testes para stores (Zustand)
- [ ] Testes para utils/validators
- [ ] Testes para componentes principais
- [ ] Coverage mínimo de 70%

#### Arquivos:

```
src/stores/__tests__/use-alarms-store.test.ts (novo)
src/utils/__tests__/alarm-validation.test.ts (novo)
jest.config.js (novo)
```

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

## 💡 Ideias Futuras (Backlog)

### Features Experimentais

- [ ] Integração com wearables (smartwatch)
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

## 📅 Timeline Sugerida

### Sprint 1 (Semana 1-2)

- ✅ Sistema de agendamento completo
- ✅ Edição de alarmes
- ✅ Exclusão de alarmes
- ✅ Ordenação e filtros

### Sprint 2 (Semana 3-4)

- 🔄 Notificações locais
- 🔄 Foreground service
- 🔄 Tela de alarme disparado

### Sprint 3 (Semana 5-6)

- 🔄 Math Challenge implementado
- 🔄 Memory Match implementado
- 🔄 Logic Puzzle implementado

### Sprint 4 (Semana 7-8)

- 🔄 Estatísticas básicas
- 🔄 Testes unitários
- 🔄 Polimento de UX

### Sprint 5+ (Semana 9+)

- 🔄 Features avançadas
- 🔄 Otimizações
- 🔄 Beta testing

---

## 🤝 Contribuindo

Para contribuir com este roadmap:

1. Crie uma issue descrevendo a feature/melhoria
2. Aguarde aprovação antes de iniciar desenvolvimento
3. Siga as guidelines do projeto
4. Atualize este roadmap ao completar tarefas

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
