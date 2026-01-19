# WakeMind - Roadmap

Este documento descreve os próximos passos planejados para o desenvolvimento do WakeMind.

## 📊 Status Atual - MVP PRONTO ✅

### ✅ Concluído (Core MVP)

#### Sistema de Alarmes

- [x] CRUD completo de alarmes (criar, editar, excluir)
- [x] Toggle de ativação individual
- [x] Time picker com animações (scale, opacity, 3D rotation)
- [x] Seleção de dias da semana (Daily, Weekdays, Weekends, Custom)
- [x] Validação de alarmes duplicados com excludeId
- [x] UUID único para alarmes (expo-crypto)
- [x] **Persistência com SQLite (drizzle-orm)** - migrado de Zustand/MMKV
- [x] **Auto-refresh com useFocusEffect** (alarmes + performance)
- [x] **Alarm tones customizados** (15 sons disponíveis)
- [x] **Plugin iOS para sons customizados** (withSoundAssets.js)

#### Notificações e Alarmes Reais

- [x] Notifee com TimestampTrigger (agendamento real)
- [x] Full Screen Intent (Android)
- [x] iOS Critical Alerts (interruptionLevel: 'critical')
- [x] Canal de alta prioridade com bypassDnd
- [x] Som de alarme em loop
- [x] Vibração contínua
- [x] Keep Awake durante alarme

#### Desafios Cognitivos (3 de 3)

- [x] **Math Challenge** - 3 níveis, teclado numérico customizado
- [x] **Memory Challenge** - Simon Says com countdown e review
- [x] **Logic Challenge** - Sequence + Odd One Out

#### Backup Protocols

- [x] Snooze condicional (baseado no protocol)
- [x] Wake Check (notificação 5min após dismiss)

#### Onboarding Flow

- [x] 3 telas (Problem, Solution, Outcome)
- [x] Background animado com neural flow + fog
- [x] Navegação horizontal com FlatList
- [x] Progress bullets indicator
- [x] Suporte dark/light mode
- [x] Estado de conclusão persistido

#### Settings

- [x] Tema (Light/Dark/System)
- [x] Idioma (EN, PT-BR, ES)
- [x] Tela de Privacy Policy completa
- [x] Tela de Support com FAQ estruturado
- [x] Sound & Haptics (alarm tone, vibration)
- [x] Behavior (Snooze Protection, Prevent Auto Lock)

#### Qualidade

- [x] Internacionalização 3 idiomas (EN, PT-BR, ES)
- [x] Dark Mode completo em todas as telas
- [x] Acessibilidade (accessibilityRole, labels, hints)
- [x] Suite de testes (~1200+ linhas em 5 arquivos)
- [x] TypeScript strict mode
- [x] **Performance optimizations** (useMemo, useCallback)
- [x] **Error handling** e fallback values
- [x] **Code quality** (ESLint, Prettier, Husky hooks)

#### Analytics & Tracking

- [x] Mixpanel integration (Javascript Mode)
- [x] Screen view tracking automático (11 telas)
- [x] Alarm lifecycle events (create, update, delete, toggle, trigger, dismiss, snooze)
- [x] Challenge events (started, completed, failed)
- [x] Settings events (theme, language, alarm tone, vibration)
- [x] App lifecycle events (opened, backgrounded)
- [x] Sentry error tracking (Session Replay disabled)

#### Performance & Dados

- [x] **SQLite database** com expo-sqlite + drizzle-orm
- [x] **Performance metrics tracking** (streaks, scores, reaction times)
- [x] **Morning Performance Summary** com trends e gráficos
- [x] **Real-time data refresh** com useFocusEffect
- [x] **Database migrations** (backward compatibility)
- [x] **7-day performance history** com visualização de tendências

#### Estabilidade iOS

- [x] iOS crash fix (Sentry Session Replay desabilitado)
- [x] Notification services initialization delay (race condition fix)
- [x] Mixpanel Javascript Mode (Expo compatibility)

---

