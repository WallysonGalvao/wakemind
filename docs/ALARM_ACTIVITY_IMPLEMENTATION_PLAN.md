# Plano de Implementação: AlarmActivity Nativa (Expo Module)

## 📋 Resumo Executivo

Este documento apresenta um plano detalhado para implementar uma **AlarmActivity nativa** que abrirá automaticamente quando o alarme disparar, usando a estrutura de **Expo Local Modules** já existente no projeto.

---

## 🎯 Objetivo

Criar uma Activity Android nativa que:

1. ✅ Abre automaticamente quando o alarme dispara (mesmo com tela bloqueada)
2. ✅ Acorda a tela e exibe sobre o lockscreen
3. ✅ Integra com o sistema de navegação React Native
4. ✅ É simples de testar e debugar
5. ✅ Segue a arquitetura Expo já estabelecida no projeto

---

## 🏗️ Arquitetura Atual do Projeto

### Estrutura de Módulos Expo

```
wakemind/
├── modules/
│   └── expo-alarms/                    # ✅ Módulo nativo existente
│       ├── android/
│       │   ├── build.gradle            # Configuração Gradle
│       │   └── src/main/
│       │       ├── AndroidManifest.xml # Manifest do módulo
│       │       └── java/expo/modules/alarms/
│       │           └── ExpoAlarmsModule.kt  # Módulo Kotlin
│       ├── ios/
│       ├── index.ts                    # Export JavaScript
│       ├── expo-module.config.json     # Config do módulo
│       └── src/
│           ├── ExpoAlarmsModule.ts     # Interface TypeScript
│           └── ExpoAlarms.types.ts     # Tipos
│
├── plugins/
│   ├── withFullScreenIntent.js         # ⚠️ Plugin atual (não funciona)
│   └── withNotifee.js                  # Plugin Notifee
│
├── src/services/
│   ├── alarm-scheduler.ts              # Agendamento via Notifee
│   └── notification-handler.ts         # Eventos de notificação
│
└── app.config.ts                       # Configuração Expo
```

### Problema da Solução Atual

O plugin `withFullScreenIntent.js`:

- ❌ Cria `AlarmActivity.kt` mas Notifee **não a invoca**
- ❌ `fullScreenAction.launchActivity` não funciona corretamente
- ❌ Android não reconhece a Activity como Full Screen Intent válida
- ❌ Solução não é testável isoladamente

**Por quê?**

- Notifee não implementa Full Screen Intent corretamente no Expo
- A Activity criada via plugin não tem controle total sobre o fluxo
- Falta integração real entre Notifee e a Activity nativa

---

## 🚀 Nova Abordagem: Módulo Nativo Dedicado

### Conceito

Ao invés de depender do Notifee para lançar a Activity, vamos:

1. **Criar um módulo nativo completo** (`expo-alarm-activity`)
2. **Usar AlarmManager diretamente** (mais confiável que Notifee)
3. **Ter controle total** sobre como/quando a Activity abre
4. **Manter compatibilidade** com o código React existente

### Vantagens

| Aspecto                 | Solução Atual (Plugin)   | Nova Solução (Módulo)       |
| ----------------------- | ------------------------ | --------------------------- |
| Controle sobre Activity | ❌ Limitado pelo Notifee | ✅ Total (código Kotlin)    |
| Confiabilidade          | ⚠️ Depende de Notifee    | ✅ AlarmManager nativo      |
| Testabilidade           | ❌ Difícil de testar     | ✅ Pode testar isoladamente |
| Debugging               | ❌ Logs misturados       | ✅ Logs claros por módulo   |
| Manutenibilidade        | ⚠️ Código espalhado      | ✅ Módulo encapsulado       |
| Compatibilidade Expo    | ✅ Sim                   | ✅ Sim (Local Module)       |
| Requer bare workflow    | ❌ Não                   | ❌ Não                      |

---

## 📐 Estrutura do Novo Módulo

### Organização de Arquivos

