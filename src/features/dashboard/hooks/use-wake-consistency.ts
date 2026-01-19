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
export function useWakeConsistency(period: PeriodType): WakeConsistencyData {
  const { t } = useTranslation();
  const [data, setData] = useState<WakeConsistencyData>({
    targetTime: '06:00',
    averageTime: '00:00',
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
          startDate = now.subtract(6, 'day').startOf('day');
          days = 7;
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
        .where(gte(alarmCompletions.date, startDate.toISOString()));

      if (records.length === 0) {
        setData({
          targetTime: '06:00',
          averageTime: '00:00',
          variance: 0,
          period: periodText,
          chartData: Array(Math.min(days, 30)).fill(0),
        });
        return;
      }

      // Get the most common target time
      const targetTime = records[0]?.targetTime || '06:00';

      // Calculate average actual wake time
      const actualTimes = records.map((r) => dayjs(r.actualTime));
      const totalMinutes = actualTimes.reduce(
        (sum, time) => sum + time.hour() * 60 + time.minute(),
        0
      );
      const averageMinutes = actualTimes.length > 0 ? totalMinutes / actualTimes.length : 0;

      // Validate averageMinutes
      if (!Number.isFinite(averageMinutes) || averageMinutes < 0) {
        setData({
          targetTime: '06:00',
          averageTime: '00:00',
          variance: 0,
          period: periodText,
          chartData: Array(Math.min(days, 30)).fill(0),
        });
        return;
      }

      const avgHours = Math.floor(averageMinutes / 60);
      const avgMinutes = Math.round(averageMinutes % 60);
      const averageTime = `${avgHours.toString().padStart(2, '0')}:${avgMinutes.toString().padStart(2, '0')}`;

      // Calculate variance (difference from target in minutes)
      const [targetHour, targetMin] = targetTime.split(':').map(Number);
      const targetMinutes = targetHour * 60 + targetMin;
      const variance =
        Number.isFinite(averageMinutes) && Number.isFinite(targetMinutes)
          ? Math.round(averageMinutes - targetMinutes)
          : 0;

      // Generate chart data for the period
      const chartData: number[] = [];
      const dataPoints = Math.min(days, 30); // Maximum 30 data points

      for (let i = 0; i < dataPoints; i++) {
        const targetDate = startDate.add(i, 'day');
        const dayRecords = records.filter(
          (r) => dayjs(r.date).format('YYYY-MM-DD') === targetDate.format('YYYY-MM-DD')
        );

        if (dayRecords.length > 0) {
          // Calculate average variance for this day
          const dayVariances = dayRecords.map((r) => {
            const actualTime = dayjs(r.actualTime);
            const actualMinutes = actualTime.hour() * 60 + actualTime.minute();
            return actualMinutes - targetMinutes;
          });
          const dayAvgVariance = dayVariances.reduce((sum, v) => sum + v, 0) / dayVariances.length;

          // Ensure the value is finite and valid
          const validVariance = Number.isFinite(dayAvgVariance) ? Math.abs(dayAvgVariance) : 0;
          chartData.push(Math.min(validVariance, 180)); // Cap at 3 hours (180 minutes)
        } else {
          chartData.push(0);
        }
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
  }, [period, t]);

  return data;
}