## 🎯 O QUE FALTA PARA LANÇAMENTO NAS STORES

### � Tarefas Técnicas Pendentes (Antes de Submeter)

| Item                       | Prioridade | Tempo Estimado | Descrição                                       |
| -------------------------- | ---------- | -------------- | ----------------------------------------------- |
| **Remover debug logs**     | Alta       | 2-3 horas      | Limpar console.logs de debugging                |
| **Reescrever testes .skip** | Média      | 1-2 dias       | Converter testes para padrão async/SQLite       |
| **Test coverage check**    | Média      | 2-3 horas      | Verificar cobertura atual e identificar gaps    |
| **iOS sound testing**      | Alta       | 1 dia          | Testar custom sounds no device real iOS         |
| **Android sound testing**  | Alta       | 1 dia          | Verificar alarm_sound.wav em devices reais      |
| **Performance testing**    | Alta       | 1 dia          | Validar SQLite performance em low-end devices   |

### �🚨 CRÍTICO - Bloqueadores de Lançamento

| Item                                  | Status      | Prazo Estimado | Descrição                                                     |
| ------------------------------------- | ----------- | -------------- | ------------------------------------------------------------- |
| **Apple Critical Alerts Entitlement** | 🔴 Pendente | 1-2 semanas    | Solicitar e aguardar aprovação da Apple para alarmes críticos |
| **Build de Produção iOS**             | 🔴 Pendente | 1-2 dias       | Gerar IPA, testar em device real, validar alarmes             |
| **Build de Produção Android**         | 🔴 Pendente | 1 dia          | Gerar APK/AAB, testar em device real, validar alarmes         |
| **Privacy Policy hospedada**          | 🔴 Pendente | 1 dia          | Criar página web ou usar GitHub Pages                         |
| **Screenshots App Store**             | 🔴 Pendente | 1 dia          | 5.5", 6.5", 12.9" + iPad (mín. 3 screens)                     |
| **Screenshots Play Store**            | 🔴 Pendente | 1 dia          | Phone + 7" + 10" tablets (mín. 2 screens)                     |
| **App Store metadata**                | 🔴 Pendente | 2-3 horas      | Título, subtítulo, descrição, keywords, categorias            |
| **Play Store metadata**               | 🔴 Pendente | 2-3 horas      | Título, descrição curta/longa, gráficos promocionais          |

**📍 Status atual:** 85% do MVP técnico completo. **Bloqueador principal:** Apple Critical Alerts Entitlement pode levar até 2 semanas.

### ⚡ Importante (Alta prioridade, mas não bloqueante)

| Item                    | Status          | Descrição                                                  |
| ----------------------- | --------------- | ---------------------------------------------------------- |
| Testes E2E              | 🔴 Não iniciado | Maestro ou Detox - pode ir depois do lançamento beta      |
| Rewrite testes SQLite   | 🟡 Parcial      | Tests marcados .skip precisam rewrite para async patterns |
| Coverage mínimo 70%     | 🟡 Parcial      | Medir e aumentar cobertura - unit tests existentes        |
| README.md atualizado    | ✅ Completo     | Documentação atualizada com SQLite architecture            |
| Beta testing real users | 🔴 Pendente     | TestFlight (iOS) + Play Console Beta (Android)             |
| Remover debug logs      | 🟡 Pendente     | Limpar console.logs adicionados durante debugging          |

### Nice to Have (Pode ir depois do MVP)

| Item                               | Status      | Descrição                                 |
| ---------------------------------- | ----------- | ----------------------------------------- |
| Lógica próximo disparo             | 🔴 Pendente | Calcular e exibir próximo alarme         |
| Indicador visual próximo alarme    | 🔴 Pendente | Badge/highlight na lista                  |
| Filtros na lista (Ativos/Inativos) | 🔴 Pendente | Melhorar organização                      |
| Swipe to delete                    | 🔴 Pendente | UX alternativa para exclusão              |
| Animação de criação (confetti)     | 🔴 Pendente | Celebração visual                         |
| Skeleton screens                   | 🔴 Pendente | Loading states melhorados                 |
| Exportar dados performance         | 🔴 Pendente | CSV/JSON export de métricas               |
| Performance insights/AI            | 🔴 Pendente | Recomendações baseadas em dados históricos |

