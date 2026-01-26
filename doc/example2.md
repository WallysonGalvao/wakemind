Perfeito. Vou te passar o **roteiro real de produção**, igual apps tipo Alarmy usam, mas adaptado para **Expo + Notifee + Expo Native Modules**.

A ideia é:

> Usar Notifee só como _gatilho_, e o **Android nativo** como quem realmente acorda o app e abre a tela.

---

# 🧭 Roteiro completo (nível profissional)

## Fase 0 — Arquitetura

Stack final:

- Expo (Dev Client ou Bare)
- Notifee (alarme + FullScreenIntent)
- Módulo Nativo (Kotlin)
- AlarmActivity (tela de alarme em nível de sistema)
- Permissões:
  - Exact Alarm
  - Auto Start (OEM)
  - Overlay (SYSTEM_ALERT_WINDOW)
  - Battery Optimization Ignore
  - Full Screen Intent

---

## Fase 1 — Ejetar para poder usar código nativo

```bash
npx expo prebuild
npx expo run:android
```

Isso cria:

```
android/
  app/
    src/main/java/...
    AndroidManifest.xml
```

---

## Fase 2 — Criar AlarmActivity nativa

### 2.1 Criar arquivo

```
android/app/src/main/java/com/wgsoftwares/wakemind/AlarmActivity.kt
```

```kotlin
class AlarmActivity : ReactActivity() {

  override fun onCreate(savedInstanceState: Bundle?) {
    setShowWhenLocked(true)
    setTurnScreenOn(true)
    super.onCreate(savedInstanceState)
  }

  override fun getMainComponentName() = "wakemind_alarm"
}
```

### 2.2 Registrar no AndroidManifest

```xml
<activity
  android:name=".AlarmActivity"
  android:showWhenLocked="true"
  android:turnScreenOn="true"
  android:launchMode="singleTask"
  android:excludeFromRecents="true"
  android:screenOrientation="portrait"
  android:exported="true"
  android:taskAffinity="">
</activity>
```

---

## Fase 3 — Criar módulo Expo Nativo (Overlay + AutoStart)

```bash
npx expo modules init expo-alarm-permissions
```

Estrutura:

```
expo-alarm-permissions/android/src/main/java/...
```

---

## Fase 4 — Implementar Overlay Permission

```kotlin
class OverlayPermissionModule : Module() {

  override fun definition() = ModuleDefinition {
    Name("OverlayPermission")

    AsyncFunction("canDrawOverlays") {
      Settings.canDrawOverlays(appContext.reactContext)
    }

    Function("openSettings") {
      val intent = Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION)
      intent.data = Uri.parse("package:" + appContext.reactContext.packageName)
      appContext.reactContext.startActivity(intent)
    }
  }
}
```

---

## Fase 5 — Implementar AutoStart (OEM Hack)

```kotlin
Function("openAutoStartSettings") {
  val intents = listOf(
    Intent("miui.intent.action.OP_AUTO_START"),
    Intent("com.samsung.android.sm.ACTION_BATTERY"),
    Intent("com.coloros.safecenter")
  )

  for (intent in intents) {
    if (intent.resolveActivity(packageManager) != null) {
      context.startActivity(intent)
      break
    }
  }
}
```

---

## Fase 6 — Integrar no JS (seu código já está quase pronto)

```ts
const { OverlayPermission, AutoStartPermission } = NativeModules;

await OverlayPermission.canDrawOverlays();
await OverlayPermission.openSettings();
await AutoStartPermission.openAutoStartSettings();
```

---

## Fase 7 — Notifee como FullScreen launcher

Você já está usando corretamente:

```ts
fullScreenAction: {
  id: 'alarm-triggered',
  launchActivity: 'com.wgsoftwares.wakemind.AlarmActivity',
}
```

Isso ativa:

- FullScreenIntent
- WakeLock
- Lançamento automático
- Sobre lockscreen
- Mesmo com app morto

---

## Fase 8 — Foreground Service (opcional mas ideal)

Criar `AlarmService.kt`:

- Mantém processo vivo
- Garante execução mesmo com RAM killer

---

## Fase 9 — Fluxo de permissões no app (igual Alarmy)

Ordem ideal:

1. Notification (POST_NOTIFICATIONS)
2. Exact Alarm (Android 12+)
3. Ignore Battery Optimization
4. Auto Start (OEM)
5. Display Over Other Apps (Overlay)
6. Full Screen Intent

Tela igual você mostrou:

✔ Botão: "Aceder às definições"
✔ Deep link direto para cada permissão
✔ Verificação de status em tempo real

---

## Fase 10 — Resultado final

Com isso você terá:

- Alarme abre Activity mesmo com tela bloqueada
- Inicia mesmo com app morto
- Funciona com Doze Mode
- Sobrepõe qualquer app
- Comportamento idêntico ao Alarmy
- Compatível Android 11 → 14

---

Se você quiser, no próximo passo eu te entrego:

🔹 Código completo do módulo Expo (pronto pra colar)
🔹 AndroidManifest final
🔹 AlarmActivity com ReactRootView
🔹 Serviço de alarme em foreground
🔹 Fluxo de permissões UI pronto

É literalmente montar um **Alarmy em Expo** 😄
