package expo.modules.alarmactivity

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat

/**
 * Foreground Service para abrir MainActivity quando alarme dispara com tela desbloqueada
 * 
 * Foreground Services têm permissão para iniciar Activities mesmo em Android 10+
 * quando iniciados de um BroadcastReceiver
 * 
 * Fluxo:
 * 1. AlarmReceiver detecta tela desbloqueada
 * 2. Inicia ForegroundAlarmHandler
 * 3. Service inicia como foreground (mostra notificação temporária)
 * 4. Service abre MainActivity com deep link
 * 5. Service se encerra automaticamente
 */
class ForegroundAlarmHandler : Service() {
    companion object {
        private const val TAG = "ForegroundAlarmHandler"
        private const val CHANNEL_ID = "alarm_foreground_service"
        private const val NOTIFICATION_ID = 99998
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "ForegroundAlarmHandler created")
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d(TAG, "========================================")
        Log.d(TAG, "ForegroundAlarmHandler.onStartCommand()")
        
        // Iniciar como foreground service (obrigatório Android 8+)
        val notification = createForegroundNotification()
        startForeground(NOTIFICATION_ID, notification)
        Log.d(TAG, "Started as foreground service")

        intent?.let { receivedIntent ->
            val deepLinkUrl = receivedIntent.getStringExtra("deepLinkUrl") ?: return@let
            val alarmId = receivedIntent.getStringExtra("alarmId") ?: "unknown"
            val time = receivedIntent.getStringExtra("time") ?: "00:00"
            val period = receivedIntent.getStringExtra("period") ?: "AM"
            val challenge = receivedIntent.getStringExtra("challenge") ?: ""
            val challengeIcon = receivedIntent.getStringExtra("challengeIcon") ?: "calculate"
            val type = receivedIntent.getStringExtra("type") ?: "alarm"

            Log.d(TAG, "Deep link URL: $deepLinkUrl")

            val activityIntent = Intent()
            activityIntent.component = ComponentName(
                "com.wgsoftwares.wakemind",
                "com.wgsoftwares.wakemind.MainActivity"
            )
            activityIntent.action = Intent.ACTION_VIEW
            activityIntent.data = Uri.parse(deepLinkUrl)
            activityIntent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
            activityIntent.putExtra("alarmId", alarmId)
            activityIntent.putExtra("time", time)
            activityIntent.putExtra("period", period)
            activityIntent.putExtra("challenge", challenge)
            activityIntent.putExtra("challengeIcon", challengeIcon)
            activityIntent.putExtra("type", type)

            try {
                startActivity(activityIntent)
                Log.d(TAG, "✅ MainActivity launched successfully from Foreground Service")
            } catch (e: Exception) {
                Log.e(TAG, "❌ Failed to launch MainActivity: ${e.message}")
                e.printStackTrace()
            }
        }

        Log.d(TAG, "Stopping foreground service")
        Log.d(TAG, "========================================")
        
        // Parar o service após abrir a activity
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
        
        return START_NOT_STICKY
    }

    private fun createForegroundNotification(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentTitle("Alarm Triggering")
            .setContentText("Opening alarm...")
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = "Alarm Foreground Service"
            val descriptionText = "Temporary notification for alarm service"
            val importance = NotificationManager.IMPORTANCE_LOW
            val channel = NotificationChannel(CHANNEL_ID, name, importance).apply {
                description = descriptionText
            }
            
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
            
            Log.d(TAG, "Notification channel created: $CHANNEL_ID")
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.d(TAG, "ForegroundAlarmHandler destroyed")
    }
}
