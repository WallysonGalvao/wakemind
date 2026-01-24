export default {
  title: 'Set your alarm time',
  progressLabel: '{{current}}/{{total}}',

  notifications: {
    ios: {
      title: 'Allow "{{appName}}" to schedule alarms and timers?',
      description:
        'This will allow the app to schedule alarms and timers that can play sounds and appear on screen even if a Focus is active.',
      additionalInfo: 'We need this permission to ring the alarm when the phone is locked.',
    },
    android: {
      title: 'Allow {{appName}} to send notifications?',
      description:
        "Notifications are essential for your alarm to ring. Without this permission, alarms won't work.",
      additionalInfo: 'You can customize notification settings later in the app.',
    },
    general: {
      title: '"{{appName}}" Would Like to Send You Notifications',
      description:
        'Notifications may include alerts, sounds, and icon badges. These can be configured in Settings.',
    },
  },

  exactAlarms: {
    title: 'Allow precise alarm scheduling?',
    description:
      'This permission ensures your alarm rings exactly on time, even when your phone is in deep sleep.',
    additionalInfo: 'Required for Android 12+ to schedule exact alarms.',
  },

  batteryOptimization: {
    title: 'Disable battery optimization?',
    description:
      'Battery optimization can prevent alarms from ringing. We recommend disabling it for {{appName}}.',
    additionalInfo: 'This ensures the alarm works reliably even when battery saver is active.',
    buttonAllow: 'Open Settings',
    buttonDeny: 'Skip for now',
  },

  summary: {
    title: 'Ensure your alarm rings',
    description: 'Alarm and Notification permissions let us ring when the phone is locked',
    alarmsLabel: 'Alarms ({{platform}} {{version}})',
    notificationsLabel: 'Notifications',
  },

  buttons: {
    allow: 'Allow',
    dontAllow: "Don't Allow",
    next: 'Next',
    skip: 'Skip',
  },
};
