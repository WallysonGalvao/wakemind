import { NativeModule, registerWebModule } from 'expo';

import type { ChangeEventPayload } from './ExpoAlarmActivity.types';

type ExpoAlarmActivityModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
};

class ExpoAlarmActivityModule extends NativeModule<ExpoAlarmActivityModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(ExpoAlarmActivityModule, 'ExpoAlarmActivityModule');
