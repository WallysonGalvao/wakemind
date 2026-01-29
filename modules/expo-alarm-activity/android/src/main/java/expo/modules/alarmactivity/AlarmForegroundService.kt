package expo.modules.alarmactivity

import android.app.*
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat

/**
 * Foreground Service que mantém o processo do app vivo enquanto o alarme está ativo
 * 
 * CRÍTICO para dispositivos com otimização agressiva de bateria (Xiaomi, Huawei, Samsung, Oppo, Vivo)
 * OEMs não podem matar processo em Foreground Service
 * 
 * Responsabilidades:
 * 1. Manter processo vivo durante toque do alarme
 * 2. Exibir notificação de baixa prioridade (IMPORTANCE_LOW) para não interferir com UI
 * 3. Ser parado quando alarme for dismissed pelo usuário
 */
class AlarmForegroundService : Service() {
    
    companion object {
        private const val TAG = "AlarmForegroundService"
        
        // Notification IDs
        const val NOTIFICATION_ID = 1001
        const val CHANNEL_ID = "alarm_foreground_service"
        const val CHANNEL_NAME = "Alarm Active"
        
        // Intent extras
        const val EXTRA_ALARM_ID = "alarm_id"
        const val EXTRA_TIME = "time"
        const val EXTRA_CHALLENGE = "challenge"
        
        /**
         * Inicia o Foreground Service
         */
        fun start(context: Context, alarmId: String, time: String, challenge: String) {
            val intent = Intent(context, AlarmForegroundService::class.java).apply {
                putExtra(EXTRA_ALARM_ID, alarmId)
                putExtra(EXTRA_TIME, time)
                putExtra(EXTRA_CHALLENGE, challenge)
            }
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }
        
        /**
         * Para o Foreground Service
         */
        fun stop(context: Context) {
            val intent = Intent(context, AlarmForegroundService::class.java)
            context.stopService(intent)
        }
    }
    
    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "onCreate: Foreground Service created")
        
        // Criar notification channel (Android 8.0+)
        createNotificationChannel()
    }
    
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d(TAG, "onStartCommand: Starting foreground service")
        
        // Extrair dados do Intent
        val alarmId = intent?.getStringExtra(EXTRA_ALARM_ID) ?: ""
        val time = intent?.getStringExtra(EXTRA_TIME) ?: ""
        val challenge = intent?.getStringExtra(EXTRA_CHALLENGE) ?: ""
        
        // Criar notificação
        val notification = buildNotification(alarmId, time, challenge)
        
        // Iniciar como Foreground Service
        startForeground(NOTIFICATION_ID, notification)
        
        Log.d(TAG, "Foreground service started for alarm: $alarmId")
        
        // START_STICKY: Se o sistema matar o service, recrie-o
        return START_STICKY
    }
    
    override fun onBind(intent: Intent?): IBinder? {
        // Este service não é bindable
        return null
    }
    
    override fun onDestroy() {
        super.onDestroy()
        Log.d(TAG, "onDestroy: Foreground Service stopped")
    }
    
    /**
     * Cria notification channel de BAIXA PRIORIDADE
     * Evita interferência visual com a UI do alarme
     */
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_LOW // Baixa prioridade - sem som/vibração/popup
            ).apply {
                description = "Keeps the alarm active in the background"
                setShowBadge(false)
                enableLights(false)
                enableVibration(false)
                setSound(null, null)
            }
            
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
            
            Log.d(TAG, "Notification channel created: $CHANNEL_ID")
        }
    }
    
    /**
     * Constrói notificação de baixa prioridade
     * Não interfere com a UI do alarme
     */
    private fun buildNotification(alarmId: String, time: String, challenge: String): Notification {
        // Intent para abrir app quando usuário tocar na notificação
        val notificationIntent = Intent(this, Class.forName("com.wgsoftwares.wakemind.MainActivity")).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            notificationIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        
        // Construir notificação
        val builder = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Alarm Active")
            .setContentText("WakeMind alarm is active")
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm) // Ícone padrão de alarme
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_LOW) // Baixa prioridade
            .setOngoing(true) // Não pode ser dismissed pelo usuário
            .setAutoCancel(false)
            .setShowWhen(false)
            .setSound(null) // Sem som
            .setVibrate(null) // Sem vibração
        
        // Android 8.0+ requer channel
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            builder.setChannelId(CHANNEL_ID)
        }
        
        return builder.build()
    }
}
