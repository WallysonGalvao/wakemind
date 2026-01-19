const {
  withProjectBuildGradle,
  withDangerousMod,
  withMainActivity,
} = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo config plugin to add Notifee Maven repository to Android build.gradle
 * and configure MainActivity for alarm wake-up functionality.
 *
 * Issue: https://github.com/invertase/notifee/issues/1262
 */
function withNotifee(config) {
  // Add Maven repository
  config = withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      config.modResults.contents = addNotifeeMavenRepo(config.modResults.contents);
    }
    return config;
  });

  // Modify MainActivity to add alarm wake-up flags
  config = withMainActivity(config, (config) => {
    config.modResults.contents = addAlarmWakeUpFlags(config.modResults.contents);
    return config;
  });

  // Copy alarm sound to Android res/raw
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const soundSourcePath = path.join(projectRoot, 'assets', 'sounds', 'classic-alarm.wav');
      const rawDir = path.join(projectRoot, 'android', 'app', 'src', 'main', 'res', 'raw');
      const soundDestPath = path.join(rawDir, 'alarm_sound.wav');

      // Create raw directory if it doesn't exist
      if (!fs.existsSync(rawDir)) {
        fs.mkdirSync(rawDir, { recursive: true });
      }

      // Copy alarm sound file
      if (fs.existsSync(soundSourcePath)) {
        fs.copyFileSync(soundSourcePath, soundDestPath);
        console.log('✅ Alarm sound copied to Android res/raw');
      } else {
        console.warn('⚠️  Alarm sound file not found:', soundSourcePath);
      }

      return config;
    },
  ]);

  return config;
}

function addNotifeeMavenRepo(buildGradle) {
  // Check if already added
  if (buildGradle.includes('@notifee/react-native/android/libs')) {
    return buildGradle;
  }

  const notifeeRepo = `maven { url "$rootDir/../node_modules/@notifee/react-native/android/libs" }`;

  // Find the allprojects { repositories { block and add the maven repo
  const pattern = /(allprojects\s*\{\s*repositories\s*\{)/;

  if (pattern.test(buildGradle)) {
    return buildGradle.replace(pattern, `$1\n    ${notifeeRepo}`);
  }

  return buildGradle;
}

/**
 * Add alarm wake-up flags to MainActivity onCreate
 * This allows the alarm to wake up the screen and show over the lock screen
 */
function addAlarmWakeUpFlags(mainActivity) {
  // Check if already modified
  if (
    mainActivity.includes('FLAG_SHOW_WHEN_LOCKED') ||
    mainActivity.includes('setShowWhenLocked')
  ) {
    return mainActivity;
  }

  // Add WindowManager import if not present
  if (!mainActivity.includes('import android.view.WindowManager')) {
    mainActivity = mainActivity.replace(
      /import android\.os\.Bundle/,
      'import android.os.Bundle\nimport android.view.WindowManager'
    );
  }

  // Find the onCreate method and add the wake-up flags after super.onCreate(null)
  const wakeUpCode = `
    // Wake up the screen and show the app when locked (for alarm functionality)
    // This allows the alarm screen to be displayed even when the device is locked
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      setShowWhenLocked(true)
      setTurnScreenOn(true)
    } else {
      window.addFlags(
        WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
        WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
      )
    }
    
    // Keep screen on while alarm is active
    window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)`;

  // Insert after super.onCreate(null)
  const pattern = /(super\.onCreate\(null\))/;
  if (pattern.test(mainActivity)) {
    mainActivity = mainActivity.replace(pattern, `$1${wakeUpCode}`);
  }

  return mainActivity;
}

module.exports = withNotifee;