```
modules/
├── expo-alarms/                    # Módulo existente (renomear ou expandir)
└── expo-alarm-activity/            # NOVO módulo dedicado
    ├── android/
    │   ├── build.gradle
    │   └── src/main/
    │       ├── AndroidManifest.xml
    │       └── java/expo/modules/alarmactivity/
    │           ├── ExpoAlarmActivityModule.kt    # API JS ↔ Kotlin
    │           ├── AlarmActivity.kt              # Activity nativa
    │           ├── AlarmReceiver.kt              # BroadcastReceiver
    │           └── AlarmScheduler.kt             # AlarmManager wrapper
    │
    ├── ios/
    │   └── (implementação futura para iOS)
    │
    ├── index.ts                    # Export JavaScript
    ├── expo-module.config.json     # Configuração do módulo
    └── src/
        ├── ExpoAlarmActivityModule.ts   # Interface TypeScript
        └── ExpoAlarmActivity.types.ts   # Tipos (AlarmData, etc)
```

### Responsabilidades de Cada Arquivo

#### 1. **ExpoAlarmActivityModule.kt** - Interface JS ↔ Native

```kotlin
package expo.modules.alarmactivity

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoAlarmActivityModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoAlarmActivity")

    // Agendar um alarme
    AsyncFunction("scheduleAlarm") { alarmData: Map<String, Any> ->
      AlarmScheduler.schedule(appContext, alarmData)
    }

    // Cancelar um alarme
    AsyncFunction("cancelAlarm") { alarmId: String ->
      AlarmScheduler.cancel(appContext, alarmId)
    }

    // Testar: Abrir AlarmActivity agora (para debug)
    Function("testOpenAlarmActivity") { alarmData: Map<String, Any> ->
      AlarmActivity.launch(appContext.reactContext, alarmData)
    }

    // Verificar permissões
    AsyncFunction("checkPermissions") {
      mapOf(
        "exactAlarms" to AlarmScheduler.hasExactAlarmPermission(appContext),
        "overlay" to AlarmActivity.hasOverlayPermission(appContext),
        "batteryOptimization" to AlarmScheduler.isBatteryOptimizationDisabled(appContext)
      )
    }

    // Abrir configurações
    Function("openSettings") { type: String ->
      when (type) {
        "exactAlarms" -> AlarmScheduler.openAlarmSettings(appContext)
        "overlay" -> AlarmActivity.openOverlaySettings(appContext)
        "battery" -> AlarmScheduler.openBatterySettings(appContext)
      }
    }
  }
}
```

**Funções Expostas para JavaScript:**

- `scheduleAlarm(alarmData)` - Agendar alarme usando AlarmManager
- `cancelAlarm(alarmId)` - Cancelar alarme agendado
- `testOpenAlarmActivity(alarmData)` - **TESTE**: Abrir Activity imediatamente
- `checkPermissions()` - Verificar status de permissões
- `openSettings(type)` - Abrir configurações do sistema

---

#### 2. **AlarmActivity.kt** - Activity que Abre Automaticamente

