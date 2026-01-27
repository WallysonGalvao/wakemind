import { Platform } from 'react-native';

// Módulo nativo só existe no Android
const ExpoAlarmActivityModule =
  Platform.OS === 'android' ? require('./src/ExpoAlarmActivityModule').default : null;

/**
 * Verifica se o app tem permissão para usar Full Screen Intent
 * No Android 14+, esta permissão precisa ser concedida pelo usuário
 */
export function canUseFullScreenIntent(): boolean {
  if (Platform.OS !== 'android' || !ExpoAlarmActivityModule) {
    return false;
  }
  return ExpoAlarmActivityModule.canUseFullScreenIntent();
}

/**
 * Abre as configurações do sistema para o usuário conceder permissão de Full Screen Intent
 * Necessário apenas no Android 14+
 */
export function requestFullScreenIntentPermission(): string {
  if (Platform.OS !== 'android' || !ExpoAlarmActivityModule) {
    return 'Not supported on this platform';
  }
  return ExpoAlarmActivityModule.requestFullScreenIntentPermission();
}

/**
 * Abre tela de alarme com deep link
 * Chamado quando Notifee dispara o alarme
 */
export function openAlarmScreen(
  alarmId: string,
  time: string,
  period: string,
  challenge: string,
  challengeIcon: string,
  type: string
): string {
  if (Platform.OS !== 'android' || !ExpoAlarmActivityModule) {
    return 'Not supported on this platform';
  }
  return ExpoAlarmActivityModule.openAlarmScreen(
    alarmId,
    time,
    period,
    challenge,
    challengeIcon,
    type
  );
}

export default ExpoAlarmActivityModule;
