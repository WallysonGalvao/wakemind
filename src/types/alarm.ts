import type { DifficultyLevel, Period } from './alarm-enums';

import type { BackupProtocol } from '@/features/alarms/components/backup-protocols-section';

export interface Alarm {
  id: string;
  time: string; // "05:30"
  period: Period;
  challenge: string; // "Math Challenge"
  challengeIcon: string; // Material icon name
  schedule: string; // "Daily", "Mon, Wed, Fri", etc.
  isEnabled: boolean;
  difficulty?: DifficultyLevel;
  protocols?: BackupProtocol[];
}