```kotlin
package expo.modules.alarmactivity

import android.app.KeyguardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.WindowManager
import androidx.appcompat.app.AppCompatActivity
import com.wgsoftwares.wakemind.MainActivity

/**
 * Activity nativa que abre automaticamente quando o alarme dispara
 * Esta é uma Activity TRANSPARENTE que apenas redireciona para o React Native
 */
class AlarmActivity : AppCompatActivity() {
    companion object {
        private const val TAG = "AlarmActivity"

        const val EXTRA_ALARM_ID = "alarmId"
        const val EXTRA_TIME = "time"
        const val EXTRA_PERIOD = "period"
        const val EXTRA_CHALLENGE = "challenge"
        const val EXTRA_CHALLENGE_ICON = "challengeIcon"
        const val EXTRA_TYPE = "type"

        /**
         * Lançar a AlarmActivity com dados do alarme
         * Esta função pode ser chamada do JavaScript (via módulo) ou do BroadcastReceiver
         */
        fun launch(context: Context, alarmData: Map<String, Any>) {
            Log.d(TAG, "====================================")
            Log.d(TAG, "Launching AlarmActivity with data: $alarmData")

            val intent = Intent(context, AlarmActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or
                        Intent.FLAG_ACTIVITY_CLEAR_TOP or
                        Intent.FLAG_ACTIVITY_NO_USER_ACTION

                // Passar dados do alarme
                putExtra(EXTRA_ALARM_ID, alarmData["alarmId"] as? String ?: "")
                putExtra(EXTRA_TIME, alarmData["time"] as? String ?: "00:00")
                putExtra(EXTRA_PERIOD, alarmData["period"] as? String ?: "AM")
                putExtra(EXTRA_CHALLENGE, alarmData["challenge"] as? String ?: "")
                putExtra(EXTRA_CHALLENGE_ICON, alarmData["challengeIcon"] as? String ?: "calculate")
                putExtra(EXTRA_TYPE, alarmData["type"] as? String ?: "alarm")
            }

            context.startActivity(intent)
            Log.d(TAG, "AlarmActivity intent sent")
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        Log.d(TAG, "====================================")
        Log.d(TAG, "AlarmActivity.onCreate()")
        Log.d(TAG, "====================================")

        // 1. ACORDAR A TELA E MOSTRAR SOBRE LOCKSCREEN
        setupWakeFlags()

        // 2. EXTRAIR DADOS DO ALARME
        val alarmData = extractAlarmData()
        Log.d(TAG, "Alarm Data: $alarmData")

        // 3. CONSTRUIR DEEP LINK PARA REACT NATIVE
        val deepLink = buildDeepLink(alarmData)
        Log.d(TAG, "Deep Link: $deepLink")

        // 4. LANÇAR MAINACTIVITY (REACT NATIVE)
        launchMainActivity(deepLink, alarmData)

        // 5. FINALIZAR ESTA ACTIVITY (ela é só um trampolim)
        Log.d(TAG, "Finishing AlarmActivity")
        finish()
    }

    /**
     * Configurar flags para acordar tela e mostrar sobre lockscreen
     */
    private fun setupWakeFlags() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)

            // Tentar dispensar o keyguard (pode não funcionar em todos os dispositivos)
            val keyguardManager = getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
            keyguardManager.requestDismissKeyguard(this, null)
        } else {
            @Suppress("DEPRECATION")
            window.addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
                WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
            )
        }

        // Manter tela ligada
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        Log.d(TAG, "Wake flags configured")
    }

    /**
     * Extrair dados do alarme dos extras do Intent
     */
    private fun extractAlarmData(): Map<String, String> {
        return mapOf(
            "alarmId" to (intent.getStringExtra(EXTRA_ALARM_ID) ?: ""),
            "time" to (intent.getStringExtra(EXTRA_TIME) ?: "00:00"),
            "period" to (intent.getStringExtra(EXTRA_PERIOD) ?: "AM"),
            "challenge" to (intent.getStringExtra(EXTRA_CHALLENGE) ?: ""),
            "challengeIcon" to (intent.getStringExtra(EXTRA_CHALLENGE_ICON) ?: "calculate"),
            "type" to (intent.getStringExtra(EXTRA_TYPE) ?: "alarm")
        )
    }

    /**
     * Construir deep link para a tela de alarme no React Native
     */
    private fun buildDeepLink(alarmData: Map<String, String>): String {
        val alarmId = alarmData["alarmId"]
        val time = alarmData["time"]
        val period = alarmData["period"]
        val challenge = Uri.encode(alarmData["challenge"])
        val challengeIcon = alarmData["challengeIcon"]
        val type = alarmData["type"]

        return "wakemind://alarm/trigger?alarmId=$alarmId&time=$time&period=$period&challenge=$challenge&challengeIcon=$challengeIcon&type=$type"
    }

    /**
     * Lançar MainActivity do React Native com deep link
     */
    private fun launchMainActivity(deepLink: String, alarmData: Map<String, String>) {
        val mainIntent = Intent(this, MainActivity::class.java).apply {
            action = Intent.ACTION_VIEW
            data = Uri.parse(deepLink)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP

            // Passar extras como fallback (caso deep link falhe)
            alarmData.forEach { (key, value) ->
                putExtra(key, value)
            }
        }

        Log.d(TAG, "Launching MainActivity with deep link")
        startActivity(mainIntent)
    }
}
```

**Fluxo da AlarmActivity:**

1. **onCreate()** é chamada quando o alarme dispara
2. **setupWakeFlags()** - Acorda tela e mostra sobre lockscreen
3. **extractAlarmData()** - Pega os dados do alarme do Intent
4. **buildDeepLink()** - Constrói URL de navegação React Native
5. **launchMainActivity()** - Abre o app React Native na tela correta
6. **finish()** - Fecha a AlarmActivity (é transparente, usuário não vê)

---

