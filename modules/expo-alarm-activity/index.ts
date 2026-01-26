import ExpoAlarmActivityModule from './src/ExpoAlarmActivityModule';

/**
 * Verifica se o app tem permissão para usar Full Screen Intent
 * No Android 14+, esta permissão precisa ser concedida pelo usuário
 */
export function canUseFullScreenIntent(): boolean {
  return ExpoAlarmActivityModule.canUseFullScreenIntent();
}

/**
 * Abre as configurações do sistema para o usuário conceder permissão de Full Screen Intent
 * Necessário apenas no Android 14+
 */
export function requestFullScreenIntentPermission(): string {
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
