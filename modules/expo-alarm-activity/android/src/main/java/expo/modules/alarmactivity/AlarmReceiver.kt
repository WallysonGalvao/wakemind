package expo.modules.alarmactivity

import android.app.KeyguardManager
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
 * 
 * ESTRATÉGIA DUAL com SYSTEM_ALERT_WINDOW:
 * - Tela bloqueada: Full Screen Intent notification
 * - Tela desbloqueada: startActivity com flags TYPE_APPLICATION_OVERLAY
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

        // Verificar se a tela está bloqueada
        val keyguardManager = context.getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
        val isScreenLocked = keyguardManager.isKeyguardLocked

        // Build deep link URL
        val deepLinkUrl = "wakemind://alarm/trigger?alarmId=${alarmId}&time=${time}&period=${period}&challenge=${Uri.encode(challenge)}&challengeIcon=${challengeIcon}&type=${type}"
        
        Log.d(TAG, "Screen locked: $isScreenLocked")
        Log.d(TAG, "Deep link: $deepLinkUrl")

        if (isScreenLocked) {
            Log.d(TAG, "🔒 Using Full Screen Intent (locked screen)")
            handleLockedScreen(context, alarmId, time, period, challenge, deepLinkUrl)
        } else {
            Log.d(TAG, "🔓 Using SYSTEM_ALERT_WINDOW overlay (unlocked screen)")
            handleUnlockedScreen(context, deepLinkUrl)
        }
        
        Log.d(TAG, "========================================")
    }

    /**
     * Full Screen Intent notification (locked screen only)
     */
    private fun handleLockedScreen(
        context: Context,
        alarmId: String,
        time: String,
        period: String,
        challenge: String,
        deepLinkUrl: String
    ) {
        createNotificationChannel(context)
        
        val activityIntent = Intent().apply {
            component = ComponentName(
                "com.wgsoftwares.wakemind",
                "com.wgsoftwares.wakemind.MainActivity"
            )
            action = Intent.ACTION_VIEW
            data = Uri.parse(deepLinkUrl)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        
        val pendingIntent = PendingIntent.getActivity(
            context,
            alarmId.hashCode(),
            activityIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        
        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentTitle("⏰ Alarm: $time $period")
            .setContentText(challenge)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .setFullScreenIntent(pendingIntent, true)
            .setVibrate(longArrayOf(0, 500, 200, 500))
            .build()
        
        notificationManager.notify(alarmId.hashCode(), notification)
        Log.d(TAG, "✅ Full Screen Intent notification posted")
    }

    /**
     * Direct activity launch with SYSTEM_ALERT_WINDOW permission (unlocked screen)
     */
    private fun handleUnlockedScreen(
        context: Context,
        deepLinkUrl: String
    ) {
        try {
            val activityIntent = Intent().apply {
                component = ComponentName(
                    "com.wgsoftwares.wakemind",
                    "com.wgsoftwares.wakemind.MainActivity"
                )
                action = Intent.ACTION_VIEW
                data = Uri.parse(deepLinkUrl)
                // Flags especiais para usar com SYSTEM_ALERT_WINDOW
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or 
                        Intent.FLAG_ACTIVITY_CLEAR_TOP or
                        Intent.FLAG_ACTIVITY_SINGLE_TOP or
                        Intent.FLAG_ACTIVITY_NO_USER_ACTION or
                        Intent.FLAG_FROM_BACKGROUND
            }
            
            context.startActivity(activityIntent)
            Log.d(TAG, "✅ MainActivity launched with SYSTEM_ALERT_WINDOW flags")
        } catch (e: Exception) {
            Log.e(TAG, "❌ Failed to launch MainActivity: ${e.message}")
            e.printStackTrace()
        }
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
