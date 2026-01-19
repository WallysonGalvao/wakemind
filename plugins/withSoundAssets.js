const { withXcodeProject } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo config plugin to copy sound assets to iOS bundle
 * This allows Notifee to play custom alarm sounds on iOS
 */
function withSoundAssets(config) {
  return withXcodeProject(config, async (config) => {
    const soundsDir = path.join(config.modRequest.projectRoot, 'assets', 'sounds');
    const iosResourcesDir = path.join(
      config.modRequest.projectRoot,
      'ios',
      config.modRequest.projectName || 'WakeMind'
    );

    // Ensure iOS resources directory exists
    if (!fs.existsSync(iosResourcesDir)) {
      console.warn('[withSoundAssets] iOS resources directory not found:', iosResourcesDir);
      return config;
    }

    // Copy all .wav files from assets/sounds to iOS bundle
    if (fs.existsSync(soundsDir)) {
      const soundFiles = fs.readdirSync(soundsDir).filter((file) => file.endsWith('.wav'));

      soundFiles.forEach((file) => {
        const src = path.join(soundsDir, file);
        const dest = path.join(iosResourcesDir, file);

        try {
          fs.copyFileSync(src, dest);
          console.log(`[withSoundAssets] Copied ${file} to iOS bundle`);
        } catch (error) {
          console.error(`[withSoundAssets] Error copying ${file}:`, error);
        }
      });

      // Add files to Xcode project
      const project = config.modResults;
      soundFiles.forEach((file) => {
        // Add file reference if it doesn't exist
        const fileRef = project.addResourceFile(file, { target: project.getFirstTarget().uuid });
        if (fileRef) {
          console.log(`[withSoundAssets] Added ${file} to Xcode project`);
        }
      });
    }

    return config;
  });
}

module.exports = withSoundAssets;