#### 3. **AlarmReceiver.kt** - BroadcastReceiver (Dispara a Activity)

```kotlin
package expo.modules.alarmactivity

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

/**
 * BroadcastReceiver que é invocado pelo AlarmManager
 * Responsabilidade: Lançar a AlarmActivity quando o alarme dispara
 */
class AlarmReceiver : BroadcastReceiver() {
    companion object {
        private const val TAG = "AlarmReceiver"
        const val ACTION_ALARM_TRIGGERED = "expo.modules.alarmactivity.ALARM_TRIGGERED"
    }

    override fun onReceive(context: Context, intent: Intent) {
        Log.d(TAG, "====================================")
        Log.d(TAG, "AlarmReceiver.onReceive()")
        Log.d(TAG, "Action: ${intent.action}")
        Log.d(TAG, "====================================")

        if (intent.action == ACTION_ALARM_TRIGGERED) {
            // Extrair dados do alarme dos extras
            val alarmData = mapOf(
                "alarmId" to (intent.getStringExtra("alarmId") ?: ""),
                "time" to (intent.getStringExtra("time") ?: "00:00"),
                "period" to (intent.getStringExtra("period") ?: "AM"),
                "challenge" to (intent.getStringExtra("challenge") ?: ""),
                "challengeIcon" to (intent.getStringExtra("challengeIcon") ?: "calculate"),
                "type" to (intent.getStringExtra("type") ?: "alarm")
            )

            Log.d(TAG, "Launching AlarmActivity with data: $alarmData")

            // Lançar AlarmActivity
            AlarmActivity.launch(context, alarmData)
        }
    }
}
```

**Papel do AlarmReceiver:**

- É registrado para receber broadcasts do AlarmManager
- Quando o alarme dispara, Android chama `onReceive()`
- Extrai os dados e lança a `AlarmActivity`

---

#### 4. **AlarmScheduler.kt** - Wrapper do AlarmManager

```kotlin
package expo.modules.alarmactivity

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import expo.modules.kotlin.AppContext

/**
 * Gerenciador de alarmes usando AlarmManager nativo do Android
 * Mais confiável que Notifee para alarmes críticos
 */
object AlarmScheduler {
    private const val TAG = "AlarmScheduler"

    /**
     * Agendar um alarme usando AlarmManager
     */
    fun schedule(appContext: AppContext, alarmData: Map<String, Any>) {
        val context = appContext.reactContext ?: return

        val alarmId = alarmData["alarmId"] as? String ?: return
        val triggerTime = alarmData["triggerTime"] as? Long ?: return

        Log.d(TAG, "Scheduling alarm: $alarmId at $triggerTime")

        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

        // Criar PendingIntent para o BroadcastReceiver
        val intent = Intent(context, AlarmReceiver::class.java).apply {
            action = AlarmReceiver.ACTION_ALARM_TRIGGERED

            // Passar todos os dados do alarme
            putExtra("alarmId", alarmData["alarmId"] as? String)
            putExtra("time", alarmData["time"] as? String)
            putExtra("period", alarmData["period"] as? String)
            putExtra("challenge", alarmData["challenge"] as? String)
            putExtra("challengeIcon", alarmData["challengeIcon"] as? String)
            putExtra("type", alarmData["type"] as? String)
        }

        val pendingIntent = PendingIntent.getBroadcast(
            context,
            alarmId.hashCode(), // Request code único por alarme
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Usar setAlarmClock para máxima prioridade
        val alarmClockInfo = AlarmManager.AlarmClockInfo(
            triggerTime,
            pendingIntent // Pending intent para quando o usuário tocar no ícone do alarme
        )

        alarmManager.setAlarmClock(alarmClockInfo, pendingIntent)

        Log.d(TAG, "Alarm scheduled successfully")
    }

    /**
     * Cancelar um alarme agendado
     */
    fun cancel(appContext: AppContext, alarmId: String) {
        val context = appContext.reactContext ?: return

        Log.d(TAG, "Canceling alarm: $alarmId")

        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

        val intent = Intent(context, AlarmReceiver::class.java).apply {
            action = AlarmReceiver.ACTION_ALARM_TRIGGERED
        }

        val pendingIntent = PendingIntent.getBroadcast(
            context,
            alarmId.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        alarmManager.cancel(pendingIntent)

        Log.d(TAG, "Alarm canceled")
    }

    /**
     * Verificar se app tem permissão de alarmes exatos (Android 12+)
     */
    fun hasExactAlarmPermission(appContext: AppContext): Boolean {
        val context = appContext.reactContext ?: return false

        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            alarmManager.canScheduleExactAlarms()
        } else {
            true // Versões antigas não precisam de permissão
        }
    }

    /**
     * Abrir configurações de alarmes exatos
     */
    fun openAlarmSettings(appContext: AppContext) {
        val context = appContext.reactContext ?: return

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val intent = Intent(android.provider.Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            context.startActivity(intent)
        }
    }

    // Funções similares para battery optimization...
    fun isBatteryOptimizationDisabled(appContext: AppContext): Boolean {
        // TODO: Implementar
        return true
    }

    fun openBatterySettings(appContext: AppContext) {
        // TODO: Implementar
    }
}
```

