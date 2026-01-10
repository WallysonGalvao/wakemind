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
- [x] Persistência com Zustand + MMKV

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

---

## 🎯 O QUE FALTA PARA MVP COMPLETO

### Crítico (Bloqueante para lançamento)

| Item | Status | Descrição |
|------|--------|-----------|
| Apple Critical Alerts Entitlement | 🔴 Pendente | Solicitar aprovação especial da Apple |
| Build de Produção iOS | 🔴 Pendente | Testar em dispositivo real |
| Build de Produção Android | 🔴 Pendente | Testar em dispositivo real |

### Importante (Alta prioridade)

| Item | Status | Descrição |
|------|--------|-----------|
| Testes E2E | 🔴 Não iniciado | Maestro ou Detox |
| Coverage mínimo 70% | 🟡 Parcial | Medir e aumentar cobertura |
| README.md atualizado | 🔴 Pendente | Documentação para usuários/devs |

### Nice to Have (Pode ir depois do MVP)

| Item | Status | Descrição |
|------|--------|-----------|
| Lógica próximo disparo | 🔴 Pendente | Calcular e exibir próximo alarme |
| Indicador visual próximo alarme | 🔴 Pendente | Badge/highlight na lista |
| Filtros na lista (Ativos/Inativos) | 🔴 Pendente | Melhorar organização |
| Swipe to delete | 🔴 Pendente | UX alternativa para exclusão |
| Animação de criação (confetti) | 🔴 Pendente | Celebração visual |
| Skeleton screens | 🔴 Pendente | Loading states melhorados |

---

## 📈 Métricas do Projeto

| Métrica | Valor |
|---------|-------|
| Arquivos TypeScript/TSX | ~60+ |
| Linhas de código | ~8000+ |
| Arquivos de teste | 5 |
| Linhas de teste | ~1200+ |
| Componentes UI | ~25+ |
| Hooks customizados | 7+ |
| Stores Zustand | 2 |
| Idiomas suportados | 3 |

---

## 🚀 Features Futuras (Pós-MVP)

### Fase 1 - Polimento
- [ ] Barcode Scan protocol (requer câmera)
- [ ] Estatísticas de uso e gráficos
- [ ] Insights e recomendações
- [ ] Exportar dados (CSV/JSON)

### Fase 2 - Avançado
- [ ] Difficulty Adaptive (ML/histórico)
- [ ] Widget iOS/Android
- [ ] Siri/Google Assistant shortcuts
- [ ] Spotify/Apple Music integration
- [ ] Sunrise simulation

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

## ✅ Checklist Final para MVP

```
ANTES DO LANÇAMENTO:
├── [ ] Solicitar Apple Critical Alerts Entitlement
│       └── https://developer.apple.com/contact/request/notifications-critical-alerts-entitlement/
├── [ ] Build de produção iOS testado
├── [ ] Build de produção Android testado
├── [ ] Privacy Policy URL hospedada
├── [ ] Support email configurado (support@wakemind.app)
├── [ ] Screenshots para App Store
├── [ ] Screenshots para Play Store
├── [ ] App Store metadata (descrição, keywords)
├── [ ] Play Store metadata (descrição, tags)
└── [ ] Beta testing com usuários reais
```

---

## 📊 Legenda

- ✅ Concluído
- 🟡 Em Progresso / Parcial
- 🔴 Não Iniciado / Pendente

---

**Última atualização:** 2026-01-10
**Versão do Roadmap:** 3.0 (MVP Ready)
**Branch atual:** feat/onboarding
