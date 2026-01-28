/**
 * Alarm Tones Configuration
 *
 * Each tone is a "neuro-strike" - a technically designed sound to trigger
 * effective cognitive awakening without being irritating.
 *
 * The tone defines the "sonic signature" that initiates the wake-up protocol.
 *
 * Sound files sourced from Mixkit (https://mixkit.co/free-sound-effects/alarm/)
 * Licensed under Mixkit License for free use.
 */

export interface AlarmTone {
  id: string;
  /** i18n key for the tone name (e.g., 'alarmTone.tone.neuro-strike-classic.name') */
  nameKey: string;
  /** i18n key for the category (e.g., 'alarmTone.tone.neuro-strike-classic.category') */
  categoryKey: string;
  /** i18n key for the description (e.g., 'alarmTone.tone.neuro-strike-classic.description') */
  descriptionKey: string;
  /** Relative path from assets/sounds/ */
  filename: string;
  /** Duration in seconds */
  duration: number;
  /** Waveform visualization pattern (9 values between 0-1) */
  waveformPattern: number[];
  /** Whether this tone requires premium subscription */
  isPremium?: boolean;
}

/**
 * Available alarm tones in the app.
 *
 * These are organized by cognitive activation style:
 * - Cortical Activation: Sharp frequencies for immediate prefrontal cortex activation
 * - Rhythmic Sync: Patterns that sync with brain wave cycles
 * - Progressive Wake: Gradual escalation for gentle but effective awakening
 * - Circadian Trigger: Natural patterns for biological awakening
 * - Emergency Protocol: High-urgency tones for heavy sleepers
 */
export const ALARM_TONES: AlarmTone[] = [
  {
    id: 'neuro-strike-classic',
    nameKey: 'alarmTone.tone.neuro-strike-classic.name',
    categoryKey: 'alarmTone.tone.neuro-strike-classic.category',
    descriptionKey: 'alarmTone.tone.neuro-strike-classic.description',
    filename: 'classic-alarm.mp3',
    duration: 5,
    waveformPattern: [0.6, 0.8, 0.6, 0.8, 0.6, 0.8, 0.6, 0.8, 0.6], // Uniform beep pattern
  },
  {
    id: 'digital-pulse',
    nameKey: 'alarmTone.tone.digital-pulse.name',
    categoryKey: 'alarmTone.tone.digital-pulse.category',
    descriptionKey: 'alarmTone.tone.digital-pulse.description',
    filename: 'digital-clock-buzzer.mp3',
    duration: 8,
    waveformPattern: [0.3, 0.9, 0.3, 0.9, 0.3, 0.9, 0.3, 0.9, 0.3], // Sharp digital pulses
  },
  {
    id: 'morning-protocol',
    nameKey: 'alarmTone.tone.morning-protocol.name',
    categoryKey: 'alarmTone.tone.morning-protocol.category',
    descriptionKey: 'alarmTone.tone.morning-protocol.description',
    filename: 'morning-clock-alarm.mp3',
    duration: 9,
    waveformPattern: [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0], // Gradual rise
  },
  {
    id: 'alert-surge',
    nameKey: 'alarmTone.tone.alert-surge.name',
    categoryKey: 'alarmTone.tone.alert-surge.category',
    descriptionKey: 'alarmTone.tone.alert-surge.description',
    filename: 'alert-alarm.mp3',
    duration: 6,
    waveformPattern: [0.9, 0.5, 1.0, 0.4, 0.9, 0.5, 1.0, 0.4, 0.9], // High-intensity spikes
  },
  {
    id: 'facility-breach',
    nameKey: 'alarmTone.tone.facility-breach.name',
    categoryKey: 'alarmTone.tone.facility-breach.category',
    descriptionKey: 'alarmTone.tone.facility-breach.description',
    filename: 'facility-alarm.mp3',
    duration: 2,
    waveformPattern: [1.0, 0.8, 1.0, 0.8, 1.0, 0.8, 1.0, 0.8, 1.0], // Constant high alert
  },
  {
    id: 'retro-gamma',
    nameKey: 'alarmTone.tone.retro-gamma.name',
    categoryKey: 'alarmTone.tone.retro-gamma.category',
    descriptionKey: 'alarmTone.tone.retro-gamma.description',
    filename: 'retro-game-alarm.mp3',
    duration: 25,
    waveformPattern: [0.5, 1.0, 0.3, 0.8, 0.5, 1.0, 0.3, 0.8, 0.5], // 8-bit game pattern
    isPremium: true,
  },
  {
    id: 'vintage-warning',
    nameKey: 'alarmTone.tone.vintage-warning.name',
    categoryKey: 'alarmTone.tone.vintage-warning.category',
    descriptionKey: 'alarmTone.tone.vintage-warning.description',
    filename: 'vintage-warning-alarm.mp3',
    duration: 8,
    waveformPattern: [0.3, 0.5, 0.7, 0.9, 0.7, 0.5, 0.3, 0.5, 0.7], // Sine wave pattern
  },
  {
    id: 'space-command',
    nameKey: 'alarmTone.tone.space-command.name',
    categoryKey: 'alarmTone.tone.space-command.category',
    descriptionKey: 'alarmTone.tone.space-command.description',
    filename: 'spaceship-alarm.mp3',
    duration: 25,
    waveformPattern: [0.4, 0.6, 0.9, 0.6, 0.4, 0.6, 0.9, 0.6, 0.4], // Spaceship pulse
    isPremium: true,
  },
  {
    id: 'critical-alert',
    nameKey: 'alarmTone.tone.critical-alert.name',
    categoryKey: 'alarmTone.tone.critical-alert.category',
    descriptionKey: 'alarmTone.tone.critical-alert.description',
    filename: 'critical-alarm.mp3',
    duration: 3,
    waveformPattern: [1.0, 0.2, 1.0, 0.2, 1.0, 0.2, 1.0, 0.2, 1.0], // Sharp critical spikes
  },
  {
    id: 'sci-fi-scanner',
    nameKey: 'alarmTone.tone.sci-fi-scanner.name',
    categoryKey: 'alarmTone.tone.sci-fi-scanner.category',
    descriptionKey: 'alarmTone.tone.sci-fi-scanner.description',
    filename: 'scanning-sci-fi-alarm.mp3',
    duration: 10,
    waveformPattern: [0.2, 0.4, 0.6, 0.8, 1.0, 0.8, 0.6, 0.4, 0.2], // Scanning sweep
    isPremium: true,
  },
  {
    id: 'hint-notification',
    nameKey: 'alarmTone.tone.hint-notification.name',
    categoryKey: 'alarmTone.tone.hint-notification.category',
    descriptionKey: 'alarmTone.tone.hint-notification.description',
    filename: 'hint-notification.mp3',
    duration: 1,
    waveformPattern: [0.3, 0.5, 0.7, 0.5, 0.3, 0.2, 0.2, 0.2, 0.2], // Gentle tap
  },
  {
    id: 'rooster-morning',
    nameKey: 'alarmTone.tone.rooster-morning.name',
    categoryKey: 'alarmTone.tone.rooster-morning.category',
    descriptionKey: 'alarmTone.tone.rooster-morning.description',
    filename: 'rooster-morning.mp3',
    duration: 4,
    waveformPattern: [0.3, 0.6, 0.9, 1.0, 0.8, 0.5, 0.3, 0.2, 0.1], // Rooster crow shape
  },
  {
    id: 'rooster-short',
    nameKey: 'alarmTone.tone.rooster-short.name',
    categoryKey: 'alarmTone.tone.rooster-short.category',
    descriptionKey: 'alarmTone.tone.rooster-short.description',
    filename: 'rooster-short.mp3',
    duration: 2,
    waveformPattern: [0.4, 0.8, 1.0, 0.7, 0.4, 0.2, 0.2, 0.2, 0.2], // Quick crow burst
  },
  {
    id: 'casino-payout',
    nameKey: 'alarmTone.tone.casino-payout.name',
    categoryKey: 'alarmTone.tone.casino-payout.category',
    descriptionKey: 'alarmTone.tone.casino-payout.description',
    filename: 'casino-payout.mp3',
    duration: 10,
    waveformPattern: [0.5, 0.7, 0.9, 0.7, 0.9, 0.7, 0.9, 0.7, 0.5], // Celebratory jingle
    isPremium: true,
  },
  {
    id: 'hall-alert',
    nameKey: 'alarmTone.tone.hall-alert.name',
    categoryKey: 'alarmTone.tone.hall-alert.category',
    descriptionKey: 'alarmTone.tone.hall-alert.description',
    filename: 'hall-alert.mp3',
    duration: 13,
    waveformPattern: [0.6, 0.5, 0.4, 0.5, 0.6, 0.5, 0.4, 0.5, 0.6], // Reverberating echo
    isPremium: true,
  },
];

