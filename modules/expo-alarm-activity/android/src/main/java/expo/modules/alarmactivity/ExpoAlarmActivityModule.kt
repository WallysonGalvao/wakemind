package expo.modules.alarmactivity

import android.app.AlarmManager
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.ComponentName
import android.net.Uri
import android.os.Build
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoAlarmActivityModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoAlarmActivity")

    // Verifica se o app tem permissão para usar Full Screen Intent
    Function("canUseFullScreenIntent") {
      val context = appContext.reactContext
      
      if (context == null) {
        return@Function false
      }

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) { // Android 14+
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        return@Function notificationManager.canUseFullScreenIntent()
      }
      
      // Android < 14 não precisa de permissão runtime
      return@Function true
    }

    // Abre as configurações do sistema para solicitar permissão de Full Screen Intent
    Function("requestFullScreenIntentPermission") {
      val context = appContext.reactContext
      
      if (context == null) {
        return@Function "Context is null"
      }

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
        val intent = Intent(Settings.ACTION_MANAGE_APP_USE_FULL_SCREEN_INTENT).apply {
          data = Uri.parse("package:${context.packageName}")
          flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        context.startActivity(intent)
        return@Function "Opening Full Screen Intent settings..."
      }
      
      return@Function "No permission needed on Android < 14"
    }

    // Função simples para testar: abre a AlarmActivity imediatamente
    // A AlarmActivity é criada pelo plugin withFullScreenIntent
    Function("testOpenActivity") {
      val context = appContext.reactContext
      
      if (context == null) {
        return@Function "Context is null"
      }
      
      // Usar Intent genérica com ComponentName para evitar dependência direta
      val intent = Intent().apply {
        component = ComponentName(
          "com.wgsoftwares.wakemind",
          "com.wgsoftwares.wakemind.AlarmActivity"
        )
        flags = Intent.FLAG_ACTIVITY_NEW_TASK
        putExtra("alarmId", "test-123")
        putExtra("time", "07:00")
        putExtra("period", "AM")
        putExtra("challenge", "Test Challenge")
        putExtra("challengeIcon", "calculate")
        putExtra("type", "alarm")
      }
      
      context.startActivity(intent)
      return@Function "Activity launched"
    }

    // Nova função: Agenda um alarme real usando AlarmManager que abre AlarmActivity após 10s
    Function("testAlarmManagerFullScreen") {
      val context = appContext.reactContext
      
      if (context == null) {
        return@Function "Context is null"
      }
      
      val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
      
      // Intent para o BroadcastReceiver (não mais para Activity diretamente)
      val intent = Intent(context, AlarmReceiver::class.java).apply {
        action = AlarmReceiver.ACTION_ALARM
        putExtra("alarmId", "test-alarm-manager-123")
        putExtra("time", "07:00")
        putExtra("period", "AM")
        putExtra("challenge", "AlarmManager Test")
        putExtra("challengeIcon", "calculate")
        putExtra("type", "alarm")
      }
      
      val pendingIntent = PendingIntent.getBroadcast(
        context,
        999, // Request code único para teste
        intent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      )
      
      // Agendar alarme para 10 segundos no futuro
      val triggerTime = System.currentTimeMillis() + 10_000L
      
      // Usar setExactAndAllowWhileIdle para garantir que dispare mesmo em Doze Mode
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        alarmManager.setExactAndAllowWhileIdle(
          AlarmManager.RTC_WAKEUP,
          triggerTime,
          pendingIntent
        )
      } else {
        alarmManager.setExact(
          AlarmManager.RTC_WAKEUP,
          triggerTime,
          pendingIntent
        )
      }
      
      android.util.Log.d("ExpoAlarmActivity", "AlarmManager scheduled for 10 seconds")
      android.util.Log.d("ExpoAlarmActivity", "Using BroadcastReceiver approach")
      android.util.Log.d("ExpoAlarmActivity", "Lock your screen now to test!")
      
      return@Function "AlarmManager scheduled for 10 seconds - Lock your screen!"
    }
  }
}
