import { Circle, Group, Path, RadialGradient, Shadow, Skia, vec } from '@shopify/react-native-skia';

import type { IconColors } from './types';

interface SunIconProps {
  cx: number;
  cy: number;
  r: number;
  colors: IconColors;
}

export function SunIcon({ cx, cy, r, colors }: SunIconProps) {
  return (
    <Group>
      {/* Sun rays */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = cx + Math.cos(rad) * r * 0.6;
        const y1 = cy + Math.sin(rad) * r * 0.6;
        const x2 = cx + Math.cos(rad) * r * 0.9;
        const y2 = cy + Math.sin(rad) * r * 0.9;

        const rayPath = Skia.Path.Make();
        rayPath.moveTo(x1, y1);
        rayPath.lineTo(x2, y2);

        return (
          <Path
            key={angle}
            path={rayPath}
            style="stroke"
            strokeWidth={r * 0.12}
            strokeCap="round"
            color={colors.start}
            opacity={0.8}
          />
        );
      })}

      {/* Sun circle with radial gradient */}
      <Circle cx={cx} cy={cy} r={r * 0.45}>
        <RadialGradient
          c={vec(cx - r * 0.1, cy - r * 0.1)}
          r={r * 0.6}
          colors={[colors.highlight, colors.start, colors.end]}
        />
        <Shadow dx={0} dy={4} blur={12} color={colors.shadow} />
      </Circle>

      {/* Shine effect */}
      <Circle cx={cx - r * 0.15} cy={cy - r * 0.15} r={r * 0.15} color="white" opacity={0.6} />
    </Group>
  );
}
