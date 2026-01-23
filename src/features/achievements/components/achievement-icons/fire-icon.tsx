import {
  Group,
  LinearGradient,
  Path,
  RadialGradient,
  Shadow,
  Skia,
  vec,
} from '@shopify/react-native-skia';

import type { AchievementTier } from '../../types/achievement.types';
import type { IconColors } from './types';

//
interface FireIconProps {
  cx: number;
  cy: number;
  r: number;
  colors: IconColors;
  tier: AchievementTier;
  isUnlocked: boolean;
}

export function FireIcon({ cx, cy, r, colors, tier, isUnlocked }: FireIconProps) {
  const flamePath = Skia.Path.Make();
  flamePath.moveTo(cx, cy + r * 0.6);
  flamePath.quadTo(cx - r * 0.5, cy + r * 0.2, cx - r * 0.3, cy - r * 0.2);
  flamePath.quadTo(cx - r * 0.4, cy - r * 0.6, cx, cy - r * 0.8);
  flamePath.quadTo(cx + r * 0.4, cy - r * 0.6, cx + r * 0.3, cy - r * 0.2);
  flamePath.quadTo(cx + r * 0.5, cy + r * 0.2, cx, cy + r * 0.6);
  flamePath.close();

  const innerFlamePath = Skia.Path.Make();
  innerFlamePath.moveTo(cx, cy + r * 0.3);
  innerFlamePath.quadTo(cx - r * 0.2, cy, cx - r * 0.1, cy - r * 0.3);
  innerFlamePath.quadTo(cx, cy - r * 0.5, cx + r * 0.1, cy - r * 0.3);
  innerFlamePath.quadTo(cx + r * 0.2, cy, cx, cy + r * 0.3);
  innerFlamePath.close();

  return (
    <Group>
      {/* Outer flame with glow */}
      <Path path={flamePath}>
        <LinearGradient
          start={vec(cx, cy - r * 0.8)}
          end={vec(cx, cy + r * 0.6)}
          colors={[colors.highlight, colors.end]}
        />
        <Shadow dx={0} dy={2} blur={12} color={colors.shadow} />
      </Path>

      {/* Inner flame */}
      <Path path={innerFlamePath}>
        <LinearGradient
          start={vec(cx, cy - r * 0.5)}
          end={vec(cx, cy + r * 0.3)}
          colors={[colors.start, colors.highlight]}
        />
      </Path>

      {/* Additional glow for unlocked state */}
      {isUnlocked && tier !== 'bronze' ? (
        <Path path={flamePath} opacity={0.3}>
          <RadialGradient c={vec(cx, cy)} r={r * 1.2} colors={[colors.start, 'transparent']} />
        </Path>
      ) : null}
    </Group>
  );
}
