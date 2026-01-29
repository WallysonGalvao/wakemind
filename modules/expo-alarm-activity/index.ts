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

/**
 * Verifica se o dispositivo requer configuração manual de AutoStart
 * (Xiaomi, Huawei, Oppo, Vivo, Samsung)
 */
export function requiresManufacturerAutoStart(): boolean {
  if (Platform.OS !== 'android' || !ExpoAlarmActivityModule) {
    return false;
  }
  return ExpoAlarmActivityModule.requiresManufacturerAutoStart();
}

/**
 * Abre configurações de AutoStart específicas do fabricante
 * CRÍTICO para dispositivos com restrições de bateria
 */
export function openAutoStartSettings(): string {
  if (Platform.OS !== 'android' || !ExpoAlarmActivityModule) {
    return 'Not supported on this platform';
  }
  return ExpoAlarmActivityModule.openAutoStartSettings();
}

/**
 * Abre configurações de Battery Optimization
 */
export function openBatteryOptimizationSettings(): string {
  if (Platform.OS !== 'android' || !ExpoAlarmActivityModule) {
    return 'Not supported on this platform';
  }
  return ExpoAlarmActivityModule.openBatteryOptimizationSettings();
}

/**
 * Abre configurações de Display Over Other Apps (SYSTEM_ALERT_WINDOW)
 * Necessário para app abrir automaticamente quando alarme dispara
 */
export function openDisplayOverOtherAppsSettings(): string {
  if (Platform.OS !== 'android' || !ExpoAlarmActivityModule) {
    return 'Not supported on this platform';
  }
  return ExpoAlarmActivityModule.openDisplayOverOtherAppsSettings();
}

/**
 * Verifica se a permissão Display Over Other Apps está habilitada
 */
export function canDrawOverlays(): boolean {
  if (Platform.OS !== 'android' || !ExpoAlarmActivityModule) {
    return false;
  }
  return ExpoAlarmActivityModule.canDrawOverlays();
}

/**
 * Abre configurações gerais do app
 */
export function openAppSettings(): string {
  if (Platform.OS !== 'android' || !ExpoAlarmActivityModule) {
    return 'Not supported on this platform';
  }
  return ExpoAlarmActivityModule.openAppSettings();
}

// ==================== NATIVE ALARM MANAGER SCHEDULING ====================

/**
 * Agenda alarme usando AlarmManager nativo (máxima prioridade)
 * Substitui Notifee para alarmes críticos que precisam disparar mesmo com device em deep sleep
 *
 * @param alarmId ID único do alarme
 * @param triggerAtMillis Timestamp em milissegundos quando alarme deve disparar
 * @param alarmData Dados do alarme (time, period, challenge, challengeIcon, type)
 * @returns Mensagem de sucesso ou erro
 */
export function scheduleNativeAlarm(
  alarmId: string,
  triggerAtMillis: number,
  alarmData: {
    time: string;
    period: string;
    challenge: string;
    challengeIcon: string;
    type: string;
  }
): string {
  if (Platform.OS !== 'android' || !ExpoAlarmActivityModule) {
    return 'Not supported on this platform';
  }
  return ExpoAlarmActivityModule.scheduleNativeAlarm(
    alarmId,
    triggerAtMillis,
    alarmData.time,
    alarmData.period,
    alarmData.challenge,
    alarmData.challengeIcon,
    alarmData.type
  );
}

/**
 * Cancela alarme agendado no AlarmManager nativo
 *
 * @param alarmId ID único do alarme a ser cancelado
 * @returns Mensagem de sucesso ou erro
 */
export function cancelNativeAlarm(alarmId: string): string {
  if (Platform.OS !== 'android' || !ExpoAlarmActivityModule) {
    return 'Not supported on this platform';
  }
  return ExpoAlarmActivityModule.cancelNativeAlarm(alarmId);
}

/**
 * Verifica se app pode agendar alarmes exatos
 * No Android 12+, esta permissão precisa ser concedida pelo usuário
 */
export function canScheduleExactAlarms(): boolean {
  if (Platform.OS !== 'android' || !ExpoAlarmActivityModule) {
    return false;
  }
  return ExpoAlarmActivityModule.canScheduleExactAlarms();
}

/**
 * Abre as configurações do sistema para o usuário conceder permissão de alarmes exatos
 * Necessário apenas no Android 12+
 */
export function openExactAlarmSettings(): string {
  if (Platform.OS !== 'android' || !ExpoAlarmActivityModule) {
    return 'Not supported on this platform';
  }
  return ExpoAlarmActivityModule.openExactAlarmSettings();
}

/**
 * Para o Foreground Service do alarme
 * Deve ser chamado quando o usuário dismissar/completar o alarme
 *
 * @returns Mensagem de sucesso ou erro
 */
export function stopAlarmService(): string {
  if (Platform.OS !== 'android' || !ExpoAlarmActivityModule) {
    return 'Not supported on this platform';
  }
  return ExpoAlarmActivityModule.stopAlarmService();
}

export default ExpoAlarmActivityModule;
