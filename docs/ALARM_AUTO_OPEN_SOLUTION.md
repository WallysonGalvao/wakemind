# Solução: Abertura Automática de Alarmes no Android

## 📋 Visão Geral

Implementação de abertura automática do app quando alarmes disparam no Android, utilizando uma abordagem híbrida que combina **Notifee** para agendamento de alarmes e **módulo nativo** para abertura automática da Activity.

## 🎯 Objetivo

Garantir que o app **WakeMind** abra automaticamente quando um alarme é disparado, independentemente do estado do app (fechado, background, tela bloqueada ou desbloqueada).

## 🏗️ Arquitetura - Option 2 (Híbrida)

### Componentes

1. **Notifee** - Agendamento de alarmes
2. **NotificationHandler** - Interceptação de eventos
3. **ExpoAlarmActivity** - Módulo nativo para abertura automática
4. **SYSTEM_ALERT_WINDOW** - Permissão Android para abrir app sobre outras apps

### Fluxo de Execução

```
Usuário cria alarme
  ↓
AlarmScheduler.scheduleAlarm() → Notifee.createTriggerNotification()
  ↓
[Alarme agendado aguarda o horário]
  ↓
Notifee dispara alarme no horário programado
  ↓
EventType.DELIVERED é emitido pelo Notifee
  ↓
NotificationHandler intercepta o evento
  ↓
Platform.OS === 'android' → ExpoAlarmActivity.openAlarmScreen()
  ↓
Módulo nativo cria Intent com ComponentName
  ↓
startActivity() com FLAG_ACTIVITY_NEW_TASK
  ↓
MainActivity é aberta com deep link wakemind://alarm/trigger
  ↓
Expo Router navega para /alarm/trigger
  ↓
Usuário vê a tela do desafio do alarme
```

## 🔧 Implementação

### 1. Módulo Nativo: ExpoAlarmActivity

**Localização:** `/modules/expo-alarm-activity/android/src/main/java/expo/modules/alarmactivity/ExpoAlarmActivityModule.kt`

**Função Principal:**

```kotlin
Function("openAlarmScreen") { alarmId: String, time: String, period: String, challenge: String, challengeIcon: String, type: String ->
  val deepLinkUrl = "wakemind://alarm/trigger?alarmId=${alarmId}&time=${time}&period=${period}&challenge=${Uri.encode(challenge)}&challengeIcon=${challengeIcon}&type=${type}"

  val activityIntent = Intent().apply {
    component = ComponentName("com.wgsoftwares.wakemind", "com.wgsoftwares.wakemind.MainActivity")
    action = Intent.ACTION_VIEW
    data = Uri.parse(deepLinkUrl)
    flags = Intent.FLAG_ACTIVITY_NEW_TASK or FLAG_ACTIVITY_CLEAR_TOP or FLAG_ACTIVITY_SINGLE_TOP
  }

  context.startActivity(activityIntent)
  return@Function "MainActivity opened"
}
```

**Outras Funções:**

- `canUseFullScreenIntent()` - Verifica permissão em Android 14+
- `requestFullScreenIntentPermission()` - Abre configurações do sistema

### 2. Handler de Notificações

**Localização:** `/src/services/notification-handler.ts`

**Evento DELIVERED (Foreground & Background):**

```typescript
case EventType.DELIVERED:
  if (Platform.OS === 'android') {
    try {
      ExpoAlarmActivity.openAlarmScreen(
        data.alarmId,
        data.time,
        data.period,
        data.challenge || 'Wake up!',
        data.challengeIcon || 'calculate',
        data.type || 'alarm'
      );
    } catch (error) {
      console.error('[NotificationHandler] Failed to open alarm screen:', error);
      navigateToAlarmScreen(data); // Fallback
    }
  } else {
    navigateToAlarmScreen(data); // iOS
  }
```

### 3. Agendamento de Alarmes

**Localização:** `/src/services/alarm-scheduler.ts`

Utiliza **apenas Notifee** para agendamento:

```typescript
await notifee.createTriggerNotification(notification, trigger);
```

**Notifee configurado com:**

- `fullScreenAction` apontando para MainActivity (backup)
- `category: AndroidCategory.ALARM`
- `importance: AndroidImportance.HIGH`
- `loopSound: true` para repetir som até interação

## 🔐 Permissões Necessárias

### AndroidManifest.xml

