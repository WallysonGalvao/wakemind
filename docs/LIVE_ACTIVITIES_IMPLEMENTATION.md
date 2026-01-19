# Implementação de Live Activities para Alarmes

## O que são Live Activities?

Live Activities (iOS 16.1+) permitem:

- ✅ Informações persistentes na tela de bloqueio
- ✅ Integração com Dynamic Island (iPhone 14 Pro+)
- ✅ Atualizações em tempo real
- ✅ Mais visível que notificações comuns
- ❌ Não liga a tela automaticamente (ainda assim)

## Benefícios para WakeMind

1. **Visibilidade Constante**
   - Usuário vê o alarme sempre que olha o telefone
   - Countdown até o alarme
   - Status do alarme (ativo, snooze, etc.)

2. **Dynamic Island** (iPhone 14 Pro+)
   - Animação proeminente quando alarme dispara
   - Acesso rápido para desligar/snooze
   - Indicador visual constante

3. **Tela de Bloqueio**
   - Widget grande e colorido
   - Impossível ignorar
   - Botões de ação rápida

## Arquitetura

```
┌─────────────────────────────────────┐
│  WakeMind App (React Native)        │
│  ├─ Configura alarme                │
│  └─ Inicia Live Activity             │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│  Live Activity Widget (Swift)       │
│  ├─ ActivityAttributes               │
│  ├─ ActivityConfiguration            │
│  └─ Widget Timeline                  │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│  iOS Sistema                         │
│  ├─ Tela de Bloqueio                │
│  ├─ Dynamic Island                   │
│  └─ Notificações                     │
└─────────────────────────────────────┘
```

## Implementação Passo a Passo

### 1. Criar Widget Extension (Swift)

```bash
# No Xcode:
File > New > Target > Widget Extension
Nome: WakeMindWidget
Include Live Activity: ✅
```

### 2. Definir ActivityAttributes

```swift
// WakeMindWidgetAttributes.swift
import ActivityKit
import Foundation

struct WakeMindActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var alarmTime: Date
        var status: AlarmStatus
        var challengeType: String
        var timeRemaining: TimeInterval
    }

    var alarmId: String
    var alarmLabel: String
}

enum AlarmStatus: String, Codable {
    case scheduled
    case ringing
    case snoozed
    case dismissed
}
```

### 3. Criar Widget UI

```swift
// WakeMindLiveActivity.swift
import ActivityKit
import WidgetKit
import SwiftUI

struct WakeMindLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: WakeMindActivityAttributes.self) { context in
            // Tela de bloqueio
            LockScreenLiveActivityView(context: context)
        } dynamicIsland: { context in
            DynamicIsland {
                // Dynamic Island expanded
                DynamicIslandExpandedRegion(.leading) {
                    AlarmIcon(type: context.state.challengeType)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    TimeRemaining(seconds: context.state.timeRemaining)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    AlarmControls()
                }
            } compactLeading: {
                // Dynamic Island compact (leading)
                Image(systemName: "alarm.fill")
            } compactTrailing: {
                // Dynamic Island compact (trailing)
                Text(context.state.timeRemaining.formatted())
            } minimal: {
                // Dynamic Island minimal
                Image(systemName: "alarm.fill")
            }
        }
    }
}

struct LockScreenLiveActivityView: View {
    let context: ActivityViewContext<WakeMindActivityAttributes>

    var body: some View {
        VStack(spacing: 12) {
            HStack {
                Image(systemName: alarmIcon)
                    .foregroundColor(.blue)
                Text(context.attributes.alarmLabel)
                    .font(.headline)
                Spacer()
                Text(formattedTime)
                    .font(.title2)
                    .bold()
            }

            ProgressView(value: progress)
                .tint(.blue)

            HStack {
                Button(intent: SnoozeIntent(alarmId: context.attributes.alarmId)) {
                    Label("Snooze", systemImage: "clock.fill")
                }
                .buttonStyle(.bordered)

                Button(intent: DismissIntent(alarmId: context.attributes.alarmId)) {
                    Label("Dismiss", systemImage: "checkmark")
                }
                .buttonStyle(.borderedProminent)
            }
        }
        .padding()
    }
}
```

### 4. Integrar com React Native

Use o pacote `react-native-live-activities`:

```bash
npm install react-native-live-activities
```

```typescript
// src/services/live-activity-service.ts
import LiveActivities from 'react-native-live-activities';
import type { Alarm } from '@/types/alarm';

export class LiveActivityService {
  static async startAlarmActivity(alarm: Alarm): Promise<string> {
    try {
      const activityId = await LiveActivities.startActivity({
        activityType: 'WakeMindActivity',
        attributes: {
          alarmId: alarm.id,
          alarmLabel: alarm.label || 'Alarm',
        },
        contentState: {
          alarmTime: new Date(alarm.nextTriggerTime).toISOString(),
          status: 'scheduled',
          challengeType: alarm.challengeType,
          timeRemaining: calculateTimeRemaining(alarm),
        },
      });

      return activityId;
    } catch (error) {
      console.error('Failed to start Live Activity:', error);
      throw error;
    }
  }

  static async updateActivity(activityId: string, state: Partial<ContentState>) {
    await LiveActivities.updateActivity(activityId, state);
  }

  static async endActivity(activityId: string) {
    await LiveActivities.endActivity(activityId);
  }
}
```

### 5. Usar no Alarm Scheduler

```typescript
// Ao agendar alarme
const activityId = await LiveActivityService.startAlarmActivity(alarm);
// Salvar activityId com o alarme

// Ao disparar alarme
await LiveActivityService.updateActivity(activityId, {
  status: 'ringing',
  timeRemaining: 0,
});

// Ao desligar
await LiveActivityService.endActivity(activityId);
```

## Design Sugerido

### Tela de Bloqueio

```
┌──────────────────────────────────────┐
│ 🔔 WakeMind Alarm                    │
│                                      │
│ ⏰ Wake Up Challenge                 │
│ 05:00 AM                        -2m  │
│                                      │
│ ████████████░░░░░░  80%              │
│                                      │
│ [💤 Snooze]    [✓ I'm Awake]        │
└──────────────────────────────────────┘
```

### Dynamic Island (Compacto)

```
[🔔]  -02:30  [⏰]
```

### Dynamic Island (Expandido)

```
┌─────────────────────────────────────┐
│  🔔                            -2m   │
│                                     │
│     Wake Up Challenge               │
│     Math Problem Ready              │
│                                     │
│  [💤 Snooze]    [✓ Ready]          │
└─────────────────────────────────────┘
```

## Vantagens Imediatas

1. ✅ Não requer aprovação da Apple
2. ✅ Implementação em ~2 dias
3. ✅ Significativamente mais visível que notificações
4. ✅ Funciona com iPhone 14 Pro+ (Dynamic Island)
5. ✅ Aumenta engajamento

## Limitações

1. ❌ Ainda não liga a tela automaticamente
2. ❌ Requer iOS 16.1+
3. ❌ Limite de 8 horas de duração
4. ⚠️ Requer código Swift nativo

## Próximos Passos

1. Instalar `react-native-live-activities`
2. Criar Widget Extension no Xcode
3. Implementar ActivityAttributes
4. Criar UI do widget
5. Integrar com alarm scheduler
6. Testar em dispositivo físico (não funciona em simulador)
