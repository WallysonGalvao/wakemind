import * as React from 'react';

import type { ExpoAlarmActivityViewProps } from './ExpoAlarmActivity.types';

export default function ExpoAlarmActivityView(props: ExpoAlarmActivityViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
