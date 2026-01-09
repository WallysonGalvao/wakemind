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
  name: string;
  category: string;
  description: string;
  /** Relative path from assets/sounds/ */
  filename: string;
  /** Duration in seconds */
  duration: number;
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
    name: 'Classic Alert',
    category: 'Cortical Activation',
    description: 'Traditional alarm clock beep pattern for reliable awakening',
    filename: 'classic-alarm.wav',
    duration: 5,
  },
  {
    id: 'digital-pulse',
    name: 'Digital Pulse',
    category: 'Rhythmic Sync',
    description: 'Digital clock buzzer with precise timing intervals',
    filename: 'digital-clock-buzzer.wav',
    duration: 8,
  },
  {
    id: 'morning-protocol',
    name: 'Morning Protocol',
    category: 'Circadian Trigger',
    description: 'Gentle morning clock alarm designed for natural wake cycles',
    filename: 'morning-clock-alarm.wav',
    duration: 9,
  },
  {
    id: 'alert-surge',
    name: 'Alert Surge',
    category: 'Emergency Protocol',
    description: 'High-priority alert alarm for guaranteed cognitive activation',
    filename: 'alert-alarm.wav',
    duration: 6,
  },
  {
    id: 'facility-breach',
    name: 'Facility Breach',
    category: 'Emergency Protocol',
    description: 'Security-grade alarm for maximum arousal response',
    filename: 'facility-alarm.wav',
    duration: 2,
  },
  {
    id: 'retro-gamma',
    name: 'Retro Gamma',
    category: 'Cortical Activation',
    description: 'Retro game-style emergency tones with nostalgic trigger response',
    filename: 'retro-game-alarm.wav',
    duration: 25,
  },
  {
    id: 'vintage-warning',
    name: 'Vintage Warning',
    category: 'Progressive Wake',
    description: 'Classic warning signal with gradual intensity buildup',
    filename: 'vintage-warning-alarm.wav',
    duration: 8,
  },
  {
    id: 'space-command',
    name: 'Space Command',
    category: 'Sci-Fi Protocol',
    description: 'Futuristic spaceship alarm for immersive awakening experience',
    filename: 'spaceship-alarm.wav',
    duration: 25,
  },
  {
    id: 'critical-alert',
    name: 'Critical Alert',
    category: 'Emergency Protocol',
    description: 'Short, intense burst designed for immediate cortical response',
    filename: 'critical-alarm.wav',
    duration: 3,
  },
  {
    id: 'sci-fi-scanner',
    name: 'Sci-Fi Scanner',
    category: 'Sci-Fi Protocol',
    description: 'Scanning frequency sweep for gradual alpha wave activation',
    filename: 'scanning-sci-fi-alarm.wav',
    duration: 10,
  },
];

/**
 * Audio source mapping for static requires.
 * React Native requires static paths, so we map each tone ID to its require.
 */
const AUDIO_SOURCES: Record<string, ReturnType<typeof require>> = {
  'neuro-strike-classic': require('@/../assets/sounds/alarm_sound.wav'),
  'digital-pulse': require('@/../assets/sounds/alarm_sound.wav'),
  'morning-protocol': require('@/../assets/sounds/alarm_sound.wav'),
  'alert-surge': require('@/../assets/sounds/alarm_sound.wav'),
  'facility-breach': require('@/../assets/sounds/alarm_sound.wav'),
  'retro-gamma': require('@/../assets/sounds/alarm_sound.wav'),
  'vintage-warning': require('@/../assets/sounds/alarm_sound.wav'),
  'space-command': require('@/../assets/sounds/alarm_sound.wav'),
  'critical-alert': require('@/../assets/sounds/alarm_sound.wav'),
  'sci-fi-scanner': require('@/../assets/sounds/alarm_sound.wav'),
  // TODO: Replace with actual sound files from Mixkit:
  // 'neuro-strike-classic': require('@/../assets/sounds/classic-alarm.wav'),
  // 'digital-pulse': require('@/../assets/sounds/digital-clock-buzzer.wav'),
  // 'morning-protocol': require('@/../assets/sounds/morning-clock-alarm.wav'),
  // 'alert-surge': require('@/../assets/sounds/alert-alarm.wav'),
  // 'facility-breach': require('@/../assets/sounds/facility-alarm.wav'),
  // 'retro-gamma': require('@/../assets/sounds/retro-game-alarm.wav'),
  // 'vintage-warning': require('@/../assets/sounds/vintage-warning-alarm.wav'),
  // 'space-command': require('@/../assets/sounds/spaceship-alarm.wav'),
  // 'critical-alert': require('@/../assets/sounds/critical-alarm.wav'),
  // 'sci-fi-scanner': require('@/../assets/sounds/scanning-sci-fi-alarm.wav'),
};

/**
 * Get the audio source for a specific tone.
 * Returns a require() source compatible with expo-av's AVPlaybackSource.
 */
export const getToneAudioSource = (toneId: string): number => {
  return (AUDIO_SOURCES[toneId] || AUDIO_SOURCES['neuro-strike-classic']) as number;
};

/**
 * Default tone ID for new alarms
 */
export const DEFAULT_ALARM_TONE_ID = 'neuro-strike-classic';
