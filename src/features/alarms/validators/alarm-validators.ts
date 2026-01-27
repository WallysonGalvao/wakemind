/**
 * @file Alarm Validators
 * @description Validation functions for alarm form data
 * @module features/alarms/validators
 */

import type { AlarmFormData } from '../schemas/alarm-form.schema';

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates alarm time values
 * @param hour - Hour value to validate
 * @param minute - Minute value to validate
 * @returns Validation result with error key if invalid
 * @example
 * validateAlarmTime(10, 30) // { valid: true }
 * validateAlarmTime(24, 0) // { valid: false, error: 'validation.alarm.invalidHour' }
 */
export const validateAlarmTime = (hour: number, minute: number): ValidationResult => {
  if (typeof hour !== 'number' || typeof minute !== 'number') {
    return { valid: false, error: 'validation.alarm.timeFormat' };
  }

  if (isNaN(hour) || isNaN(minute)) {
    return { valid: false, error: 'validation.alarm.timeFormat' };
  }

  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    return { valid: false, error: 'validation.alarm.invalidHour' };
  }

  if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
    return { valid: false, error: 'validation.alarm.invalidMinute' };
  }

  return { valid: true };
};

/**
 * Validates alarm creation permission (for free tier limits)
 * @param isEditMode - Whether we're editing an existing alarm
 * @param alarmsCount - Current number of alarms
 * @param canCreate - Whether user can create more alarms (from feature access)
 * @returns Validation result with error key if limit reached
 * @example
 * validateAlarmCreation(false, 3, true) // { valid: true }
 * validateAlarmCreation(false, 3, false) // { valid: false, error: 'featureGate.unlimitedAlarms' }
 */
export const validateAlarmCreation = (
  isEditMode: boolean,
  alarmsCount: number,
  canCreate: boolean
): ValidationResult => {
  if (!isEditMode && !canCreate) {
    return { valid: false, error: 'featureGate.unlimitedAlarms' };
  }
  return { valid: true };
};

/**
 * Validates difficulty level selection (for premium features)
 * @param difficulty - Selected difficulty level
 * @param canUseDifficulty - Whether user can use this difficulty (from feature access)
 * @returns Validation result with error key if not allowed
 * @example
 * validateDifficulty('easy', true) // { valid: true }
 * validateDifficulty('hard', false) // { valid: false, error: 'featureGate.hardDifficulty' }
 */
export const validateDifficulty = (
  difficulty: string,
  canUseDifficulty: boolean
): ValidationResult => {
  if (!canUseDifficulty) {
    return { valid: false, error: 'featureGate.hardDifficulty' };
  }
  return { valid: true };
};

/**
 * Validates selected days (at least one day must be selected)
 * @param days - Array of selected days
 * @returns Validation result with error key if no days selected
 * @example
 * validateSelectedDays([DayOfWeek.MONDAY]) // { valid: true }
 * validateSelectedDays([]) // { valid: false, error: 'validation.alarm.noDaysSelected' }
 */
export const validateSelectedDays = (days: unknown[]): ValidationResult => {
  if (!Array.isArray(days) || days.length === 0) {
    return { valid: false, error: 'validation.alarm.noDaysSelected' };
  }
  return { valid: true };
};

/**
 * Context for comprehensive alarm submission validation
 */
export interface AlarmSubmissionContext {
  isEditMode: boolean;
  alarmsCount: number;
  canUseDifficulty: (difficulty: string) => boolean;
  canCreateAlarm: (count: number) => boolean;
}

/**
 * Comprehensive validation for alarm submission
 * Runs all validations in sequence and returns first error found
 * @param data - Alarm form data to validate
 * @param context - Validation context with feature access info
 * @returns Validation result with specific error key
 * @example
 * const result = validateAlarmSubmission(formData, context);
 * if (!result.valid) {
 *   showError(t(result.error));
 * }
 */
export const validateAlarmSubmission = (
  data: AlarmFormData,
  context: AlarmSubmissionContext
): ValidationResult => {
  // 1. Validate time format
  const timeValidation = validateAlarmTime(data.hour, data.minute);
  if (!timeValidation.valid) {
    return timeValidation;
  }

  // 2. Validate selected days
  const daysValidation = validateSelectedDays(data.selectedDays);
  if (!daysValidation.valid) {
    return daysValidation;
  }

  // 3. Validate difficulty permission
  const difficultyValidation = validateDifficulty(
    data.difficulty,
    context.canUseDifficulty(data.difficulty)
  );
  if (!difficultyValidation.valid) {
    return difficultyValidation;
  }

  // 4. Validate alarm creation limit
  const creationValidation = validateAlarmCreation(
    context.isEditMode,
    context.alarmsCount,
    context.canCreateAlarm(context.alarmsCount)
  );
  if (!creationValidation.valid) {
    return creationValidation;
  }

  return { valid: true };
};
