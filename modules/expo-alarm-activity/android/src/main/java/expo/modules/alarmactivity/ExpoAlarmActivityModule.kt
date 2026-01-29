package expo.modules.alarmactivity

import android.app.AlarmManager
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.util.Log
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoAlarmActivityModule : Module() {
  
  companion object {
    private const val TAG = "ExpoAlarmActivityModule"
  }
  
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

    // Abre MainActivity com deep link (chamado quando Notifee dispara alarme)
    Function("openAlarmScreen") { alarmId: String, time: String, period: String, challenge: String, challengeIcon: String, type: String ->
      val context = appContext.reactContext
      
      if (context == null) {
        return@Function "Context is null"
      }

      // Construir deep link URL
      val deepLinkUrl = "wakemind://alarm/trigger?alarmId=${alarmId}&time=${time}&period=${period}&challenge=${Uri.encode(challenge)}&challengeIcon=${challengeIcon}&type=${type}"

      try {
        val activityIntent = Intent().apply {
          component = ComponentName(
            "com.wgsoftwares.wakemind",
            "com.wgsoftwares.wakemind.MainActivity"
          )
          action = Intent.ACTION_VIEW
          data = Uri.parse(deepLinkUrl)
          // Flags para abrir app usando SYSTEM_ALERT_WINDOW
          flags = Intent.FLAG_ACTIVITY_NEW_TASK or 
                  Intent.FLAG_ACTIVITY_CLEAR_TOP or
                  Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        
        context.startActivity(activityIntent)
        return@Function "MainActivity opened"
      } catch (e: Exception) {
        e.printStackTrace()
        return@Function "Error: ${e.message}"
      }
    }

    // ==================== PERMISSÕES ESPECÍFICAS DE FABRICANTES ====================
    
    // Detecta o fabricante do dispositivo
    Function("getDeviceManufacturer") {
      return@Function ManufacturerPermissionsHelper.getDeviceManufacturer()
    }

    // Verifica se é Xiaomi/Redmi
    Function("isXiaomi") {
      return@Function ManufacturerPermissionsHelper.isXiaomi()
    }

    // Verifica se o dispositivo requer AutoStart manual (Xiaomi, Huawei, Oppo, Vivo, Samsung)
    Function("requiresManufacturerAutoStart") {
      return@Function ManufacturerPermissionsHelper.requiresManufacturerAutoStart()
    }

    // Abre configurações de AutoStart (específico do fabricante)
    Function("openAutoStartSettings") {
      val context = appContext.reactContext
      
      if (context == null) {
        return@Function "Context is null"
      }

      val success = ManufacturerPermissionsHelper.openAutoStartSettings(context)
      return@Function if (success) "AutoStart settings opened" else "Fallback to app settings"
    }

    // Abre configurações de Battery Optimization
    Function("openBatteryOptimizationSettings") {
      val context = appContext.reactContext
      
      if (context == null) {
        return@Function "Context is null"
      }

      ManufacturerPermissionsHelper.openBatteryOptimizationSettings(context)
      return@Function "Battery optimization settings opened"
    }

    // Abre configurações de Display Over Other Apps
    Function("openDisplayOverOtherAppsSettings") {
      val context = appContext.reactContext
      
      if (context == null) {
        return@Function "Context is null"
      }

      ManufacturerPermissionsHelper.openDisplayOverOtherAppsSettings(context)
      return@Function "Display over other apps settings opened"
    }

    // Verifica se Display Over Other Apps está habilitado
    Function("canDrawOverlays") {
      val context = appContext.reactContext
      
      if (context == null) {
        return@Function false
      }

      return@Function ManufacturerPermissionsHelper.canDrawOverlays(context)
    }

    // Retorna mensagem específica para o fabricante
    Function("getManufacturerSpecificMessage") {
      return@Function ManufacturerPermissionsHelper.getManufacturerSpecificMessage()
    }

    // Abre configurações gerais do app
    Function("openAppSettings") {
      val context = appContext.reactContext
      
      if (context == null) {
        return@Function "Context is null"
      }

      ManufacturerPermissionsHelper.openAppSettings(context)
      return@Function "App settings opened"
    }

    // ==================== NATIVE ALARM MANAGER SCHEDULING ====================
    
    /**
     * Agenda alarme usando AlarmManager nativo (substituindo Notifee)
     * 
     * @param alarmId ID único do alarme
     * @param triggerAtMillis Timestamp em milissegundos quando alarme deve disparar
     * @param alarmData JSON com dados do alarme (time, period, challenge, etc)
     * @return Mensagem de sucesso ou erro
     */
    Function("scheduleNativeAlarm") { alarmId: String, triggerAtMillis: Long, time: String, period: String, challenge: String, challengeIcon: String, type: String ->
      val context = appContext.reactContext
      
      if (context == null) {
        return@Function "Context is null"
      }

      try {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        
        // Verificar se app tem permissão para agendar alarmes exatos
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) { // Android 12+
          if (!alarmManager.canScheduleExactAlarms()) {
            Log.w(TAG, "App não tem permissão SCHEDULE_EXACT_ALARM")
            return@Function "Missing SCHEDULE_EXACT_ALARM permission"
          }
        }
        
        // Criar Intent para o BroadcastReceiver
        val intent = Intent(context, AlarmReceiver::class.java).apply {
          action = AlarmReceiver.ACTION_ALARM
          putExtra(AlarmReceiver.EXTRA_ALARM_ID, alarmId)
          putExtra(AlarmReceiver.EXTRA_TIME, time)
          putExtra(AlarmReceiver.EXTRA_PERIOD, period)
          putExtra(AlarmReceiver.EXTRA_CHALLENGE, challenge)
          putExtra(AlarmReceiver.EXTRA_CHALLENGE_ICON, challengeIcon)
          putExtra(AlarmReceiver.EXTRA_TYPE, type)
        }
        
        // Criar PendingIntent único para este alarme
        val pendingIntent = PendingIntent.getBroadcast(
          context,
          alarmId.hashCode(), // Request code único baseado no ID
          intent,
          PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        
        // Criar AlarmClockInfo para mostrar ícone na status bar
        val alarmClockInfo = AlarmManager.AlarmClockInfo(
          triggerAtMillis,
          pendingIntent // PendingIntent para abrir app quando usuário tocar no ícone
        )
        
        // Agendar alarme com MÁXIMA PRIORIDADE
        // setAlarmClock() ignora Doze, App Standby e otimizações de bateria
        alarmManager.setAlarmClock(alarmClockInfo, pendingIntent)
        
        Log.d(TAG, "Native alarm scheduled: id=$alarmId, triggerAt=$triggerAtMillis")
        return@Function "Native alarm scheduled successfully"
        
      } catch (e: SecurityException) {
        Log.e(TAG, "SecurityException: Missing alarm permission", e)
        return@Function "Error: Missing alarm permission - ${e.message}"
      } catch (e: Exception) {
        Log.e(TAG, "Failed to schedule native alarm", e)
        return@Function "Error: ${e.message}"
      }
    }
    
    /**
     * Cancela alarme agendado no AlarmManager
     * 
     * @param alarmId ID único do alarme a ser cancelado
     * @return Mensagem de sucesso ou erro
     */
    Function("cancelNativeAlarm") { alarmId: String ->
      val context = appContext.reactContext
      
      if (context == null) {
        return@Function "Context is null"
      }

      try {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        
        // Criar Intent idêntico ao usado no agendamento
        val intent = Intent(context, AlarmReceiver::class.java).apply {
          action = AlarmReceiver.ACTION_ALARM
        }
        
        // Criar PendingIntent com mesmo request code
        val pendingIntent = PendingIntent.getBroadcast(
          context,
          alarmId.hashCode(),
          intent,
          PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        
        // Cancelar alarme
        alarmManager.cancel(pendingIntent)
        pendingIntent.cancel()
        
        Log.d(TAG, "Native alarm cancelled: id=$alarmId")
        return@Function "Native alarm cancelled successfully"
        
      } catch (e: Exception) {
        Log.e(TAG, "Failed to cancel native alarm", e)
        return@Function "Error: ${e.message}"
      }
    }
    
    /**
     * Verifica se app pode agendar alarmes exatos (Android 12+)
     */
    Function("canScheduleExactAlarms") {
      val context = appContext.reactContext
      
      if (context == null) {
        return@Function false
      }

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        return@Function alarmManager.canScheduleExactAlarms()
      }
      
      // Android < 12 não precisa de permissão runtime
      return@Function true
    }
    
    /**
     * Abre configurações de alarmes exatos para usuário conceder permissão
     * Necessário apenas no Android 12+
     */
    Function("openExactAlarmSettings") {
      val context = appContext.reactContext
      
      if (context == null) {
        return@Function "Context is null"
      }

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        try {
          val intent = Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM).apply {
            data = Uri.parse("package:${context.packageName}")
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
          }
          context.startActivity(intent)
          return@Function "Opening exact alarm settings..."
        } catch (e: Exception) {
          Log.e(TAG, "Failed to open exact alarm settings", e)
          return@Function "Error: ${e.message}"
        }
      }
      
      return@Function "No permission needed on Android < 12"
    }
    
    /**
     * Para o Foreground Service do alarme
     * Deve ser chamado quando o usuário dismissar o alarme
     */
    Function("stopAlarmService") {
      val context = appContext.reactContext
      
      if (context == null) {
        return@Function "Context is null"
      }

      try {
        AlarmForegroundService.stop(context)
        Log.d(TAG, "Alarm Foreground Service stopped")
        return@Function "Alarm service stopped successfully"
      } catch (e: Exception) {
        Log.e(TAG, "Failed to stop alarm service", e)
        return@Function "Error: ${e.message}"
      }
    }
  }
}
