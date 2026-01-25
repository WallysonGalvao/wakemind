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
 * Função simples para testar a AlarmActivity
 * Abre a AlarmActivity imediatamente (útil para debug)
 */
export function testOpenActivity(): void {
  ExpoAlarmActivityModule.testOpenActivity();
}

/**
 * Agenda um alarme REAL usando AlarmManager nativo
 * Dispara após 10 segundos e abre a AlarmActivity mesmo com tela bloqueada
 * Use para testar se Full Screen Intent funciona
 */
export function testAlarmManagerFullScreen(): string {
  return ExpoAlarmActivityModule.testAlarmManagerFullScreen();
}

export default ExpoAlarmActivityModule;