**Responsabilidades do AlarmScheduler:**

- Usar `AlarmManager.setAlarmClock()` - **Mais confiável que Notifee**
- Criar `PendingIntent` para o `AlarmReceiver`
- Verificar permissões de alarmes exatos (Android 12+)
- Abrir configurações do sistema

---

#### 5. **AndroidManifest.xml** - Registrar Componentes

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Permissões necessárias -->
    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
    <uses-permission android:name="android.permission.USE_EXACT_ALARM" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <uses-permission android:name="android.permission.USE_FULL_SCREEN_INTENT" />

    <application>
        <!-- AlarmActivity - Abre sobre lockscreen -->
        <activity
            android:name=".AlarmActivity"
            android:theme="@android:style/Theme.Translucent.NoTitleBar"
            android:excludeFromRecents="true"
            android:exported="false"
            android:showWhenLocked="true"
            android:turnScreenOn="true"
            android:launchMode="singleInstance"
            android:taskAffinity="" />

        <!-- AlarmReceiver - Recebe broadcasts do AlarmManager -->
        <receiver
            android:name=".AlarmReceiver"
            android:exported="false">
            <intent-filter>
                <action android:name="expo.modules.alarmactivity.ALARM_TRIGGERED" />
            </intent-filter>
        </receiver>
    </application>
</manifest>
```

**Configurações Importantes:**

- `android:theme="@android:style/Theme.Translucent.NoTitleBar"` - Activity transparente
- `android:showWhenLocked="true"` - Mostra sobre lockscreen
- `android:turnScreenOn="true"` - Acorda a tela
- `android:launchMode="singleInstance"` - Apenas uma instância por vez
- `android:exported="false"` - Não pode ser chamada de fora do app

---

### Interface TypeScript

#### **index.ts**

```typescript
import ExpoAlarmActivityModule from './src/ExpoAlarmActivityModule';
import type { AlarmData, PermissionStatus } from './src/ExpoAlarmActivity.types';

export async function scheduleAlarm(alarmData: AlarmData): Promise<void> {
  return ExpoAlarmActivityModule.scheduleAlarm(alarmData);
}

export async function cancelAlarm(alarmId: string): Promise<void> {
  return ExpoAlarmActivityModule.cancelAlarm(alarmId);
}

export function testOpenAlarmActivity(alarmData: AlarmData): void {
  ExpoAlarmActivityModule.testOpenAlarmActivity(alarmData);
}

export async function checkPermissions(): Promise<PermissionStatus> {
  return ExpoAlarmActivityModule.checkPermissions();
}

export function openSettings(type: 'exactAlarms' | 'overlay' | 'battery'): void {
  ExpoAlarmActivityModule.openSettings(type);
}

export { AlarmData, PermissionStatus };
```

#### **src/ExpoAlarmActivity.types.ts**

```typescript
export interface AlarmData {
  alarmId: string;
  time: string;
  period: 'AM' | 'PM';
  challenge: string;
  challengeIcon: string;
  type: 'alarm' | 'wake-check';
  triggerTime: number; // timestamp em milissegundos
}

export interface PermissionStatus {
  exactAlarms: boolean;
  overlay: boolean;
  batteryOptimization: boolean;
}
```

---

## 🧪 Plano de Testes

### Fase 1: Teste de Criação do Módulo

**Objetivo:** Verificar que o módulo foi criado corretamente

```bash
# 1. Criar módulo
cd modules
npx create-expo-module@latest expo-alarm-activity --local

