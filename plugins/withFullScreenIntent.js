const { withMainActivity, withAndroidManifest, AndroidConfig } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo config plugin to add proper Full Screen Intent support
 * This creates a transparent activity that launches when alarm triggers
 */
function withFullScreenIntent(config) {
  // 1. Modify AndroidManifest to add transparent activity for alarms
  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
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
          'android:exported': 'false',
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

  // 2. Add AlarmActivity.kt source file
  config = withMainActivity(config, async (config) => {
    const projectRoot = config.modRequest?.projectRoot;
    if (!projectRoot) return config;

    const mainActivityPath = config.modResults.path;
    const activityDir = path.dirname(mainActivityPath);
    const alarmActivityPath = path.join(activityDir, 'AlarmActivity.kt');

    // Create AlarmActivity.kt
    const alarmActivityContent = `package com.wgsoftwares.wakemind

import android.app.KeyguardManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import androidx.appcompat.app.AppCompatActivity

/**
 * Transparent activity that launches when alarm triggers
 * This activity is shown over the lock screen and immediately launches the main app
 */
class AlarmActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
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
        
        // Launch MainActivity with alarm data
        val mainIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            
            // Pass through all extras from the notification
            intent.extras?.let { putExtras(it) }
        }
        
        startActivity(mainIntent)
        finish()
    }
}
`;

    try {
      fs.writeFileSync(alarmActivityPath, alarmActivityContent);
      console.log('✅ AlarmActivity.kt created');
    } catch (error) {
      console.warn('⚠️  Could not create AlarmActivity.kt:', error.message);
    }

    return config;
  });

  return config;
}

module.exports = withFullScreenIntent;
