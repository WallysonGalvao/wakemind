/**
 * @file Alarm Validators Tests
 * @description Unit tests for alarm validation functions
 */

import type { AlarmFormData } from '../../schemas/alarm-form.schema';
import { DayOfWeek } from '../../types';
import {
  validateAlarmCreation,
  validateAlarmSubmission,
  validateAlarmTime,
  validateDifficulty,
  validateSelectedDays,
} from '../alarm-validators';

import { ChallengeType, DifficultyLevel } from '@/types/alarm-enums';

describe('alarm-validators', () => {
  describe('validateAlarmTime', () => {
    it('should validate correct time values', () => {
      expect(validateAlarmTime(0, 0)).toEqual({ valid: true });
      expect(validateAlarmTime(12, 30)).toEqual({ valid: true });
      expect(validateAlarmTime(23, 59)).toEqual({ valid: true });
    });

    it('should reject non-number types', () => {
      const result = validateAlarmTime('10' as unknown as number, 30);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('validation.alarm.timeFormat');
    });

    it('should reject NaN values', () => {
      expect(validateAlarmTime(NaN, 30)).toEqual({
        valid: false,
        error: 'validation.alarm.timeFormat',
      });
      expect(validateAlarmTime(10, NaN)).toEqual({
        valid: false,
        error: 'validation.alarm.timeFormat',
      });
    });

    it('should reject invalid hour values', () => {
      expect(validateAlarmTime(-1, 30)).toEqual({
        valid: false,
        error: 'validation.alarm.invalidHour',
      });
      expect(validateAlarmTime(24, 30)).toEqual({
        valid: false,
        error: 'validation.alarm.invalidHour',
      });
      expect(validateAlarmTime(25, 30)).toEqual({
        valid: false,
        error: 'validation.alarm.invalidHour',
      });
    });

    it('should reject invalid minute values', () => {
      expect(validateAlarmTime(10, -1)).toEqual({
        valid: false,
        error: 'validation.alarm.invalidMinute',
      });
      expect(validateAlarmTime(10, 60)).toEqual({
        valid: false,
        error: 'validation.alarm.invalidMinute',
      });
      expect(validateAlarmTime(10, 99)).toEqual({
        valid: false,
        error: 'validation.alarm.invalidMinute',
      });
    });

    it('should reject non-integer values', () => {
      expect(validateAlarmTime(10.5, 30)).toEqual({
        valid: false,
        error: 'validation.alarm.invalidHour',
      });
      expect(validateAlarmTime(10, 30.5)).toEqual({
        valid: false,
        error: 'validation.alarm.invalidMinute',
      });
    });
  });

  describe('validateAlarmCreation', () => {
    it('should allow creation in edit mode regardless of limit', () => {
      expect(validateAlarmCreation(true, 100, false)).toEqual({ valid: true });
    });

    it('should allow creation when user can create', () => {
      expect(validateAlarmCreation(false, 3, true)).toEqual({ valid: true });
    });

    it('should reject creation when limit is reached', () => {
      expect(validateAlarmCreation(false, 3, false)).toEqual({
        valid: false,
        error: 'featureGate.unlimitedAlarms',
      });
    });
  });

  describe('validateDifficulty', () => {
    it('should allow difficulty when user has permission', () => {
      expect(validateDifficulty('hard', true)).toEqual({ valid: true });
      expect(validateDifficulty('easy', true)).toEqual({ valid: true });
    });

    it('should reject difficulty when user lacks permission', () => {
      expect(validateDifficulty('hard', false)).toEqual({
        valid: false,
        error: 'featureGate.hardDifficulty',
      });
    });
  });

  describe('validateSelectedDays', () => {
    it('should validate array with days', () => {
      expect(validateSelectedDays([DayOfWeek.MONDAY])).toEqual({ valid: true });
      expect(validateSelectedDays([DayOfWeek.MONDAY, DayOfWeek.TUESDAY])).toEqual({ valid: true });
    });

    it('should reject empty array', () => {
      expect(validateSelectedDays([])).toEqual({
        valid: false,
        error: 'validation.alarm.noDaysSelected',
      });
    });

    it('should reject non-array values', () => {
      expect(validateSelectedDays(null as unknown as unknown[])).toEqual({
        valid: false,
        error: 'validation.alarm.noDaysSelected',
      });
      expect(validateSelectedDays(undefined as unknown as unknown[])).toEqual({
        valid: false,
        error: 'validation.alarm.noDaysSelected',
      });
    });
  });

  describe('validateAlarmSubmission', () => {
    const validFormData: AlarmFormData = {
      hour: 10,
      minute: 30,
      selectedDays: [DayOfWeek.MONDAY],
      challenge: ChallengeType.MATH,
      difficulty: DifficultyLevel.EASY,
      protocols: [],
    };

    const validContext = {
      isEditMode: false,
      alarmsCount: 1,
      canUseDifficulty: (_difficulty: string) => true,
      canCreateAlarm: (_count: number) => true,
    };

    it('should validate complete valid submission', () => {
      const result = validateAlarmSubmission(validFormData, validContext);
      expect(result.valid).toBe(true);
    });

    it('should fail on invalid time', () => {
      const invalidData = { ...validFormData, hour: 25 };
      const result = validateAlarmSubmission(invalidData, validContext);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('validation.alarm.invalidHour');
    });

    it('should fail on no days selected', () => {
      const invalidData = { ...validFormData, selectedDays: [] };
      const result = validateAlarmSubmission(invalidData, validContext);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('validation.alarm.noDaysSelected');
    });

    it('should fail on restricted difficulty', () => {
      const restrictedContext = {
        ...validContext,
        canUseDifficulty: () => false,
      };
      const result = validateAlarmSubmission(validFormData, restrictedContext);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('featureGate.hardDifficulty');
    });

    it('should fail on alarm creation limit', () => {
      const limitContext = {
        ...validContext,
        canCreateAlarm: () => false,
      };
      const result = validateAlarmSubmission(validFormData, limitContext);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('featureGate.unlimitedAlarms');
    });

    it('should allow creation in edit mode even at limit', () => {
      const editContext = {
        isEditMode: true,
        alarmsCount: 100,
        canUseDifficulty: () => true,
        canCreateAlarm: () => false, // Would fail if not in edit mode
      };
      const result = validateAlarmSubmission(validFormData, editContext);
      expect(result.valid).toBe(true);
    });

    it('should return first error encountered', () => {
      const multipleErrors: AlarmFormData = {
        hour: 25, // Invalid hour
        minute: 30,
        selectedDays: [], // No days
        challenge: ChallengeType.MATH,
        difficulty: DifficultyLevel.HARD,
        protocols: [],
      };
      const result = validateAlarmSubmission(multipleErrors, validContext);
      // Should fail on time first
      expect(result.valid).toBe(false);
      expect(result.error).toBe('validation.alarm.invalidHour');
    });
  });
});
