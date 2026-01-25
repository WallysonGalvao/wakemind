package expo.modules.alarmactivity

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat

/**
 * BroadcastReceiver que recebe alarmes do AlarmManager
 * e dispara uma notificação com Full Screen Intent para abrir AlarmActivity
 */
class AlarmReceiver : BroadcastReceiver() {
    companion object {
        private const val TAG = "AlarmReceiver"
        const val ACTION_ALARM = "expo.modules.alarmactivity.ACTION_ALARM"
        private const val CHANNEL_ID = "alarm_full_screen_channel"
        private const val NOTIFICATION_ID = 99999
    }

    override fun onReceive(context: Context, intent: Intent) {
        Log.d(TAG, "========================================")
        Log.d(TAG, "AlarmReceiver.onReceive() called!")
        Log.d(TAG, "Action: ${intent.action}")
        Log.d(TAG, "========================================")

        // Extrair dados do alarme
        val alarmId = intent.getStringExtra("alarmId") ?: "unknown"
        val time = intent.getStringExtra("time") ?: "00:00"
        val period = intent.getStringExtra("period") ?: "AM"
        val challenge = intent.getStringExtra("challenge") ?: "Challenge"
        val challengeIcon = intent.getStringExtra("challengeIcon") ?: "calculate"
        val type = intent.getStringExtra("type") ?: "alarm"

        Log.d(TAG, "Alarm data: alarmId=$alarmId, time=$time")

        // Criar canal de notificação (obrigatório no Android 8+)
        createNotificationChannel(context)

        // Build deep link URL for alarm trigger screen
        val deepLinkUrl = "wakemind://alarm/trigger?alarmId=${alarmId}&time=${time}&period=${period}&challenge=${Uri.encode(challenge)}&challengeIcon=${challengeIcon}&type=${type}"
        
        Log.d(TAG, "Deep link URL: $deepLinkUrl")

        // Criar Intent para abrir MainActivity DIRETO com deep link
        val activityIntent = Intent().apply {
            component = ComponentName(
                "com.wgsoftwares.wakemind",
                "com.wgsoftwares.wakemind.MainActivity" // Abre direto a MainActivity!
            )
            action = Intent.ACTION_VIEW
            data = Uri.parse(deepLinkUrl)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or 
                    Intent.FLAG_ACTIVITY_CLEAR_TOP or
                    Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS
            // Pass extras as fallback
            putExtra("alarmId", alarmId)
            putExtra("time", time)
            putExtra("period", period)
            putExtra("challenge", challenge)
            putExtra("challengeIcon", challengeIcon)
            putExtra("type", type)
        }

        // Criar PendingIntent para Full Screen Intent
        val fullScreenPendingIntent = PendingIntent.getActivity(
            context,
            alarmId.hashCode(), // Usar hashCode do alarmId para evitar conflitos
            activityIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        Log.d(TAG, "Creating Full Screen Intent notification...")

        // Criar notificação com Full Screen Intent
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        
        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm) // Ícone do sistema
            .setContentTitle("⏰ Alarm: $time $period")
            .setContentText("Tap to open alarm - $challenge")
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setAutoCancel(true)
            .setOngoing(false)
            .setShowWhen(true)
            .setWhen(System.currentTimeMillis())
            .setContentIntent(fullScreenPendingIntent) // Tap abre a activity
            .setFullScreenIntent(fullScreenPendingIntent, true) // CRITICAL: true = show immediately
            .setSound(null) // Sem som para teste
            .setVibrate(longArrayOf(0, 500, 200, 500)) // Vibração simples
            .build()

        notificationManager.notify(alarmId.hashCode(), notification)
        
        Log.d(TAG, "Full Screen Intent notification posted with ID: ${alarmId.hashCode()}")
        Log.d(TAG, "Notification will open MainActivity directly with deep link")
        Log.d(TAG, "If screen is locked, it SHOULD wake up and show MainActivity")
        Log.d(TAG, "========================================")
    }

    private fun createNotificationChannel(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = "Alarm Full Screen"
            val descriptionText = "Channel for alarm full screen intents"
            val importance = NotificationManager.IMPORTANCE_HIGH
            val channel = NotificationChannel(CHANNEL_ID, name, importance).apply {
                description = descriptionText
                setBypassDnd(true)
                enableVibration(true)
                setShowBadge(true)
                lockscreenVisibility = android.app.Notification.VISIBILITY_PUBLIC
            }
            
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
            
            Log.d(TAG, "Notification channel created: $CHANNEL_ID with importance HIGH")
        }
    }
}
