import { useEffect, useState } from 'react';

import dayjs from 'dayjs';
import { gte } from 'drizzle-orm';
import { useTranslation } from 'react-i18next';

import { db } from '@/db';
import { alarmCompletions } from '@/db/schema';
import type { PeriodType } from '@/features/dashboard/types';

interface WakeConsistencyData {
  targetTime: string;
  averageTime: string;
  variance: number;
  period: string;
  chartData: number[];
}

/**
 * Custom hook to calculate wake consistency based on alarm completions
 */
export function useWakeConsistency(period: PeriodType, refreshKey?: number): WakeConsistencyData {
  const { t } = useTranslation();
  const [data, setData] = useState<WakeConsistencyData>({
    targetTime: '--:--',
    averageTime: '--:--',
    variance: 0,
    period: 'Last 30 Days',
    chartData: [],
  });

  useEffect(() => {
    const calculateConsistency = async () => {
      const now = dayjs();
      let startDate: dayjs.Dayjs;
      let days: number;
      let periodText: string;

      // Define period ranges
      switch (period) {
        case 'day':
          startDate = now.startOf('day');
          days = 1;
          periodText = t('dashboard.wakeConsistency.period.day');
          break;
        case 'week':
          startDate = now.subtract(6, 'day').startOf('day');
          days = 7;
          periodText = t('dashboard.wakeConsistency.period.week');
          break;
        case 'month':
          startDate = now.subtract(29, 'day').startOf('day');
          days = 30;
          periodText = t('dashboard.wakeConsistency.period.month');
          break;
        case 'custom':
          startDate = now.subtract(13, 'day').startOf('day');
          days = 14;
          periodText = t('dashboard.wakeConsistency.period.custom');
          break;
        default:
          startDate = now.startOf('day');
          days = 1;
          periodText = t('dashboard.wakeConsistency.period.day');
      }

      // Fetch records for the period
      const records = await db
        .select()
        .from(alarmCompletions)
        .where(gte(alarmCompletions.date, startDate.format('YYYY-MM-DD')));

      // Debug log for first-time users
      if (__DEV__ && records.length > 0) {
        console.log('[WakeConsistency] Records found:', records.length);
        console.log('[WakeConsistency] Sample record:', {
          targetTime: records[0].targetTime,
          actualTime: records[0].actualTime,
          date: records[0].date,
        });
      }

      if (records.length === 0) {
        setData({
          targetTime: '--:--',
          averageTime: '--:--',
          variance: 0,
          period: periodText,
          chartData: Array(Math.min(days, 30)).fill(0),
        });
        return;
      }

      // Get the most common target time
      // targetTime is stored in HH:mm format (e.g., "06:30")
      const firstTarget = records[0]?.targetTime;
      if (!firstTarget) {
        setData({
          targetTime: '--:--',
          averageTime: '--:--',
          variance: 0,
          period: periodText,
          chartData: Array(Math.min(days, 30)).fill(0),
        });
        return;
      }

      // targetTime is already in HH:mm format, just validate it
      const targetTime = firstTarget.includes(':') ? firstTarget : '--:--';

      // Calculate average actual wake time
      // actualTime is stored as ISO string
      const actualTimes = records
        .map((r) => {
          const parsed = dayjs(r.actualTime);
          if (__DEV__) {
            console.log('[WakeConsistency Hook] Parsing actualTime:', {
              raw: r.actualTime,
              parsed: parsed.format('YYYY-MM-DD HH:mm:ss'),
              hour: parsed.hour(),
              minute: parsed.minute(),
              totalMinutes: parsed.hour() * 60 + parsed.minute(),
            });
          }
          return parsed.isValid() ? parsed : null;
        })
        .filter((time): time is dayjs.Dayjs => time !== null);

      if (actualTimes.length === 0) {
        setData({
          targetTime: targetTime,
          averageTime: '--:--',
          variance: 0,
          period: periodText,
          chartData: Array(Math.min(days, 30)).fill(0),
        });
        return;
      }

      // Calculate total minutes (only hour and minute components, ignore date)
      const totalMinutes = actualTimes.reduce(
        (sum, time) => sum + time.hour() * 60 + time.minute(),
        0
      );
      const averageMinutes = actualTimes.length > 0 ? totalMinutes / actualTimes.length : 0;

      // Validate averageMinutes
      if (!Number.isFinite(averageMinutes) || averageMinutes < 0) {
        setData({
          targetTime: '--:--',
          averageTime: '--:--',
          variance: 0,
          period: periodText,
          chartData: Array(Math.min(days, 30)).fill(0),
        });
        return;
      }

      const avgHours = Math.floor(averageMinutes / 60);
      const avgMinutes = Math.round(averageMinutes % 60);
      const averageTime = `${avgHours.toString().padStart(2, '0')}:${avgMinutes.toString().padStart(2, '0')}`;

      if (__DEV__) {
        console.log('[WakeConsistency Hook] Calculated averageTime:', {
          averageMinutes,
          avgHours,
          avgMinutes,
          averageTime,
        });
      }

      // Calculate variance (difference from target in minutes)
      const [targetHour = 6, targetMin = 0] = targetTime.split(':').map(Number);
      const targetMinutes = targetHour * 60 + targetMin;
      const variance =
        Number.isFinite(averageMinutes) && Number.isFinite(targetMinutes)
          ? Math.round(averageMinutes - targetMinutes)
          : 0;

      if (__DEV__) {
        console.log('[WakeConsistency Hook] Variance calculation:', {
          targetTime,
          targetHour,
          targetMin,
          targetMinutes,
          averageMinutes,
          rawVariance: averageMinutes - targetMinutes,
          variance,
        });
      }

      // Generate chart data for the period
      const chartData: number[] = [];
      const dataPoints = Math.min(days, 30); // Maximum 30 data points

      for (let i = 0; i < dataPoints; i++) {
        const targetDate = startDate.add(i, 'day');
        const dayRecords = records.filter((r) => {
          const recordDate = dayjs(r.date);
          return (
            recordDate.isValid() &&
            recordDate.format('YYYY-MM-DD') === targetDate.format('YYYY-MM-DD')
          );
        });

        if (dayRecords.length > 0) {
          // Calculate average variance for this day (only using time components)
          const dayVariances = dayRecords
            .map((r) => {
              const actualTime = dayjs(r.actualTime);
              if (!actualTime.isValid()) return null;
              const actualMinutes = actualTime.hour() * 60 + actualTime.minute();
              return actualMinutes - targetMinutes;
            })
            .filter((v): v is number => v !== null);

          if (dayVariances.length > 0) {
            const dayAvgVariance =
              dayVariances.reduce((sum, v) => sum + v, 0) / dayVariances.length;
            const validVariance = Number.isFinite(dayAvgVariance) ? Math.abs(dayAvgVariance) : 0;
            chartData.push(Math.min(validVariance, 180)); // Cap at 3 hours (180 minutes)
          } else {
            chartData.push(0);
          }
        } else {
          chartData.push(0);
        }
      }

      if (__DEV__) {
        console.log('[WakeConsistency Hook] Final data:', {
          targetTime,
          averageTime,
          variance,
          chartDataLength: chartData.length,
          chartData: chartData.slice(0, 5),
        });
      }

      setData({
        targetTime,
        averageTime,
        variance,
        period: periodText,
        chartData,
      });
    };

    calculateConsistency();
  }, [period, t, refreshKey]);

  return data;
}
