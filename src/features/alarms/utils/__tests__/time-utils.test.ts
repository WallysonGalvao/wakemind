/**
 * @file Time Utils Tests
 * @description Unit tests for time utility functions
 */

import {
  convert12to24,
  convert24to12,
  formatTime12h,
  formatTime24h,
  getPeriodFromHour,
  isValidTime,
  parseTimeString,
} from '../time-utils';

import { Period } from '@/types/alarm-enums';

describe('time-utils', () => {
  describe('formatTime24h', () => {
    it('should format single digit hours and minutes with leading zeros', () => {
      expect(formatTime24h(9, 5)).toBe('09:05');
    });

    it('should format double digit hours and minutes', () => {
      expect(formatTime24h(14, 30)).toBe('14:30');
    });

    it('should format midnight correctly', () => {
      expect(formatTime24h(0, 0)).toBe('00:00');
    });

    it('should format noon correctly', () => {
      expect(formatTime24h(12, 0)).toBe('12:00');
    });

    it('should format 23:59 correctly', () => {
      expect(formatTime24h(23, 59)).toBe('23:59');
    });
  });

  describe('formatTime12h', () => {
    it('should format morning hours correctly', () => {
      expect(formatTime12h(9, 30)).toBe('09:30 AM');
    });

    it('should format afternoon hours correctly', () => {
      expect(formatTime12h(14, 5)).toBe('02:05 PM');
    });

    it('should format midnight as 12:00 AM', () => {
      expect(formatTime12h(0, 0)).toBe('12:00 AM');
    });

    it('should format noon as 12:00 PM', () => {
      expect(formatTime12h(12, 0)).toBe('12:00 PM');
    });

    it('should format 11:59 AM correctly', () => {
      expect(formatTime12h(11, 59)).toBe('11:59 AM');
    });

    it('should format 23:59 as 11:59 PM', () => {
      expect(formatTime12h(23, 59)).toBe('11:59 PM');
    });
  });

  describe('getPeriodFromHour', () => {
    it('should return AM for hours 0-11', () => {
      expect(getPeriodFromHour(0)).toBe(Period.AM);
      expect(getPeriodFromHour(6)).toBe(Period.AM);
      expect(getPeriodFromHour(11)).toBe(Period.AM);
    });

    it('should return PM for hours 12-23', () => {
      expect(getPeriodFromHour(12)).toBe(Period.PM);
      expect(getPeriodFromHour(15)).toBe(Period.PM);
      expect(getPeriodFromHour(23)).toBe(Period.PM);
    });
  });

  describe('isValidTime', () => {
    it('should return true for valid time values', () => {
      expect(isValidTime(0, 0)).toBe(true);
      expect(isValidTime(12, 30)).toBe(true);
      expect(isValidTime(23, 59)).toBe(true);
    });

    it('should return false for invalid hours', () => {
      expect(isValidTime(-1, 0)).toBe(false);
      expect(isValidTime(24, 0)).toBe(false);
      expect(isValidTime(25, 0)).toBe(false);
    });

    it('should return false for invalid minutes', () => {
      expect(isValidTime(12, -1)).toBe(false);
      expect(isValidTime(12, 60)).toBe(false);
      expect(isValidTime(12, 99)).toBe(false);
    });

    it('should return false for non-integer values', () => {
      expect(isValidTime(12.5, 30)).toBe(false);
      expect(isValidTime(12, 30.5)).toBe(false);
    });

    it('should return false for NaN values', () => {
      expect(isValidTime(NaN, 30)).toBe(false);
      expect(isValidTime(12, NaN)).toBe(false);
    });
  });

  describe('parseTimeString', () => {
    it('should parse valid time strings', () => {
      expect(parseTimeString('09:30')).toEqual({ hour: 9, minute: 30 });
      expect(parseTimeString('14:05')).toEqual({ hour: 14, minute: 5 });
      expect(parseTimeString('00:00')).toEqual({ hour: 0, minute: 0 });
      expect(parseTimeString('23:59')).toEqual({ hour: 23, minute: 59 });
    });

    it('should return null for invalid format', () => {
      expect(parseTimeString('invalid')).toBeNull();
      expect(parseTimeString('9:30:00')).toBeNull();
      expect(parseTimeString('9-30')).toBeNull();
      expect(parseTimeString('')).toBeNull();
    });

    it('should return null for invalid hour values', () => {
      expect(parseTimeString('24:00')).toBeNull();
      expect(parseTimeString('-1:30')).toBeNull();
      expect(parseTimeString('25:00')).toBeNull();
    });

    it('should return null for invalid minute values', () => {
      expect(parseTimeString('12:60')).toBeNull();
      expect(parseTimeString('12:-1')).toBeNull();
      expect(parseTimeString('12:99')).toBeNull();
    });

    it('should return null for non-numeric values', () => {
      expect(parseTimeString('ab:cd')).toBeNull();
      expect(parseTimeString('12:cd')).toBeNull();
    });
  });

  describe('convert12to24', () => {
    it('should convert AM hours correctly', () => {
      expect(convert12to24(1, Period.AM)).toBe(1);
      expect(convert12to24(6, Period.AM)).toBe(6);
      expect(convert12to24(11, Period.AM)).toBe(11);
    });

    it('should convert 12 AM to 0', () => {
      expect(convert12to24(12, Period.AM)).toBe(0);
    });

    it('should convert PM hours correctly', () => {
      expect(convert12to24(1, Period.PM)).toBe(13);
      expect(convert12to24(6, Period.PM)).toBe(18);
      expect(convert12to24(11, Period.PM)).toBe(23);
    });

    it('should convert 12 PM to 12', () => {
      expect(convert12to24(12, Period.PM)).toBe(12);
    });
  });

  describe('convert24to12', () => {
    it('should convert early morning hours (1-11 AM)', () => {
      expect(convert24to12(1)).toEqual({ hour: 1, period: Period.AM });
      expect(convert24to12(6)).toEqual({ hour: 6, period: Period.AM });
      expect(convert24to12(11)).toEqual({ hour: 11, period: Period.AM });
    });

    it('should convert midnight (0) to 12 AM', () => {
      expect(convert24to12(0)).toEqual({ hour: 12, period: Period.AM });
    });

    it('should convert noon (12) to 12 PM', () => {
      expect(convert24to12(12)).toEqual({ hour: 12, period: Period.PM });
    });

    it('should convert afternoon hours (13-23 PM)', () => {
      expect(convert24to12(13)).toEqual({ hour: 1, period: Period.PM });
      expect(convert24to12(18)).toEqual({ hour: 6, period: Period.PM });
      expect(convert24to12(23)).toEqual({ hour: 11, period: Period.PM });
    });
  });

  describe('round-trip conversion', () => {
    it('should maintain values through 24h->12h->24h conversion', () => {
      for (let hour = 0; hour < 24; hour++) {
        const { hour: hour12, period } = convert24to12(hour);
        const hour24Again = convert12to24(hour12, period);
        expect(hour24Again).toBe(hour);
      }
    });

    it('should maintain values through 12h->24h->12h conversion', () => {
      const testCases = [
        { hour: 1, period: Period.AM },
        { hour: 12, period: Period.AM },
        { hour: 6, period: Period.AM },
        { hour: 1, period: Period.PM },
        { hour: 12, period: Period.PM },
        { hour: 6, period: Period.PM },
      ];

      testCases.forEach(({ hour, period }) => {
        const hour24 = convert12to24(hour, period);
        const result = convert24to12(hour24);
        expect(result.hour).toBe(hour);
        expect(result.period).toBe(period);
      });
    });
  });
});
