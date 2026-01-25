adb logcat | grep -i "AlarmScheduler\|AlarmActivity"
adb logcat -d | grep -E "(ExpoAlarmActivity|AlarmManager|AlarmActivity)" | tail -30

Para conceder e verificar a permissão `USE_FULL_SCREEN_INTENT` via adb:

**1. Conceder a permissão:**

```bash
adb shell appops set com.wgsoftwares.wakemind USE_FULL_SCREEN_INTENT allow
adb shell appops set com.wgsoftwares.wakemind SYSTEM_ALERT_WINDOW allow
adb shell dumpsys deviceidle whitelist +com.wgsoftwares.wakemind

```

**2. Verificar se foi concedida:**

```bash
adb shell appops get com.wgsoftwares.wakemind USE_FULL_SCREEN_INTENT
adb shell appops get com.wgsoftwares.wakemind SYSTEM_ALERT_WINDOW
adb shell dumpsys deviceidle whitelist | grep wakemind
```

Deve retornar: `USE_FULL_SCREEN_INTENT: allow`

**3. Verificação alternativa (mais detalhada):**

```bash
adb shell dumpsys notification | grep -A 5 "com.wgsoftwares.wakemind"
```

**4. Resetar a permissão (se necessário):**

```bash
adb shell appops set com.wgsoftwares.wakemind USE_FULL_SCREEN_INTENT default
```

**Comandos úteis extras:**

Ver todas as permissões do app:

```bash
adb shell dumpsys package com.wgsoftwares.wakemind | grep -i permission
```

Ver status do NotificationManager:

```bash
adb shell dumpsys notification | grep -i "full screen"
```
