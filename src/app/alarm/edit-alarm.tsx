import { useLocalSearchParams } from 'expo-router';

import AlarmFormScreen from '@/features/alarms/screens/alarm-form';

export default function EditAlarmScreenPage() {
  const { alarmId } = useLocalSearchParams<{ alarmId: string }>();

  return <AlarmFormScreen alarmId={alarmId} />;
}