# 2. Verificar estrutura
ls -R expo-alarm-activity/

# 3. Rebuild do app
cd ..
npx expo prebuild --clean
npx expo run:android
```

**Resultado esperado:**

- ✅ Módulo criado em `modules/expo-alarm-activity/`
- ✅ Build do Android sem erros
- ✅ App abre normalmente

---

### Fase 2: Teste da Função `testOpenAlarmActivity()`

**Objetivo:** Verificar se a AlarmActivity abre quando chamada do JavaScript

**Código de Teste (adicionar em alguma tela):**

```typescript
import { testOpenAlarmActivity } from '@/modules/expo-alarm-activity';

function TestButton() {
  const handleTest = () => {
    console.log('Testing AlarmActivity...');

    testOpenAlarmActivity({
      alarmId: 'test-123',
      time: '07:00',
      period: 'AM',
      challenge: 'Solve this: 5 + 3',
      challengeIcon: 'calculate',
      type: 'alarm',
      triggerTime: Date.now(),
    });
  };

  return <Button onPress={handleTest}>Test AlarmActivity</Button>;
}
```

**Passos:**

1. Adicionar botão de teste em qualquer tela
2. Tocar no botão
3. Observar logs do Logcat
4. Verificar se AlarmActivity abre e redireciona para React Native

**Resultado esperado:**

```
AlarmActivity: ====================================
AlarmActivity: Launching AlarmActivity with data: {...}
AlarmActivity: ====================================
AlarmActivity: AlarmActivity.onCreate()
AlarmActivity: Wake flags configured
AlarmActivity: Alarm Data: {alarmId=test-123, time=07:00, ...}
AlarmActivity: Deep Link: wakemind://alarm/trigger?alarmId=test-123&...
AlarmActivity: Launching MainActivity with deep link
AlarmActivity: Finishing AlarmActivity
```

- ✅ Tela de alarme aparece no React Native
- ✅ Dados corretos são passados (alarmId, time, etc)

---

### Fase 3: Teste de Agendamento com AlarmManager

**Objetivo:** Verificar se o alarme realmente agenda e dispara após 1 minuto

**Código de Teste:**

```typescript
import { scheduleAlarm, checkPermissions } from '@/modules/expo-alarm-activity';

function ScheduleTestButton() {
  const handleSchedule = async () => {
    // Verificar permissões primeiro
    const permissions = await checkPermissions();
    console.log('Permissions:', permissions);

    if (!permissions.exactAlarms) {
      console.warn('Exact alarms permission not granted');
      // Abrir configurações se necessário
      return;
    }

    // Agendar alarme para 1 minuto no futuro
    const triggerTime = Date.now() + 60 * 1000; // 1 minuto

    await scheduleAlarm({
      alarmId: 'test-schedule-123',
      time: '07:01',
      period: 'AM',
      challenge: 'Test Challenge',
      challengeIcon: 'calculate',
      type: 'alarm',
      triggerTime,
    });

    console.log('Alarm scheduled for 1 minute from now');
    console.log('Wait 1 minute and observe...');
  };

  return <Button onPress={handleSchedule}>Schedule Test Alarm (1 min)</Button>;
}
```

**Passos:**

1. Tocar no botão "Schedule Test Alarm"
2. **Bloquear a tela do celular**
3. Esperar 1 minuto
4. Observar se:
   - ✅ Tela acorda automaticamente
   - ✅ AlarmActivity aparece
   - ✅ App navega para tela de desafio
   - ✅ Logs aparecem no Logcat

**Resultado esperado após 1 minuto:**

```
AlarmReceiver: ====================================
AlarmReceiver: AlarmReceiver.onReceive()
AlarmReceiver: Action: expo.modules.alarmactivity.ALARM_TRIGGERED
AlarmReceiver: Launching AlarmActivity with data: {...}
AlarmActivity: ====================================
AlarmActivity: AlarmActivity.onCreate()
AlarmActivity: Wake flags configured
... (resto dos logs)
```

- ✅ Tela acorda mesmo bloqueada
- ✅ App abre automaticamente
- ✅ Navega para tela de alarme

---

### Fase 4: Teste de Cancelamento

**Objetivo:** Verificar se o alarme pode ser cancelado

```typescript
import { scheduleAlarm, cancelAlarm } from '@/modules/expo-alarm-activity';

