import * as React from 'react';

import { requireNativeView } from 'expo';

import type { ExpoAlarmActivityViewProps } from './ExpoAlarmActivity.types';

const NativeView: React.ComponentType<ExpoAlarmActivityViewProps> =
  requireNativeView('ExpoAlarmActivity');

export default function ExpoAlarmActivityView(props: ExpoAlarmActivityViewProps) {
  return <NativeView {...props} />;
}
