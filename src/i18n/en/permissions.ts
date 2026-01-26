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

  displayOverOtherApps: {
    title: 'Allow display over other apps?',
    description:
      'This permission allows the alarm to automatically launch when the app is in the background.',
    additionalInfo:
      'Essential for the alarm to work like native alarm apps, opening the screen even when the phone is locked.',
    buttonAllow: 'Open Settings',
    buttonDeny: 'Skip for now',
  },

  autoStart: {
    title: 'Enable Auto-Start?',
    description:
      'Allow WakeMind to start automatically in the background. Required on {{manufacturer}} devices.',
    additionalInfo:
      'Without this, alarms may not ring when the app is closed. This is critical for Xiaomi, Huawei, Oppo, Vivo, and Samsung devices.',
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

  // Alarm Permissions Modal (for first alarm creation)
  alarmPermissions: {
    progress: 'Permission {{current}} / {{total}}',

    intro: {
      title: "Don't let your alarms stay silent",
      description: 'To work perfectly, we need 2 important permissions',
      step1Title: 'Display over other apps',
      step1Description: 'Open the alarm automatically, even with locked screen',
      step2Title: 'Auto start',
      step2Description: 'Ensure the alarm always rings, even in background',
      footer: 'You can configure this now or do it later in settings',
    },

    systemAlertWindow: {
      title: 'To dismiss alarm without unlocking',
      description: 'Grant permission to Display over other apps',
      benefitTitle: 'Why we need this?',
      benefit:
        'Allows the app to open automatically over the lock screen when the alarm rings. You can dismiss or snooze without unlocking your phone.',
    },

    batteryOptimization: {
      title: 'So the alarm always rings',
      description: 'Grant permission for Auto start in background',
      benefitTitle: 'Reliability guarantee',
      benefit:
        'Ensures your alarms ring even when the app is closed or in battery saver mode. Critical for 24/7 functionality.',
    },

    complete: {
      title: 'All set! 🎉',
      description: 'Your permissions are configured. Your alarm will work perfectly.',
      feature1: 'Alarm opens automatically on lock screen',
      feature2: 'Works even with app closed or battery saver enabled',
    },

    buttons: {
      getStarted: 'Get Started',
      openSettings: 'Open Settings',
      skipForNow: 'Not now',
      done: 'Done',
    },

    accessibility: {
      close: 'Close',
      closeHint: 'Close permissions modal',
      nextHint: 'Proceed to next step',
      skipLabel: 'Skip for now',
      skipHint: 'Skip permissions setup',
      loading: 'Loading...',
    },

    illustration: {
      autoStart: 'Auto Start',
      displayOver: 'Display Over',
      statusPending: 'Status: Pending',
    },
  },
};
