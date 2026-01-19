import { useEffect, useRef, useState } from 'react';

import { useSharedValue, withTiming } from 'react-native-reanimated';

import { Text } from '@/components/ui/text';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
}

/**
 * AnimatedCounter Component
 * Displays a number that animates from 0 to the target value
 *
 * @param value - Target number to animate to
 * @param duration - Animation duration in milliseconds (default: 1000)
 * @param className - Optional Tailwind className for styling
 */
export function AnimatedCounter({ value, duration = 1000, className }: AnimatedCounterProps) {
  const counterValue = useSharedValue(0);
  const [displayCounter, setDisplayCounter] = useState(0);
  const isAnimatingRef = useRef(false);

  // Start animation when value changes
  useEffect(() => {
    isAnimatingRef.current = true;
    counterValue.value = withTiming(
      value,
      {
        duration,
      },
      (finished) => {
        // Stop animating when finished
        if (finished) {
          isAnimatingRef.current = false;
        }
      }
    );
  }, [value, duration, counterValue]);

  // Update display counter during animation at ~60fps
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAnimatingRef.current) {
        setDisplayCounter(value);
        return;
      }
      const current = Math.round(counterValue.value);
      setDisplayCounter(current);
    }, 16);

    return () => clearInterval(interval);
  }, [counterValue, value]);

  return <Text className={className}>{displayCounter}</Text>;
}
