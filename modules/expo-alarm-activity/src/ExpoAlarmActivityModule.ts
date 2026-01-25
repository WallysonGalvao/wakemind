import { NativeModule, requireNativeModule } from 'expo';

import type { ExpoAlarmActivityModuleEvents } from './ExpoAlarmActivity.types';

declare class ExpoAlarmActivityModule extends NativeModule<ExpoAlarmActivityModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoAlarmActivityModule>('ExpoAlarmActivity');
