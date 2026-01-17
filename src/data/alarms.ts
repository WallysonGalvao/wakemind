import type { Alarm } from '@/types/alarm';
import { Period } from '@/types/alarm-enums';

export const MOCK_ALARMS: Alarm[] = [
  {
    id: '1',
    time: '05:30',
    period: Period.AM,
    challenge: 'Math Challenge',
    challengeIcon: 'calculate',
    schedule: 'Daily',
    isEnabled: true,
  },
  {
    id: '2',
    time: '06:00',
    period: Period.AM,
    challenge: 'Memory Match',
    challengeIcon: 'psychology',
    schedule: 'Mon, Wed, Fri',
    isEnabled: true,
  },
  {
    id: '3',
    time: '07:15',
    period: Period.AM,
    challenge: 'Squats Challenge',
    challengeIcon: 'directions-run',
    schedule: 'Weekends',
    isEnabled: false,
  },
  {
    id: '4',
    time: '08:00',
    period: Period.AM,
    challenge: 'Barcode Scan',
    challengeIcon: 'qr-code-scanner',
    schedule: 'Once',
    isEnabled: false,
  },
];
