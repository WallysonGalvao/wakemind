import {
  Group,
  LinearGradient,
  Path,
  RadialGradient,
  Shadow,
  Skia,
  vec,
} from '@shopify/react-native-skia';

import type { IconColors } from './types';

interface LightningIconProps {
  cx: number;
  cy: number;
  r: number;
  colors: IconColors;
}

export function LightningIcon({ cx, cy, r, colors }: LightningIconProps) {
  const boltPath = Skia.Path.Make();
  boltPath.moveTo(cx + r * 0.2, cy - r * 0.8);
  boltPath.lineTo(cx - r * 0.3, cy);
  boltPath.lineTo(cx + r * 0.1, cy);
  boltPath.lineTo(cx - r * 0.2, cy + r * 0.8);
  boltPath.lineTo(cx + r * 0.3, cy - r * 0.1);
  boltPath.lineTo(cx - r * 0.1, cy - r * 0.1);
  boltPath.close();

  return (
    <Group>
      {/* Glow layer */}
      <Path path={boltPath} opacity={0.4}>
        <RadialGradient c={vec(cx, cy)} r={r * 1.5} colors={[colors.start, 'transparent']} />
        <Shadow dx={0} dy={0} blur={16} color={colors.shadow} />
      </Path>

      {/* Main bolt */}
      <Path path={boltPath}>
        <LinearGradient
          start={vec(cx, cy - r * 0.8)}
          end={vec(cx, cy + r * 0.8)}
          colors={[colors.highlight, colors.end]}
        />
        <Shadow dx={0} dy={2} blur={8} color={colors.shadow} />
      </Path>

      {/* Inner highlight */}
      <Path path={boltPath} opacity={0.5}>
        <LinearGradient
          start={vec(cx + r * 0.1, cy - r * 0.6)}
          end={vec(cx - r * 0.1, cy + r * 0.6)}
          colors={['white', 'transparent']}
        />
      </Path>
    </Group>
  );
}
