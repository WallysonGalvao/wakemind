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
  /** Waveform visualization pattern (9 values between 0-1) */
  waveformPattern: number[];
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
    waveformPattern: [0.6, 0.8, 0.6, 0.8, 0.6, 0.8, 0.6, 0.8, 0.6], // Uniform beep pattern
  },
  {
    id: 'digital-pulse',
    name: 'Digital Pulse',
    category: 'Rhythmic Sync',
    description: 'Digital clock buzzer with precise timing intervals',
    filename: 'digital-clock-buzzer.wav',
    duration: 8,
    waveformPattern: [0.3, 0.9, 0.3, 0.9, 0.3, 0.9, 0.3, 0.9, 0.3], // Sharp digital pulses
  },
  {
    id: 'morning-protocol',
    name: 'Morning Protocol',
    category: 'Circadian Trigger',
    description: 'Gentle morning clock alarm designed for natural wake cycles',
    filename: 'morning-clock-alarm.wav',
    duration: 9,
    waveformPattern: [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0], // Gradual rise
  },
  {
    id: 'alert-surge',
    name: 'Alert Surge',
    category: 'Emergency Protocol',
    description: 'High-priority alert alarm for guaranteed cognitive activation',
    filename: 'alert-alarm.wav',
    duration: 6,
    waveformPattern: [0.9, 0.5, 1.0, 0.4, 0.9, 0.5, 1.0, 0.4, 0.9], // High-intensity spikes
  },
  {
    id: 'facility-breach',
    name: 'Facility Breach',
    category: 'Emergency Protocol',
    description: 'Security-grade alarm for maximum arousal response',
    filename: 'facility-alarm.wav',
    duration: 2,
    waveformPattern: [1.0, 0.8, 1.0, 0.8, 1.0, 0.8, 1.0, 0.8, 1.0], // Constant high alert
  },
  {
    id: 'retro-gamma',
    name: 'Retro Gamma',
    category: 'Cortical Activation',
    description: 'Retro game-style emergency tones with nostalgic trigger response',
    filename: 'retro-game-alarm.wav',
    duration: 25,
    waveformPattern: [0.5, 1.0, 0.3, 0.8, 0.5, 1.0, 0.3, 0.8, 0.5], // 8-bit game pattern
  },
  {
    id: 'vintage-warning',
    name: 'Vintage Warning',
    category: 'Progressive Wake',
    description: 'Classic warning signal with gradual intensity buildup',
    filename: 'vintage-warning-alarm.wav',
    duration: 8,
    waveformPattern: [0.3, 0.5, 0.7, 0.9, 0.7, 0.5, 0.3, 0.5, 0.7], // Sine wave pattern
  },
  {
    id: 'space-command',
    name: 'Space Command',
    category: 'Sci-Fi Protocol',
    description: 'Futuristic spaceship alarm for immersive awakening experience',
    filename: 'spaceship-alarm.wav',
    duration: 25,
    waveformPattern: [0.4, 0.6, 0.9, 0.6, 0.4, 0.6, 0.9, 0.6, 0.4], // Spaceship pulse
  },
  {
    id: 'critical-alert',
    name: 'Critical Alert',
    category: 'Emergency Protocol',
    description: 'Short, intense burst designed for immediate cortical response',
    filename: 'critical-alarm.wav',
    duration: 3,
    waveformPattern: [1.0, 0.2, 1.0, 0.2, 1.0, 0.2, 1.0, 0.2, 1.0], // Sharp critical spikes
  },
  {
    id: 'sci-fi-scanner',
    name: 'Sci-Fi Scanner',
    category: 'Sci-Fi Protocol',
    description: 'Scanning frequency sweep for gradual alpha wave activation',
    filename: 'scanning-sci-fi-alarm.wav',
    duration: 10,
    waveformPattern: [0.2, 0.4, 0.6, 0.8, 1.0, 0.8, 0.6, 0.4, 0.2], // Scanning sweep
  },
  {
    id: 'hint-notification',
    name: 'Hint Notification',
    category: 'Progressive Wake',
    description: 'Gentle interface notification for light sleepers',
    filename: 'hint-notification.wav',
    duration: 1,
    waveformPattern: [0.3, 0.5, 0.7, 0.5, 0.3, 0.2, 0.2, 0.2, 0.2], // Gentle tap
  },
  {
    id: 'rooster-morning',
    name: 'Rooster Morning',
    category: 'Circadian Trigger',
    description: 'Natural rooster crowing for biological awakening',
    filename: 'rooster-morning.wav',
    duration: 4,
    waveformPattern: [0.3, 0.6, 0.9, 1.0, 0.8, 0.5, 0.3, 0.2, 0.1], // Rooster crow shape
  },
  {
    id: 'rooster-short',
    name: 'Rooster Short',
    category: 'Circadian Trigger',
    description: 'Quick rooster crow for instant natural alert',
    filename: 'rooster-short.wav',
    duration: 2,
    waveformPattern: [0.4, 0.8, 1.0, 0.7, 0.4, 0.2, 0.2, 0.2, 0.2], // Quick crow burst
  },
  {
    id: 'casino-payout',
    name: 'Casino Payout',
    category: 'Dopamine Trigger',
    description: 'Slot machine victory sound for reward-based awakening',
    filename: 'casino-payout.wav',
    duration: 10,
    waveformPattern: [0.5, 0.7, 0.9, 0.7, 0.9, 0.7, 0.9, 0.7, 0.5], // Celebratory jingle
  },
  {
    id: 'hall-alert',
    name: 'Hall Alert',
    category: 'Progressive Wake',
    description: 'Spacious hall alert for gradual environmental awakening',
    filename: 'hall-alert.wav',
    duration: 13,
    waveformPattern: [0.6, 0.5, 0.4, 0.5, 0.6, 0.5, 0.4, 0.5, 0.6], // Reverberating echo
  },
];

/**
 * Audio source mapping for static requires.
 * React Native requires static paths, so we map each tone ID to its require.
 */
const AUDIO_SOURCES: Record<string, ReturnType<typeof require>> = {
  'neuro-strike-classic': require('@/../assets/sounds/classic-alarm.wav'),
  'digital-pulse': require('@/../assets/sounds/digital-clock-buzzer.wav'),
  'morning-protocol': require('@/../assets/sounds/morning-clock-alarm.wav'),
  'alert-surge': require('@/../assets/sounds/alert-alarm.wav'),
  'facility-breach': require('@/../assets/sounds/facility-alarm.wav'),
  'retro-gamma': require('@/../assets/sounds/retro-game-alarm.wav'),
  'vintage-warning': require('@/../assets/sounds/vintage-warning-alarm.wav'),
  'space-command': require('@/../assets/sounds/spaceship-alarm.wav'),
  'critical-alert': require('@/../assets/sounds/critical-alarm.wav'),
  'sci-fi-scanner': require('@/../assets/sounds/scanning-sci-fi-alarm.wav'),
  'hint-notification': require('@/../assets/sounds/hint-notification.wav'),
  'rooster-morning': require('@/../assets/sounds/rooster-morning.wav'),
  'rooster-short': require('@/../assets/sounds/rooster-short.wav'),
  'casino-payout': require('@/../assets/sounds/casino-payout.wav'),
  'hall-alert': require('@/../assets/sounds/hall-alert.wav'),
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
