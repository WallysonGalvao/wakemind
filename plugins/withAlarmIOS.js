const { withInfoPlist, withEntitlementsPlist } = require('expo/config-plugins');

/**
 * Expo config plugin to configure iOS for alarm functionality
 *
 * Configures:
 * 1. Background audio mode to allow sound to play when locked
 * 2. Critical alerts entitlement (requires Apple approval)
 * 3. Audio session configuration
 */
function withAlarmIOS(config) {
  // Configure Info.plist for background audio
  config = withInfoPlist(config, (config) => {
    const infoPlist = config.modResults;

    // Ensure UIBackgroundModes includes audio
    if (!infoPlist.UIBackgroundModes) {
      infoPlist.UIBackgroundModes = [];
    }
    if (!infoPlist.UIBackgroundModes.includes('audio')) {
      infoPlist.UIBackgroundModes.push('audio');
    }

    // Add audio session category description
    if (!infoPlist.NSMicrophoneUsageDescription) {
      infoPlist.NSMicrophoneUsageDescription =
        'This app uses audio for alarm sounds to wake you up effectively.';
    }

    return config;
  });

  // Configure critical alerts entitlement (optional - requires Apple approval)
  // Uncomment when you have Apple approval for critical alerts
  /*
  config = withEntitlementsPlist(config, (config) => {
    config.modResults['com.apple.developer.usernotifications.critical-alerts'] = true;
    return config;
  });
  */

  return config;
}

module.exports = withAlarmIOS;
