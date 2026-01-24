const {
  withMainActivity,
  withAndroidManifest,
  withDangerousMod,
  AndroidConfig,
} = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo config plugin to add proper Full Screen Intent support
 * This creates a transparent activity that launches when alarm triggers
 */
function withFullScreenIntent(config) {
  // 1. Modify AndroidManifest to add transparent activity for alarms
  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);

    // Find or create the activity array
    if (!application.activity) {
      application.activity = [];
    }

    // Check if AlarmActivity already exists
    const alarmActivityExists = application.activity.some(
      (activity) => activity.$['android:name'] === '.AlarmActivity'
    );

    if (!alarmActivityExists) {
      // Add AlarmActivity - transparent activity that auto-launches alarm screen
      application.activity.push({
        $: {
          'android:name': '.AlarmActivity',
          'android:label': 'Alarm',
          'android:theme': '@android:style/Theme.Translucent.NoTitleBar',
          'android:excludeFromRecents': 'true',
          'android:exported': 'true', // Changed to true - Full Screen Intent requires exported
          'android:showWhenLocked': 'true',
          'android:turnScreenOn': 'true',
          'android:launchMode': 'singleInstance',
          'android:taskAffinity': '',
        },
      });

      console.log('✅ AlarmActivity added to AndroidManifest.xml');
    }

    // Ensure MainActivity has proper flags
    const mainActivity = application.activity.find(
      (activity) => activity.$['android:name'] === '.MainActivity'
    );

    if (mainActivity) {
      mainActivity.$['android:showWhenLocked'] = 'true';
      mainActivity.$['android:turnScreenOn'] = 'true';
      console.log('✅ MainActivity flags updated for wake-up');
    }

    return config;
  });

  // 2. Add AlarmActivity.kt source file using dangerousMod
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const androidMainPath = path.join(
        projectRoot,
        'android',
        'app',
        'src',
        'main',
        'java',
        'com',
        'wgsoftwares',
        'wakemind'
      );

      // Ensure directory exists
      if (!fs.existsSync(androidMainPath)) {
        fs.mkdirSync(androidMainPath, { recursive: true });
      }

      const alarmActivityPath = path.join(androidMainPath, 'AlarmActivity.kt');

      // Create AlarmActivity.kt
      const alarmActivityContent = `package com.wgsoftwares.wakemind

import android.app.ActivityManager
import android.app.KeyguardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import androidx.appcompat.app.AppCompatActivity

/**
 * Transparent activity that launches when alarm triggers
 * This activity is shown over the lock screen and launches the alarm screen
 */
class AlarmActivity : AppCompatActivity() {
    companion object {
        private const val TAG = "AlarmActivity"
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        android.util.Log.d(TAG, "========================================")
        android.util.Log.d(TAG, "AlarmActivity.onCreate() called!")
        android.util.Log.d(TAG, "Intent action: \${intent.action}")
        android.util.Log.d(TAG, "Intent data: \${intent.data}")
        android.util.Log.d(TAG, "Intent extras: \${intent.extras?.keySet()?.joinToString()}")
        android.util.Log.d(TAG, "========================================")
        
        // Turn on screen and show over lock screen
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
            
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
        
        // Keep screen on
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        
        android.util.Log.d(TAG, "Screen wake flags applied")
        
        // Get alarm data from intent extras (Notifee passes notification data as extras)
        val bundle = intent.extras
        android.util.Log.d(TAG, "All extras keys: \${bundle?.keySet()?.joinToString()}")
        
        val alarmId = bundle?.getString("alarmId") ?: intent.getStringExtra("alarmId") ?: ""
        val time = bundle?.getString("time") ?: intent.getStringExtra("time") ?: "00:00"
        val period = bundle?.getString("period") ?: intent.getStringExtra("period") ?: "AM"
        val challenge = bundle?.getString("challenge") ?: intent.getStringExtra("challenge") ?: "Challenge"
        val challengeIcon = bundle?.getString("challengeIcon") ?: intent.getStringExtra("challengeIcon") ?: "calculate"
        val type = bundle?.getString("type") ?: intent.getStringExtra("type") ?: "alarm"
        
        android.util.Log.d(TAG, "Extracted alarm data:")
        android.util.Log.d(TAG, "  alarmId: \$alarmId")
        android.util.Log.d(TAG, "  time: \$time")
        android.util.Log.d(TAG, "  period: \$period")
        android.util.Log.d(TAG, "  challenge: \$challenge")
        
        // Build deep link URL for alarm trigger screen
        val deepLinkUrl = "wakemind://alarm/trigger?alarmId=\${alarmId}&time=\${time}&period=\${period}&challenge=\${Uri.encode(challenge)}&challengeIcon=\${challengeIcon}&type=\${type}"
        
        android.util.Log.d(TAG, "Deep link URL: \$deepLinkUrl")
        
        // Check if app is already running
        val activityManager = getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val appTasks = activityManager.appTasks
        val isAppRunning = appTasks.any { 
            it.taskInfo.topActivity?.packageName == packageName 
        }
        
        android.util.Log.d(TAG, "Is app running: \$isAppRunning")
        
        // Launch MainActivity with deep link
        val mainIntent = Intent(this, MainActivity::class.java).apply {
            action = Intent.ACTION_VIEW
            data = Uri.parse(deepLinkUrl)
            
            if (isAppRunning) {
                // If app is running, bring it to front and navigate
                flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
            } else {
                // If app is not running, start fresh
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            
            // Pass all extras as well for fallback
            putExtra("alarmId", alarmId)
            putExtra("time", time)
            putExtra("period", period)
            putExtra("challenge", challenge)
            putExtra("challengeIcon", challengeIcon)
            putExtra("type", type)
        }
        
        android.util.Log.d(TAG, "Starting MainActivity...")
        android.util.Log.d(TAG, "  Action: \${mainIntent.action}")
        android.util.Log.d(TAG, "  Data: \${mainIntent.data}")
        android.util.Log.d(TAG, "  Flags: \${mainIntent.flags}")
        
        startActivity(mainIntent)
        
        android.util.Log.d(TAG, "MainActivity started, finishing AlarmActivity")
        android.util.Log.d(TAG, "========================================")
        
        finish()
    }
}
`;

      try {
        fs.writeFileSync(alarmActivityPath, alarmActivityContent);
        console.log('✅ AlarmActivity.kt created at:', alarmActivityPath);
      } catch (error) {
        console.warn('⚠️  Could not create AlarmActivity.kt:', error.message);
      }

      return config;
    },
  ]);

  return config;
}

module.exports = withFullScreenIntent;