/**
 * Audio source mapping for static requires.
 * React Native requires static paths, so we map each tone ID to its require.
 */
const AUDIO_SOURCES: Record<string, ReturnType<typeof require>> = {
  'neuro-strike-classic': require('@/../assets/sounds/classic-alarm.mp3'),
  'digital-pulse': require('@/../assets/sounds/digital-clock-buzzer.mp3'),
  'morning-protocol': require('@/../assets/sounds/morning-clock-alarm.mp3'),
  'alert-surge': require('@/../assets/sounds/alert-alarm.mp3'),
  'facility-breach': require('@/../assets/sounds/facility-alarm.mp3'),
  'retro-gamma': require('@/../assets/sounds/retro-game-alarm.mp3'),
  'vintage-warning': require('@/../assets/sounds/vintage-warning-alarm.mp3'),
  'space-command': require('@/../assets/sounds/spaceship-alarm.mp3'),
  'critical-alert': require('@/../assets/sounds/critical-alarm.mp3'),
  'sci-fi-scanner': require('@/../assets/sounds/scanning-sci-fi-alarm.mp3'),
  'hint-notification': require('@/../assets/sounds/hint-notification.mp3'),
  'rooster-morning': require('@/../assets/sounds/rooster-morning.mp3'),
  'rooster-short': require('@/../assets/sounds/rooster-short.mp3'),
  'casino-payout': require('@/../assets/sounds/casino-payout.mp3'),
  'hall-alert': require('@/../assets/sounds/hall-alert.mp3'),
};

/**
 * Get the audio source for a specific tone.
 * Returns a require() source compatible with expo-audio's AudioSource.
 */
export const getToneAudioSource = (toneId: string): number => {
  return (AUDIO_SOURCES[toneId] || AUDIO_SOURCES['neuro-strike-classic']) as number;
};

/**
 * Get the filename for a specific tone (for iOS notifications).
 * Returns the .mp3 filename without path.
 */
export const getToneFilename = (toneId: string): string => {
  const tone = ALARM_TONES.find((t) => t.id === toneId);
  return tone?.filename || 'classic-alarm.mp3';
};

/**
 * Default tone ID for new alarms
 */
export const DEFAULT_ALARM_TONE_ID = 'neuro-strike-classic';
