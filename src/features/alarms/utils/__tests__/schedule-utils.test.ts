/**
 * @file Schedule Utils Tests
 * @description Unit tests for schedule utility functions
 */

import { DAY_GROUPS, SCHEDULE_PRESET } from '../../constants/alarm-constants';
import { DayOfWeek } from '../../types';
import {
  getCurrentDayOfWeek,
  getScheduleLabel,
  isFullWeekSchedule,
  isWeekdaysSchedule,
  isWeekendsSchedule,
  parseScheduleToDays,
} from '../schedule-utils';

describe('schedule-utils', () => {
  describe('getCurrentDayOfWeek', () => {
    it('should return a valid DayOfWeek enum value', () => {
      const currentDay = getCurrentDayOfWeek();
      expect(Object.values(DayOfWeek)).toContain(currentDay);
    });
  });

  describe('getScheduleLabel', () => {
    it('should return "Daily" for all days', () => {
      const result = getScheduleLabel(DAY_GROUPS.ALL);
      expect(result).toBe(SCHEDULE_PRESET.DAILY);
    });

    it('should return "Weekdays" for Monday to Friday', () => {
      const result = getScheduleLabel([...DAY_GROUPS.WEEKDAYS]);
      expect(result).toBe(SCHEDULE_PRESET.WEEKDAYS);
    });

    it('should return "Weekends" for Saturday and Sunday', () => {
      const result = getScheduleLabel([...DAY_GROUPS.WEEKENDS]);
      expect(result).toBe(SCHEDULE_PRESET.WEEKENDS);
    });

    it('should return single day abbreviation for one day', () => {
      const result = getScheduleLabel([DayOfWeek.MONDAY]);
      expect(result).toBe('Mon');
    });

    it('should return comma-separated abbreviations for custom selection', () => {
      const result = getScheduleLabel([DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY, DayOfWeek.FRIDAY]);
      expect(result).toBe('Mon, Wed, Fri');
    });

    it('should sort days correctly', () => {
      const result = getScheduleLabel([DayOfWeek.FRIDAY, DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY]);
      expect(result).toBe('Mon, Wed, Fri');
    });
  });

  describe('parseScheduleToDays', () => {
    it('should parse "Daily" to all days', () => {
      const result = parseScheduleToDays(SCHEDULE_PRESET.DAILY);
      expect(result).toEqual(DAY_GROUPS.ALL);
      expect(result).toHaveLength(7);
    });

    it('should parse "Weekdays" to Monday-Friday', () => {
      const result = parseScheduleToDays(SCHEDULE_PRESET.WEEKDAYS);
      expect(result).toEqual(DAY_GROUPS.WEEKDAYS);
      expect(result).toHaveLength(5);
    });

    it('should parse "Weekends" to Saturday-Sunday', () => {
      const result = parseScheduleToDays(SCHEDULE_PRESET.WEEKENDS);
      expect(result).toEqual(DAY_GROUPS.WEEKENDS);
      expect(result).toHaveLength(2);
    });

    it('should parse single day abbreviation', () => {
      const result = parseScheduleToDays('Mon');
      expect(result).toEqual([DayOfWeek.MONDAY]);
    });

    it('should parse comma-separated abbreviations', () => {
      const result = parseScheduleToDays('Mon, Wed, Fri');
      expect(result).toEqual([DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY, DayOfWeek.FRIDAY]);
    });

    it('should handle whitespace in abbreviations', () => {
      const result = parseScheduleToDays('Mon,  Wed  , Fri');
      expect(result).toEqual([DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY, DayOfWeek.FRIDAY]);
    });

    it('should return current day for invalid input', () => {
      const result = parseScheduleToDays('Invalid');
      expect(result).toHaveLength(1);
      expect(Object.values(DayOfWeek)).toContain(result[0]);
    });

    it('should return current day for empty string', () => {
      const result = parseScheduleToDays('');
      expect(result).toHaveLength(1);
      expect(Object.values(DayOfWeek)).toContain(result[0]);
    });
  });

  describe('isFullWeekSchedule', () => {
    it('should return true for all 7 days', () => {
      expect(isFullWeekSchedule(DAY_GROUPS.ALL)).toBe(true);
    });

    it('should return false for less than 7 days', () => {
      expect(isFullWeekSchedule([...DAY_GROUPS.WEEKDAYS])).toBe(false);
      expect(isFullWeekSchedule([DayOfWeek.MONDAY])).toBe(false);
    });
  });

  describe('isWeekdaysSchedule', () => {
    it('should return true for Monday to Friday only', () => {
      expect(isWeekdaysSchedule([...DAY_GROUPS.WEEKDAYS])).toBe(true);
    });

    it('should return false if weekends are included', () => {
      const mixedDays = [...DAY_GROUPS.WEEKDAYS, DayOfWeek.SATURDAY];
      expect(isWeekdaysSchedule(mixedDays)).toBe(false);
    });

    it('should return false for less than 5 days', () => {
      expect(isWeekdaysSchedule([DayOfWeek.MONDAY, DayOfWeek.TUESDAY])).toBe(false);
    });
  });

  describe('isWeekendsSchedule', () => {
    it('should return true for Saturday and Sunday only', () => {
      expect(isWeekendsSchedule([...DAY_GROUPS.WEEKENDS])).toBe(true);
    });

    it('should return false if weekdays are included', () => {
      const mixedDays = [...DAY_GROUPS.WEEKENDS, DayOfWeek.MONDAY];
      expect(isWeekendsSchedule(mixedDays)).toBe(false);
    });

    it('should return false for less than 2 days', () => {
      expect(isWeekendsSchedule([DayOfWeek.SATURDAY])).toBe(false);
    });
  });

  describe('round-trip conversion', () => {
    it('should maintain data through label->days->label conversion', () => {
      const testCases: DayOfWeek[][] = [
        [...DAY_GROUPS.ALL],
        [...DAY_GROUPS.WEEKDAYS],
        [...DAY_GROUPS.WEEKENDS],
        [DayOfWeek.MONDAY],
        [DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY, DayOfWeek.FRIDAY],
      ];

      testCases.forEach((days) => {
        const label = getScheduleLabel(days);
        const parsed = parseScheduleToDays(label);
        const labelAgain = getScheduleLabel(parsed);
        expect(labelAgain).toBe(label);
      });
    });
  });
});
