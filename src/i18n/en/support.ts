export const supportEN = {
  'support.faq.title': 'Frequently Asked Questions',

  // Alarms & Notifications
  'support.faq.alarms.title': 'Alarms & Notifications',
  'support.faq.alarms.notRinging.question': 'Alarm is not ringing on time',
  'support.faq.alarms.notRinging.answer':
    'Check if notifications are enabled for WakeMind in system settings. Confirm the alarm is active (toggle on). Ensure device volume is not at minimum.',
  'support.faq.alarms.locked.question': 'Alarm does not ring when phone is locked',
  'support.faq.alarms.locked.answer':
    'iOS: Go to Settings > Notifications > WakeMind and enable "Show on Lock Screen". Android: Verify exact alarm permissions are granted.',
  'support.faq.alarms.snooze.question': 'How does Snooze Protection work?',
  'support.faq.alarms.snooze.answer':
    'When enabled, you must complete a cognitive challenge to snooze the alarm, preventing unconscious snoozing.',
  'support.faq.alarms.permissions.question': 'What permissions does WakeMind need on Android 14+?',
  'support.faq.alarms.permissions.answer':
    'Android 14+ requires: 1) Full Screen Notifications - to open the app automatically when alarm triggers (Settings > Apps > WakeMind > Notifications > Allow full screen notifications). 2) Disable Battery Optimization - ensures alarms ring reliably even when phone is idle.',
  'support.faq.alarms.autoOpen.question': 'App does not open automatically when alarm rings',
  'support.faq.alarms.autoOpen.answer':
    'Enable "Full Screen Notifications" in Settings > Apps > WakeMind > Notifications. Also disable battery optimization for WakeMind.',

  // Sound & Vibration
  'support.faq.sound.title': 'Sound & Vibration',
  'support.faq.sound.noVibration.question': 'Alarm is not vibrating',
  'support.faq.sound.noVibration.answer':
    'Check if vibration is enabled in system settings. Disable silent mode (some devices block vibration in this mode). Test vibration pattern in Settings > Sound & Vibration.',
  'support.faq.sound.testTones.question': 'How to test alarm tones?',
  'support.faq.sound.testTones.answer':
    'Go to Settings > Alarm Tone and tap any sound to hear it before selecting.',

  // Cognitive Challenges
  'support.faq.challenges.title': 'Cognitive Challenges',
  'support.faq.challenges.difficult.question': 'Challenges are too difficult',
  'support.faq.challenges.difficult.answer':
    'Challenges are designed to ensure you are fully awake. Over time, your brain will adapt.',
  'support.faq.challenges.screenLock.question': 'Screen locks during challenge',
  'support.faq.challenges.screenLock.answer': 'Enable "Prevent Auto-Lock" in Settings > Behavior.',

  // Performance Summary
  'support.faq.performance.title': 'Performance Summary',
  'support.faq.performance.cognitiveScore.question': 'How is my Cognitive Score calculated?',
  'support.faq.performance.cognitiveScore.answer':
    'Your score (0-100) is based on: challenge difficulty (Easy: 60pts, Medium: 75pts, Hard: 90pts), number of attempts (-10pts per extra attempt), completion speed (bonus up to +15pts for <10s), and total time (-10pts if >2min).',
  'support.faq.performance.streak.question': 'What is a Streak?',
  'support.faq.performance.streak.answer':
    'Your streak counts consecutive days you successfully completed alarm challenges. It resets if you miss a day or fail to complete a challenge.',
  'support.faq.performance.data.question': 'Where is my performance data stored?',
  'support.faq.performance.data.answer':
    'All performance data (streaks, scores, reaction times) is stored locally on your device. No data is sent to external servers.',

  // Technical Issues
  'support.faq.technical.title': 'Technical Issues',
  'support.faq.technical.crashing.question': 'App is crashing',
  'support.faq.technical.crashing.answer':
    '1. Force close the app. 2. Restart your device. 3. Ensure you have the latest version installed. 4. If persists, uninstall and reinstall (your alarms will be lost).',
  'support.faq.technical.battery.question': 'App is consuming too much battery',
  'support.faq.technical.battery.answer':
    'Disable "Prevent Auto-Lock" if not in use. Reduce vibration pattern intensity. Check for duplicate alarms.',

  // Contact
  'support.contact.title': 'Need More Help?',
  'support.contact.description':
    'Found a bug or have a suggestion? Contact us and we will get back to you as soon as possible.',
  'support.contact.emailButton': 'Send Email',

  // Footer
  'support.footer': 'WakeMind - Wake up your mind, not just your body.',
};