function CancelTestButton() {
  const alarmId = 'test-cancel-123';

  const handleSchedule = async () => {
    const triggerTime = Date.now() + 2 * 60 * 1000; // 2 minutos

    await scheduleAlarm({
      alarmId,
      time: '07:02',
      period: 'AM',
      challenge: 'This alarm will be canceled',
      challengeIcon: 'calculate',
      type: 'alarm',
      triggerTime,
    });

    console.log('Alarm scheduled for 2 minutes');
  };

  const handleCancel = async () => {
    await cancelAlarm(alarmId);
    console.log('Alarm canceled');
  };

  return (
    <>
      <Button onPress={handleSchedule}>Schedule 2-min Alarm</Button>
      <Button onPress={handleCancel}>Cancel Alarm</Button>
    </>
  );
}
```

**Resultado esperado:**

- ✅ Alarme agendado para 2 minutos
- ✅ Cancelar antes de 2 minutos
- ✅ Alarme NÃO dispara após 2 minutos

---

## 📋 Checklist de Implementação

### Fase 1: Setup do Módulo

- [ ] Criar módulo: `npx create-expo-module@latest expo-alarm-activity --local`
- [ ] Estruturar arquivos Android conforme documentado
- [ ] Configurar `expo-module.config.json`
- [ ] Criar interfaces TypeScript

### Fase 2: Implementação Android (Mínimo Viável)

- [ ] Criar `AlarmActivity.kt` com lógica básica
- [ ] Criar `AlarmReceiver.kt`
- [ ] Criar `AlarmScheduler.kt` com `schedule()` e `cancel()`
- [ ] Criar `ExpoAlarmActivityModule.kt` com `testOpenAlarmActivity()`
- [ ] Configurar `AndroidManifest.xml`

### Fase 3: Testes Iniciais

- [ ] Teste 1: Módulo compila sem erros
- [ ] Teste 2: `testOpenAlarmActivity()` abre a Activity
- [ ] Teste 3: Activity redireciona para React Native
- [ ] Teste 4: Deep link funciona corretamente

### Fase 4: Integração com AlarmManager

- [ ] Implementar `AlarmScheduler.schedule()` completo
- [ ] Teste 5: Alarme agenda para 1 minuto
- [ ] Teste 6: Alarme dispara automaticamente
- [ ] Teste 7: Tela acorda com device bloqueado

### Fase 5: Integração com Código Existente

- [ ] Refatorar `alarm-scheduler.ts` para usar novo módulo
- [ ] Manter compatibilidade com iOS (Notifee)
- [ ] Migrar lógica de permissões
- [ ] Atualizar UI de permissões

### Fase 6: Polimento

- [ ] Adicionar verificação de permissões robusta
- [ ] Implementar `openSettings()` para cada tipo
- [ ] Melhorar logs e debugging
- [ ] Documentar uso do módulo

---

## 🔄 Integração com Código Existente

### Como Migrar de Notifee para o Novo Módulo

#### Antes (usando Notifee):

```typescript
// alarm-scheduler.ts
import notifee from '@notifee/react-native';

export async function scheduleAlarm(alarm: Alarm): Promise<string> {
  const triggerTimestamp = getNextTriggerTimestamp(alarm);

  const notificationId = await notifee.createTriggerNotification(
    {
      id: alarm.id,
      title: 'Alarm',
      // ...
      android: {
        fullScreenAction: {
          id: 'alarm-triggered',
          launchActivity: 'com.wgsoftwares.wakemind.AlarmActivity', // ❌ Não funciona
        },
      },
    },
    { type: TriggerType.TIMESTAMP, timestamp: triggerTimestamp }
  );

  return notificationId;
}
```

#### Depois (usando módulo nativo):

```typescript
// alarm-scheduler.ts
import { Platform } from 'react-native';
import notifee from '@notifee/react-native';
import { scheduleAlarm as scheduleNativeAlarm } from '@/modules/expo-alarm-activity';

