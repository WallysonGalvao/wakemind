import { NativeModule, requireNativeModule } from 'expo';

import type { ExpoAlarmActivityModuleEvents } from './ExpoAlarmActivity.types';

/**
 * Módulo nativo para gerenciar alarmes do Android com Full Screen Intent
 */
declare class ExpoAlarmActivityModule extends NativeModule<ExpoAlarmActivityModuleEvents> {
  /**
   * Verifica se o app tem permissão para usar Full Screen Intent
   * No Android 14+, requer permissão do usuário
   */
  canUseFullScreenIntent(): boolean;

  /**
   * Abre as configurações do sistema para conceder permissão de Full Screen Intent
   * Necessário apenas no Android 14+
   */
  requestFullScreenIntentPermission(): string;

  /**
   * Agenda um alarme de teste usando AlarmManager nativo
   * Dispara após 10 segundos e abre a tela do alarme mesmo com device bloqueado
   */
  testAlarmManagerFullScreen(): string;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoAlarmActivityModule>('ExpoAlarmActivity');