```xml
<!-- Permissão para abrir app sobre outras apps -->
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />

<!-- Permissão para Full Screen Intent (Android 14+) -->
<uses-permission android:name="android.permission.USE_FULL_SCREEN_INTENT" />

<!-- Permissão para desabilitar otimizações de bateria -->
<uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />
```

### MainActivity Flags

Via plugin `/plugins/withFullScreenIntent.js`:

```xml
<activity
  android:showWhenLocked="true"
  android:turnScreenOn="true"
  android:showOnLockScreen="true"
/>
```

### Concessão via ADB (Desenvolvimento)

```bash
# SYSTEM_ALERT_WINDOW
adb shell appops set com.wgsoftwares.wakemind SYSTEM_ALERT_WINDOW allow

# Battery Optimization
adb shell dumpsys deviceidle whitelist +com.wgsoftwares.wakemind
```

## ✅ Casos de Teste Validados

| Cenário                   | Status | Observações                          |
| ------------------------- | ------ | ------------------------------------ |
| App em foreground         | ✅     | Abre tela do alarme instantaneamente |
| App em background         | ✅     | Traz app para foreground             |
| App completamente fechado | ✅     | Lança app e navega para alarme       |
| Tela bloqueada            | ✅     | Acende tela e abre app               |
| Tela desbloqueada         | ✅     | Abre normalmente                     |

## 🎯 Vantagens da Solution Option 2

### ✅ Prós

- **Notifee gerencia complexidade**: Repetições, snooze, persistência
- **Módulo nativo mínimo**: Apenas abertura de Activity
- **Compatível com iOS**: iOS usa Notifee puro
- **Flexível**: Fácil adicionar novos tipos de alarme

### ⚠️ Considerações

- Requer permissão `SYSTEM_ALERT_WINDOW` (concedida automaticamente em desenvolvimento)
- Em produção, usuário deve conceder manualmente se Android denegar automaticamente

## 🚀 Alternativa: Option 1 (Full Native)

Se a abordagem híbrida apresentar problemas em produção, existe fallback documentado que usa **AlarmManager** nativo para agendamento:

- AlarmManager.setExactAndAllowWhileIdle() para agendamento
- BroadcastReceiver intercepta alarmes
- Dual-strategy: Full Screen Intent (tela bloqueada) + SYSTEM_ALERT_WINDOW (desbloqueada)

**Status:** Implementado e testado com sucesso, mas descartado em favor da Option 2 para simplificar.

## 📝 Arquivos Modificados

### Criados

- `/modules/expo-alarm-activity/` - Módulo Expo nativo
- `/modules/expo-alarm-activity/android/src/main/java/expo/modules/alarmactivity/ExpoAlarmActivityModule.kt`
- `/modules/expo-alarm-activity/expo-module.config.json`
- `/modules/expo-alarm-activity/index.ts`
- `/modules/expo-alarm-activity/src/ExpoAlarmActivityModule.ts`
- `/plugins/withFullScreenIntent.js`

### Modificados

- `/src/services/notification-handler.ts` - Interceptação de DELIVERED
- `/src/services/alarm-scheduler.ts` - Configuração Notifee
- `/app.config.ts` - Registro do plugin

### Removidos

- AlarmReceiver.kt (Option 1)
- ForegroundAlarmHandler.kt (tentativa falhada)
- NotifeeAlarmReceiver.kt (não utilizado)

## 🔍 Debugging

Para verificar se está funcionando:

```bash
# Ver logs do módulo nativo
adb logcat -d | grep ExpoAlarmActivity

# Ver logs do Notifee
adb logcat -d | grep Notifee

# Ver logs gerais do alarme
adb logcat -d | grep -E "(AlarmManager|ExpoAlarmActivity)"
```

**Logs esperados ao alarme disparar:**

```
D ExpoAlarmActivity: Opening alarm screen: wakemind://alarm/trigger?...
D ExpoAlarmActivity: ✅ MainActivity launched successfully!
```

## 📚 Referências

- [Notifee Triggers Documentation](https://notifee.app/react-native/docs/triggers)
- [Android Full Screen Intent](https://developer.android.com/training/notify-user/time-sensitive)
- [Expo Modules API](https://docs.expo.dev/modules/module-api/)
- [SYSTEM_ALERT_WINDOW Permission](https://developer.android.com/reference/android/Manifest.permission#SYSTEM_ALERT_WINDOW)

## 👨‍💻 Autor

Implementado por **Wallyson Galvão** com assistência de **GitHub Copilot**  
Data: Janeiro 2026

## 📄 Licença

Este documento e código são parte do projeto **WakeMind**.
