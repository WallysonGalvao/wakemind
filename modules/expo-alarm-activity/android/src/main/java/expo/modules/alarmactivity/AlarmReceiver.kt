package expo.modules.alarmactivity

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.PowerManager
import android.util.Log

/**
 * BroadcastReceiver que recebe broadcasts do AlarmManager quando um alarme dispara
 * 
 * Responsabilidades:
 * 1. Adquirir WakeLock para garantir que o CPU permaneça ativo
 * 2. Iniciar Foreground Service para manter processo vivo
 * 3. Lançar AlarmActivity para exibir interface do alarme
 */
class AlarmReceiver : BroadcastReceiver() {
    
    companion object {
        private const val TAG = "AlarmReceiver"
        const val ACTION_ALARM = "expo.modules.alarmactivity.ACTION_ALARM"
        
        // Extras passados no Intent
        const val EXTRA_ALARM_ID = "alarm_id"
        const val EXTRA_TIME = "time"
        const val EXTRA_PERIOD = "period"
        const val EXTRA_CHALLENGE = "challenge"
        const val EXTRA_CHALLENGE_ICON = "challenge_icon"
        const val EXTRA_TYPE = "type"
        
        // WakeLock para manter CPU ativo durante processamento
        private var wakeLock: PowerManager.WakeLock? = null
    }
    
    override fun onReceive(context: Context?, intent: Intent?) {
        if (context == null || intent == null) {
            Log.e(TAG, "onReceive: context or intent is null")
            return
        }
        
        if (intent.action != ACTION_ALARM) {
            Log.w(TAG, "onReceive: received unexpected action ${intent.action}")
            return
        }
        
        Log.d(TAG, "onReceive: Alarm triggered!")
        
        // Extrair dados do alarme do Intent
        val alarmId = intent.getStringExtra(EXTRA_ALARM_ID) ?: ""
        val time = intent.getStringExtra(EXTRA_TIME) ?: ""
        val period = intent.getStringExtra(EXTRA_PERIOD) ?: ""
        val challenge = intent.getStringExtra(EXTRA_CHALLENGE) ?: ""
        val challengeIcon = intent.getStringExtra(EXTRA_CHALLENGE_ICON) ?: ""
        val type = intent.getStringExtra(EXTRA_TYPE) ?: ""
        
        Log.d(TAG, "Alarm details: id=$alarmId, time=$time, challenge=$challenge")
        
        // PASSO 1: Adquirir WakeLock para garantir que o CPU não durma durante processamento
        acquireWakeLock(context)
        
        // PASSO 2: Iniciar Foreground Service para manter processo vivo
        startForegroundService(context, alarmId, time, challenge)
        
        // PASSO 3: Abrir AlarmActivity com flags apropriadas
        openAlarmActivity(context, alarmId, time, period, challenge, challengeIcon, type)
        
        // WakeLock será liberado após 10 segundos (tempo suficiente para Activity abrir)
        releaseWakeLock(10000)
    }
    
    /**
     * Adquire PARTIAL_WAKE_LOCK para garantir que CPU permaneça ativo
     * Crítico para dispositivos em deep sleep (Doze mode)
     */
    private fun acquireWakeLock(context: Context) {
        try {
            val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
            wakeLock = powerManager.newWakeLock(
                PowerManager.PARTIAL_WAKE_LOCK,
                "WakeMind::AlarmWakeLock"
            ).apply {
                acquire(60000) // Máximo 60 segundos (timeout de segurança)
            }
            Log.d(TAG, "WakeLock acquired")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to acquire WakeLock", e)
        }
    }
    
    /**
     * Libera WakeLock após delay (para dar tempo da Activity abrir)
     */
    private fun releaseWakeLock(delayMs: Long) {
        android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
            try {
                wakeLock?.let {
                    if (it.isHeld) {
                        it.release()
                        Log.d(TAG, "WakeLock released")
                    }
                }
                wakeLock = null
            } catch (e: Exception) {
                Log.e(TAG, "Failed to release WakeLock", e)
            }
        }, delayMs)
    }
    
    /**
     * Inicia Foreground Service para manter processo vivo
     * CRÍTICO: OEMs não podem matar processo em Foreground Service
     */
    private fun startForegroundService(context: Context, alarmId: String, time: String, challenge: String) {
        try {
            AlarmForegroundService.start(context, alarmId, time, challenge)
            Log.d(TAG, "Foreground Service started")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start Foreground Service", e)
        }
    }
    
    /**
     * Abre MainActivity com deep link para tela de alarme
     * Flags garantem que Activity abrirá mesmo com tela bloqueada
     */
    private fun openAlarmActivity(
        context: Context,
        alarmId: String,
        time: String,
        period: String,
        challenge: String,
        challengeIcon: String,
        type: String
    ) {
        try {
            // Construir deep link URL
            val deepLinkUrl = "wakemind://alarm/trigger?alarmId=$alarmId&time=$time&period=$period&challenge=${android.net.Uri.encode(challenge)}&challengeIcon=$challengeIcon&type=$type"
            
            val activityIntent = Intent().apply {
                component = android.content.ComponentName(
                    "com.wgsoftwares.wakemind",
                    "com.wgsoftwares.wakemind.MainActivity"
                )
                action = Intent.ACTION_VIEW
                data = android.net.Uri.parse(deepLinkUrl)
                
                // Flags críticas para abrir Activity mesmo com tela bloqueada
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or
                        Intent.FLAG_ACTIVITY_CLEAR_TOP or
                        Intent.FLAG_ACTIVITY_SINGLE_TOP or
                        Intent.FLAG_ACTIVITY_NO_USER_ACTION or
                        Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS
            }
            
            context.startActivity(activityIntent)
            Log.d(TAG, "AlarmActivity opened with deep link: $deepLinkUrl")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to open AlarmActivity", e)
        }
    }
}