---

## 📈 Métricas do Projeto

| Métrica                 | Valor  |
| ----------------------- | ------ |
| Arquivos TypeScript/TSX | ~65+   |
| Linhas de código        | ~9000+ |
| Arquivos de teste       | 5      |
| Linhas de teste         | ~1200+ |
| Componentes UI          | ~30+   |
| Hooks customizados      | 10+    |
| Stores Zustand          | 1      |
| Tabelas SQLite          | 2      |
| Idiomas suportados      | 3      |
| Alarm tones disponíveis | 15     |

---

## 🚀 Features Futuras (Pós-MVP)

### Fase 1 - Polimento

- [ ] Barcode Scan protocol (requer câmera)
- [ ] Exportar dados completo (CSV/JSON com todos os dados)
- [ ] Import/restore de backup
- [ ] Widget iOS/Android (próximo alarme)
- [ ] Siri/Google Assistant shortcuts

### Fase 2 - Avançado

- [ ] Difficulty Adaptive (ML/histórico)
- [ ] Insights e recomendações baseadas em IA
- [ ] Spotify/Apple Music integration
- [ ] Sunrise simulation (gradual brightness)
- [ ] Sleep tracking integration (HealthKit/Google Fit)

### Fase 3 - Social & Gamification

- [ ] Badges e achievements
- [ ] Streaks (dias consecutivos)
- [ ] Alarmes compartilhados
- [ ] Leaderboards

### Fase 4 - Plataforma

- [ ] Wearables (Apple Watch, WearOS)
- [ ] Cloud backup (opcional)
- [ ] Migração entre dispositivos

---

## ✅ Checklist Final para Lançamento nas Stores

### 📱 PRÉ-REQUISITOS TÉCNICOS

```
MVP FUNCIONAL:
├── [✅] Sistema de alarmes completo (CRUD + agendamento + SQLite)
├── [✅] 3 desafios cognitivos (Math, Memory, Logic)
├── [✅] Backup protocols (Snooze, Wake Check)
├── [✅] Onboarding flow
├── [✅] Settings completo (Theme, Language, Sound, Behavior)
├── [✅] Analytics tracking (Mixpanel + Sentry)
├── [✅] Internacionalização (EN, PT-BR, ES)
├── [✅] Dark mode completo
├── [✅] iOS stability (crashes resolvidos)
├── [✅] Suite de testes unitários
├── [✅] Performance tracking (SQLite + charts)
├── [✅] Custom alarm tones (15 sons + iOS plugin)
└── [✅] Auto-refresh data on screen focus

TOTAL: 13/13 ✅ COMPLETO
```

### 🚀 CHECKLIST DE PUBLICAÇÃO

#### 1️⃣ Apple App Store (iOS)

