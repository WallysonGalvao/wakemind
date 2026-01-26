const { withAndroidManifest, AndroidConfig } = require('expo/config-plugins');

/**
 * Expo config plugin to configure MainActivity for Full Screen Intent support
 * Adds necessary flags to wake screen and show over lock screen
 */
function withFullScreenIntent(config) {
  // Modify AndroidManifest to add wake/lock screen flags to MainActivity
  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);

    // Find MainActivity
    const mainActivity = application.activity?.find(
      (activity) => activity.$['android:name'] === '.MainActivity'
    );

    if (mainActivity) {
      // Add flags to show over lock screen and turn screen on
      mainActivity.$['android:showWhenLocked'] = 'true';
      mainActivity.$['android:turnScreenOn'] = 'true';
      // Allow app to show when other apps are on screen (uses SYSTEM_ALERT_WINDOW permission)
      mainActivity.$['android:showOnLockScreen'] = 'true';
      mainActivity.$['android:excludeFromRecents'] = 'false';
      console.log('✅ MainActivity configured for Full Screen Intent + SYSTEM_ALERT_WINDOW');
    } else {
      console.warn('⚠️  MainActivity not found in AndroidManifest.xml');
    }

    return config;
  });

  return config;
}

module.exports = withFullScreenIntent;
