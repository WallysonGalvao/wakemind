import { NativeModule, requireNativeModule } from 'expo';

import type { ExpoAlarmsModuleEvents } from './ExpoAlarms.types';

declare class ExpoAlarmsModule extends NativeModule<ExpoAlarmsModuleEvents> {
  getTheme: () => string;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoAlarmsModule>('ExpoAlarms');
