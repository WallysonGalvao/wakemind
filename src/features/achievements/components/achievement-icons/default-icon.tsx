import { Circle, Group, LinearGradient, Shadow, vec } from '@shopify/react-native-skia';

import type { IconColors } from './types';

interface DefaultIconProps {
  cx: number;
  cy: number;
  r: number;
  colors: IconColors;
}

export function DefaultIcon({ cx, cy, r, colors }: DefaultIconProps) {
  return (
    <Group>
      <Circle cx={cx} cy={cy} r={r}>
        <LinearGradient
          start={vec(cx - r, cy - r)}
          end={vec(cx + r, cy + r)}
          colors={[colors.start, colors.end]}
        />
        <Shadow dx={0} dy={4} blur={8} color={colors.shadow} />
      </Circle>
      <Circle cx={cx - r * 0.2} cy={cy - r * 0.2} r={r * 0.2} color="white" opacity={0.3} />
    </Group>
  );
}
