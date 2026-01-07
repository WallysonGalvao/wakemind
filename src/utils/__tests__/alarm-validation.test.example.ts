// Example test file for alarm validation
// To use this, you need to set up a testing framework like Jest

import {
  isDuplicateTime,
  normalizeTime,
  sanitizeAlarmInput,
  validateAlarmInput,
  validatePeriod,
  validateTimeFormat,
} from '../alarm-validation';

import type { Alarm } from '@/types/alarm';
import { Period } from '@/types/alarm-enums';

describe('alarm-validation', () => {
  describe('validateTimeFormat', () => {
    it('should validate correct time formats', () => {
      expect(validateTimeFormat('05:30')).toBe(true);
      expect(validateTimeFormat('12:00')).toBe(true);
      expect(validateTimeFormat('1:45')).toBe(true);
      expect(validateTimeFormat('11:59')).toBe(true);
    });

    it('should reject invalid time formats', () => {
      expect(validateTimeFormat('5:5')).toBe(false);
      expect(validateTimeFormat('13:00')).toBe(false);
      expect(validateTimeFormat('25:00')).toBe(false);
      expect(validateTimeFormat('12:60')).toBe(false);
      expect(validateTimeFormat('abc')).toBe(false);
      expect(validateTimeFormat('')).toBe(false);
    });
  });

  describe('validatePeriod', () => {
    it('should validate correct periods', () => {
      expect(validatePeriod(Period.AM)).toBe(true);
      expect(validatePeriod(Period.PM)).toBe(true);
    });

    it('should reject invalid periods', () => {
      expect(validatePeriod('invalid' as Period)).toBe(false);
    });
  });

  describe('normalizeTime', () => {
    it('should normalize AM times correctly', () => {
      expect(normalizeTime('06:30', Period.AM)).toBe(6 * 60 + 30); // 390
      expect(normalizeTime('11:45', Period.AM)).toBe(11 * 60 + 45); // 705
    });

    it('should normalize PM times correctly', () => {
      expect(normalizeTime('06:30', Period.PM)).toBe(18 * 60 + 30); // 1110
      expect(normalizeTime('11:45', Period.PM)).toBe(23 * 60 + 45); // 1425
    });

    it('should handle 12 AM correctly (midnight)', () => {
      expect(normalizeTime('12:00', Period.AM)).toBe(0);
      expect(normalizeTime('12:30', Period.AM)).toBe(30);
    });

    it('should handle 12 PM correctly (noon)', () => {
      expect(normalizeTime('12:00', Period.PM)).toBe(12 * 60); // 720
      expect(normalizeTime('12:30', Period.PM)).toBe(12 * 60 + 30); // 750
    });
  });

  describe('isDuplicateTime', () => {
    const existingAlarms: Alarm[] = [
      {
        id: '1',
        time: '06:30',
        period: Period.AM,
        challenge: 'Math',
        challengeIcon: 'calculate',
        schedule: 'Daily',
        isEnabled: true,
      },
      {
        id: '2',
        time: '06:30',
        period: Period.PM,
        challenge: 'Math',
        challengeIcon: 'calculate',
        schedule: 'Daily',
        isEnabled: true,
      },
    ];

    it('should detect duplicate times', () => {
      expect(isDuplicateTime(existingAlarms, '06:30', Period.AM)).toBe(true);
      expect(isDuplicateTime(existingAlarms, '6:30', Period.AM)).toBe(true);
    });

    it('should not detect non-duplicate times', () => {
      expect(isDuplicateTime(existingAlarms, '07:30', Period.AM)).toBe(false);
      expect(isDuplicateTime(existingAlarms, '06:00', Period.AM)).toBe(false);
    });

    it('should exclude alarm when provided excludeId', () => {
      expect(isDuplicateTime(existingAlarms, '06:30', Period.AM, '1')).toBe(false);
      expect(isDuplicateTime(existingAlarms, '06:30', Period.PM, '2')).toBe(false);
    });

    it('should handle AM/PM correctly', () => {
      expect(isDuplicateTime(existingAlarms, '06:30', Period.AM)).toBe(true);
      expect(isDuplicateTime(existingAlarms, '06:30', Period.PM)).toBe(true);
    });
  });

  describe('sanitizeAlarmInput', () => {
    it('should trim whitespace from all string fields', () => {
      const input = {
        time: '  06:30  ',
        period: Period.AM,
        challenge: '  Math Challenge  ',
        challengeIcon: '  calculate  ',
        schedule: '  Daily  ',
      };

      const sanitized = sanitizeAlarmInput(input);

      expect(sanitized.time).toBe('06:30');
      expect(sanitized.challenge).toBe('Math Challenge');
      expect(sanitized.challengeIcon).toBe('calculate');
      expect(sanitized.schedule).toBe('Daily');
    });
  });

  describe('validateAlarmInput', () => {
    const validInput = {
      time: '06:30',
      period: Period.AM,
      challenge: 'Math Challenge',
      challengeIcon: 'calculate',
      schedule: 'Daily',
    };

    const existingAlarms: Alarm[] = [
      {
        id: '1',
        time: '07:00',
        period: Period.AM,
        challenge: 'Math',
        challengeIcon: 'calculate',
        schedule: 'Daily',
        isEnabled: true,
      },
    ];

    it('should validate correct input', () => {
      const result = validateAlarmInput(validInput, existingAlarms);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid time format', () => {
      const result = validateAlarmInput({ ...validInput, time: '25:00' }, existingAlarms);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid time format');
    });

    it('should reject invalid period', () => {
      const result = validateAlarmInput(
        { ...validInput, period: 'invalid' as Period },
        existingAlarms
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid period');
    });

    it('should reject duplicate times', () => {
      const result = validateAlarmInput(
        { ...validInput, time: '07:00', period: Period.AM },
        existingAlarms
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('already exists');
    });

    it('should reject empty challenge', () => {
      const result = validateAlarmInput({ ...validInput, challenge: '' }, existingAlarms);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Challenge type is required');
    });

    it('should reject empty challenge icon', () => {
      const result = validateAlarmInput({ ...validInput, challengeIcon: '' }, existingAlarms);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Challenge icon is required');
    });

    it('should reject empty schedule', () => {
      const result = validateAlarmInput({ ...validInput, schedule: '' }, existingAlarms);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Schedule is required');
    });

    it('should allow updating same alarm with excludeId', () => {
      const result = validateAlarmInput(
        { ...validInput, time: '07:00', period: Period.AM },
        existingAlarms,
        '1' // Exclude existing alarm
      );
      expect(result.isValid).toBe(true);
    });
  });
});