export async function scheduleAlarm(alarm: Alarm): Promise<string> {
  const triggerTimestamp = getNextTriggerTimestamp(alarm);

  // Android: Usar módulo nativo com AlarmManager
  if (Platform.OS === 'android') {
    await scheduleNativeAlarm({
      alarmId: alarm.id,
      time: alarm.time,
      period: alarm.period,
      challenge: alarm.challenge,
      challengeIcon: alarm.challengeIcon,
      type: 'alarm',
      triggerTime: triggerTimestamp,
    });

    return alarm.id;
  }

  // iOS: Continuar usando Notifee com Critical Alerts
  const notificationId = await notifee.createTriggerNotification(
    {
      id: alarm.id,
      title: i18n.t('alarmScheduler.notification.title'),
      // ...
      ios: {
        sound: getToneFilename(useSettingsStore.getState().alarmToneId),
        critical: true,
        criticalVolume: 1.0,
      },
    },
    { type: TriggerType.TIMESTAMP, timestamp: triggerTimestamp }
  );

  return notificationId;
}
```

**Vantagens:**

- ✅ Android usa AlarmManager (mais confiável)
- ✅ iOS continua usando Notifee (funciona bem com Critical Alerts)
- ✅ Código limpo e separado por plataforma
- ✅ Fácil de manter

---

## 🎯 Próximos Passos

### Passo 1: Criar Estrutura Básica (30 min)

```bash
cd /Users/wallysongalvao/Documents/workspace/wakemind/modules
npx create-expo-module@latest expo-alarm-activity --local
```

### Passo 2: Implementar AlarmActivity Simples (1 hora)

Criar apenas o essencial:

- `AlarmActivity.kt` - Activity transparente
- `ExpoAlarmActivityModule.kt` - Função `testOpenAlarmActivity()`
- `AndroidManifest.xml` - Registrar Activity

### Passo 3: Primeiro Teste (15 min)

Adicionar botão de teste e verificar se Activity abre.

### Passo 4: Implementar AlarmManager (1 hora)

- `AlarmReceiver.kt`
- `AlarmScheduler.kt`
- Testar agendamento real

### Passo 5: Integração com App (30 min)

Refatorar `alarm-scheduler.ts` para usar novo módulo no Android.

---

## ❓ FAQ

### Por que não usar apenas Notifee?

**Resposta:** Notifee não implementa Full Screen Intent corretamente no Expo. Vários desenvolvedores reportam o mesmo problema. AlarmManager é a API oficial do Android para alarmes e é mais confiável.

### Preciso migrar para bare workflow?

**Resposta:** NÃO. Expo Local Modules funcionam no managed workflow com Development Build (que já está configurado no projeto).

### E o iOS?

**Resposta:** iOS continuará usando Notifee com Critical Alerts, que já funciona bem. Esta implementação é específica para Android.

### Isso vai aumentar o tamanho do app?

**Resposta:** Minimamente. O módulo adiciona ~10-15 KB de código Kotlin, que é insignificante.

### Preciso de permissões especiais?

**Resposta:** As mesmas que já estão no `app.config.ts`:

- `SCHEDULE_EXACT_ALARM`
- `USE_FULL_SCREEN_INTENT`
- `WAKE_LOCK`

### Funciona em todos os dispositivos Android?

**Resposta:** Sim, mas alguns OEMs (Xiaomi, Huawei) podem requerer configuração manual de "Auto Start". Já existe lógica para isso no app.

---

## 📚 Recursos

- [Expo Modules API](https://docs.expo.dev/modules/overview/)
- [Creating Local Modules](https://docs.expo.dev/modules/get-started/)
- [Android AlarmManager](https://developer.android.com/reference/android/app/AlarmManager)
- [Android Activities](https://developer.android.com/guide/components/activities/intro-activities)
- [Expo Modules Example](https://github.com/expo/fyi/blob/main/creating-native-modules.md)

---

## ✅ Conclusão

Esta abordagem oferece:

1. ✅ **Controle total** sobre quando/como a AlarmActivity abre
2. ✅ **Testável** - Função `testOpenAlarmActivity()` para debug
3. ✅ **Confiável** - Usa AlarmManager nativo do Android
4. ✅ **Compatível** com Expo managed workflow
5. ✅ **Simples** de implementar e manter
6. ✅ **Escalável** - Fácil adicionar funcionalidades

**Próxima ação:** Começar pela Fase 1 (Setup do Módulo) e fazer testes incrementais.

---

**Autor:** Análise baseada na estrutura existente do projeto WakeMind  
**Data:** 24 de Janeiro de 2026  
**Status:** Pronto para implementação
