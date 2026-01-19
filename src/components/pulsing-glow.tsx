import { useEffect } from 'react';

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Circle, Defs, RadialGradient, Stop, Svg } from 'react-native-svg';

interface PulsingGlowProps {
  size?: number;
  color?: string;
  duration?: number;
  minScale?: number;
  maxScale?: number;
  minOpacity?: number;
  maxOpacity?: number;
  className?: string;
}

/**
 * PulsingGlow Component
 * Renders an animated radial gradient with pulse effect (scale + opacity)
 *
 * @param size - Size of the glow circle in pixels (default: 280)
 * @param color - Color for the gradient (default: '#135bec')
 * @param duration - Animation duration in milliseconds (default: 2000)
 * @param minScale - Minimum scale value (default: 1)
 * @param maxScale - Maximum scale value (default: 1.15)
 * @param minOpacity - Minimum opacity value (default: 0.75)
 * @param maxOpacity - Maximum opacity value (default: 1)
 * @param className - Optional Tailwind className for the container
 */
export function PulsingGlow({
  size = 280,
  color = '#135bec',
  duration = 2000,
  minScale = 1,
  maxScale = 1.15,
  minOpacity = 0.75,
  maxOpacity = 1,
  className,
}: PulsingGlowProps) {
  const scale = useSharedValue(minScale);
  const opacity = useSharedValue(minOpacity);

  useEffect(() => {
    // Pulse scale animation
    scale.value = withRepeat(
      withTiming(maxScale, { duration, easing: Easing.inOut(Easing.ease) }),
      -1, // infinite
      true // reverse
    );

    // Pulse opacity animation
    opacity.value = withRepeat(
      withTiming(maxOpacity, { duration, easing: Easing.inOut(Easing.ease) }),
      -1, // infinite
      true // reverse
    );
  }, [scale, opacity, duration, minScale, maxScale, minOpacity, maxOpacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle} className={className}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <RadialGradient
            id={`glowGradient-${color}`}
            cx="50%"
            cy="50%"
            rx="50%"
            ry="50%"
            fx="50%"
            fy="50%"
          >
            <Stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <Stop offset="40%" stopColor={color} stopOpacity="0.2" />
            <Stop offset="70%" stopColor={color} stopOpacity="0.08" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#glowGradient-${color})`} />
      </Svg>
    </Animated.View>
  );
}
