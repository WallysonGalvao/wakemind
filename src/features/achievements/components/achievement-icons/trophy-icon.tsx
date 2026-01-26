import { Circle, Group, LinearGradient, Path, Shadow, Skia, vec } from '@shopify/react-native-skia';

import type { IconColors } from './types';

interface TrophyIconProps {
  cx: number;
  cy: number;
  r: number;
  colors: IconColors;
}

export function TrophyIcon({ cx, cy, r, colors }: TrophyIconProps) {
  const trophyPath = Skia.Path.Make();
  // Trophy cup
  trophyPath.moveTo(cx - r * 0.6, cy - r * 0.3);
  trophyPath.lineTo(cx - r * 0.4, cy + r * 0.4);
  trophyPath.quadTo(cx - r * 0.4, cy + r * 0.6, cx, cy + r * 0.6);
  trophyPath.quadTo(cx + r * 0.4, cy + r * 0.6, cx + r * 0.4, cy + r * 0.4);
  trophyPath.lineTo(cx + r * 0.6, cy - r * 0.3);
  trophyPath.close();

  const leftHandle = Skia.Path.Make();
  leftHandle.moveTo(cx - r * 0.7, cy - r * 0.2);
  leftHandle.quadTo(cx - r * 0.9, cy, cx - r * 0.7, cy + r * 0.2);

  const rightHandle = Skia.Path.Make();
  rightHandle.moveTo(cx + r * 0.7, cy - r * 0.2);
  rightHandle.quadTo(cx + r * 0.9, cy, cx + r * 0.7, cy + r * 0.2);

  return (
    <Group>
      {/* Trophy cup with gradient and shadow */}
      <Path path={trophyPath}>
        <LinearGradient
          start={vec(cx - r * 0.6, cy - r * 0.3)}
          end={vec(cx + r * 0.6, cy + r * 0.6)}
          colors={[colors.start, colors.end]}
        />
        <Shadow dx={0} dy={4} blur={8} color={colors.shadow} />
      </Path>

      {/* Trophy handles */}
      <Path path={leftHandle} style="stroke" strokeWidth={r * 0.15} strokeCap="round">
        <LinearGradient
          start={vec(cx - r * 0.9, cy - r * 0.2)}
          end={vec(cx - r * 0.7, cy + r * 0.2)}
          colors={[colors.highlight, colors.start]}
        />
      </Path>
      <Path path={rightHandle} style="stroke" strokeWidth={r * 0.15} strokeCap="round">
        <LinearGradient
          start={vec(cx + r * 0.7, cy - r * 0.2)}
          end={vec(cx + r * 0.9, cy + r * 0.2)}
          colors={[colors.highlight, colors.start]}
        />
      </Path>

      {/* Shine effect */}
      <Circle cx={cx - r * 0.2} cy={cy} r={r * 0.15} color="white" opacity={0.5} />
    </Group>
  );
}
