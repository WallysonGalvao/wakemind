/**
 * Alarm Tones Configuration
 *
 * Each tone is a "neuro-strike" - a technically designed sound to trigger
 * effective cognitive awakening without being irritating.
 *
 * The tone defines the "sonic signature" that initiates the wake-up protocol.
 */

export interface AlarmTone {
  id: string;
  name: string;
  category: string;
  description: string;
  /** Relative path from assets/sounds/ */
  filename: string;
}

/**
 * Available alarm tones in the app.
 *
 * These are organized by cognitive activation style:
 * - Neuro-Strike: Sharp, precise frequencies for immediate cortical activation
 * - Pulse Activation: Rhythmic patterns that sync with brain wave cycles
 * - Cognitive Rise: Gradual frequency escalation for gentle but effective awakening
 * - Alpha Trigger: Frequencies designed to transition from delta/theta to alpha waves
 */
export const ALARM_TONES: AlarmTone[] = [
  {
    id: 'neuro-strike-alpha',
    name: 'Neuro-Strike Alpha',
    category: 'Cortical Activation',
    description: 'Sharp 40Hz gamma burst for immediate prefrontal cortex activation',
    filename: 'alarm_sound.wav',
  },
  {
    id: 'pulse-activation',
    name: 'Pulse Activation',
    category: 'Rhythmic Sync',
    description: 'Isochronic tones at 10Hz to sync with natural alpha rhythms',
    filename: 'alarm_sound.wav', // TODO: Add dedicated sound file
  },
  {
    id: 'cognitive-rise',
    name: 'Cognitive Rise',
    category: 'Progressive Wake',
    description: 'Frequency sweep from 4Hz to 14Hz for gradual arousal',
    filename: 'alarm_sound.wav', // TODO: Add dedicated sound file
  },
  {
    id: 'dawn-protocol',
    name: 'Dawn Protocol',
    category: 'Circadian Trigger',
    description: 'Simulates natural dawn frequency patterns for biological awakening',
    filename: 'alarm_sound.wav', // TODO: Add dedicated sound file
  },
  {
    id: 'theta-bridge',
    name: 'Theta Bridge',
    category: 'Sleep Transition',
    description: 'Designed to bridge theta (dream) to beta (alert) states smoothly',
    filename: 'alarm_sound.wav', // TODO: Add dedicated sound file
  },
];

/**
 * Get the full require path for a tone's audio file.
 * Note: In React Native, requires must be static, so we use a mapping approach.
 */
export const getToneAudioSource = (_toneId: string) => {
  // For now, all tones use the same file until we add more
  // TODO: Map toneId to specific audio files when available
  return require('@/../assets/sounds/alarm_sound.wav');
};

/**
 * Default tone ID for new alarms
 */
export const DEFAULT_ALARM_TONE_ID = 'neuro-strike-alpha';
