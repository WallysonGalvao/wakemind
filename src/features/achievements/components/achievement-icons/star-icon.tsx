import { Circle, Group, LinearGradient, Path, Shadow, Skia, vec } from '@shopify/react-native-skia';

import type { AchievementTier } from '../../types/achievement.types';
import type { IconColors } from './types';

interface StarIconProps {
  cx: number;
  cy: number;
  r: number;
  colors: IconColors;
  tier: AchievementTier;
  isUnlocked: boolean;
}

export function StarIcon({ cx, cy, r, colors, tier, isUnlocked }: StarIconProps) {
  const starPath = Skia.Path.Make();
  starPath.moveTo(cx, cy - r * 0.9);
  starPath.lineTo(cx + r * 0.2, cy - r * 0.2);
  starPath.lineTo(cx + r * 0.9, cy - r * 0.2);
  starPath.lineTo(cx + r * 0.35, cy + r * 0.2);
  starPath.lineTo(cx + r * 0.55, cy + r * 0.9);
  starPath.lineTo(cx, cy + r * 0.4);
  starPath.lineTo(cx - r * 0.55, cy + r * 0.9);
  starPath.lineTo(cx - r * 0.35, cy + r * 0.2);
  starPath.lineTo(cx - r * 0.9, cy - r * 0.2);
  starPath.lineTo(cx - r * 0.2, cy - r * 0.2);
  starPath.close();

  const innerStarPath = Skia.Path.Make();
  innerStarPath.moveTo(cx, cy - r * 0.5);
  innerStarPath.lineTo(cx + r * 0.15, cy - r * 0.1);
  innerStarPath.lineTo(cx + r * 0.4, cy);
  innerStarPath.lineTo(cx, cy + r * 0.2);
  innerStarPath.lineTo(cx - r * 0.4, cy);
  innerStarPath.lineTo(cx - r * 0.15, cy - r * 0.1);
  innerStarPath.close();

  return (
    <Group>
      {/* Outer star with shadow */}
      <Path path={starPath}>
        <LinearGradient
          start={vec(cx, cy - r * 0.9)}
          end={vec(cx, cy + r * 0.9)}
          colors={[colors.start, colors.end]}
        />
        <Shadow dx={0} dy={4} blur={10} color={colors.shadow} />
      </Path>

      {/* Inner star highlight */}
      <Path path={innerStarPath}>
        <LinearGradient
          start={vec(cx, cy - r * 0.5)}
          end={vec(cx, cy + r * 0.2)}
          colors={[colors.highlight, colors.start]}
        />
      </Path>

      {/* Sparkle for platinum */}
      {tier === 'platinum' && isUnlocked ? (
        <>
          <Circle cx={cx - r * 0.3} cy={cy - r * 0.5} r={r * 0.08} color="white" opacity={0.9}>
            <Shadow dx={0} dy={0} blur={4} color="#3B82F6" />
          </Circle>
          <Circle cx={cx + r * 0.3} cy={cy + r * 0.3} r={r * 0.06} color="white" opacity={0.8}>
            <Shadow dx={0} dy={0} blur={3} color="#3B82F6" />
          </Circle>
        </>
      ) : null}
    </Group>
  );
}