```
REQUISITOS APPLE:
├── [ ] ⏳ Apple Critical Alerts Entitlement solicitado
│       └── https://developer.apple.com/contact/request/notifications-critical-alerts-entitlement/
│       └── Justificativa: Alarme deve despertar usuário mesmo em DND
## 📊 RESUMO EXECUTIVO

**Status do MVP:** ✅ **85% COMPLETO**
- ✅ Core funcional 100% pronto (alarmes, desafios, settings, analytics, performance tracking)
- ✅ SQLite migration completa (alarms + performance data)
- ✅ Custom alarm tones com plugin iOS
- ⏳ Falta apenas: assets de publicação + aprovações das stores + cleanup (debug logs)
- 🚨 Bloqueador: Apple Critical Alerts Entitlement (1-2 semanas)

**Próximos Passos Imediatos:**
1. **Limpar debug logs** de development
2. **Reescrever testes** marcados com .skip para padrão async/SQLite
3. Solicitar Apple Critical Alerts Entitlement
4. Criar Privacy Policy hospedada (GitHub Pages)
5. Gerar builds de produção e testar em devices reais
6. Criar screenshots e assets gráficos
7. Preencher metadata das stores
8. Submeter para review (~2-7 dias)

**Previsão de Lançamento:** 🎯 **3-4 semanas**

---

**Última atualização:** 2026-01-19
**Versão do Roadmap:** 5.0 (SQLite Migration + Custom Sounds Complete)
**Branch atual:** main (SQLite migration merged)
├── [ ] Screenshots obrigatórios:
│       ├── 6.5" (iPhone 14 Pro Max) - mínimo 3 screens
│       ├── 5.5" (iPhone 8 Plus) - mínimo 3 screens
│       └── 12.9" (iPad Pro) - mínimo 3 screens
├── [ ] App icon 1024x1024 (sem transparência, sem cantos arredondados)
├── [ ] Metadata da App Store:
│       ├── App Name (30 chars)
│       ├── Subtitle (30 chars)
│       ├── Description (4000 chars)
│       ├── Keywords (100 chars)
│       ├── Category (Productivity + Utilities)
│       └── Age Rating (4+)
├── [ ] Privacy Policy URL ativa
└── [ ] TestFlight beta com 5-10 usuários (opcional mas recomendado)
```

#### 2️⃣ Google Play Store (Android)

```
REQUISITOS GOOGLE:
├── [ ] Build AAB de produção (EAS Build)
├── [ ] Testar em Android real (alarme, som, vibração, DND, battery optimization)
├── [ ] Screenshots obrigatórios:
│       ├── Phone (mínimo 2 screens)
│       ├── 7" Tablet (mínimo 2 screens)
│       └── 10" Tablet (mínimo 2 screens)
├── [ ] Feature Graphic (1024x500)
├── [ ] App icon 512x512 (PNG com transparência)
├── [ ] Metadata da Play Store:
│       ├── App Name (50 chars)
│       ├── Short Description (80 chars)
│       ├── Full Description (4000 chars)
│       ├── Category (Productivity)
│       └── Content Rating (Everyone)
├── [ ] Privacy Policy URL ativa
└── [ ] Closed Beta Testing (opcional mas recomendado)
```

#### 3️⃣ Infraestrutura & Compliance

```
OBRIGATÓRIO:
├── [ ] Privacy Policy hospedada (GitHub Pages ou domínio próprio)
├── [ ] Terms of Service (opcional para MVP)
├── [ ] Support email ativo (support@wakemind.app ou similar)
├── [ ] Analytics privacy disclosure no Privacy Policy
└── [ ] App Store / Play Console accounts criados e configurados
```

### ⏱️ TIMELINE ESTIMADA

| Etapa                              | Tempo          | Status      |
| ---------------------------------- | -------------- | ----------- |
| Solicitar Apple Critical Alerts    | 1-2 semanas ⏳ | 🔴 Pendente |
| Builds de produção (iOS + Android) | 2-3 dias       | 🔴 Pendente |
| Screenshots e assets gráficos      | 2-3 dias       | 🔴 Pendente |
| Privacy Policy + Support setup     | 1 dia          | 🔴 Pendente |
| Metadata e descrições (2 stores)   | 1 dia          | 🔴 Pendente |
| Beta testing (opcional)            | 1 semana       | 🔴 Pendente |
| Submissão final + Review           | 2-7 dias       | 🔴 Pendente |

**📊 TOTAL: ~3-4 semanas até lançamento público** (aguardando principalmente Apple Critical Alerts)

---

## 📊 Legenda

- ✅ Concluído
- 🟡 Em Progresso / Parcial
- 🔴 Não Iniciado / Pendente

---

**Última atualização:** 2026-01-10
**Versão do Roadmap:** 3.0 (MVP Ready)
**Branch atual:** feat/onboarding

https://docs.expo.dev/versions/latest/sdk/storereview/
