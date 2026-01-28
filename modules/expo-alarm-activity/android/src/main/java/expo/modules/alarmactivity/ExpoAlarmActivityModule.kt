package expo.modules.alarmactivity

import android.app.NotificationManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
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
  }
}
