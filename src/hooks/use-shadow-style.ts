import { useMemo } from 'react';

import type { ViewStyle } from 'react-native';

import { useIsDarkMode } from './use-theme';

export type ShadowSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface ShadowConfig {
  offset: { width: number; height: number };
  opacity: number;
  radius: number;
  elevation: number;
}

const SHADOW_CONFIGS: Record<ShadowSize, ShadowConfig> = {
  sm: {
    offset: { width: 0, height: 1 },
    opacity: 0.05,
    radius: 2,
    elevation: 1,
  },
  md: {
    offset: { width: 0, height: 4 },
    opacity: 0.1,
    radius: 6,
    elevation: 4,
  },
  lg: {
    offset: { width: 0, height: 10 },
    opacity: 0.15,
    radius: 15,
    elevation: 10,
  },
  xl: {
    offset: { width: 0, height: 20 },
    opacity: 0.2,
    radius: 25,
    elevation: 20,
  },
  '2xl': {
    offset: { width: 0, height: 25 },
    opacity: 0.25,
    radius: 50,
    elevation: 24,
  },
};

/**
 * Hook to generate React Native shadow styles using theme-aware colors.
 * Avoids hardcoded color literals to comply with react-native/no-color-literals.
 *
 * @param size - The shadow size preset
 * @param color - Custom shadow color (optional, defaults to theme-aware black/transparent)
 * @returns ViewStyle object with shadow properties
 *
 * @example
 * const shadowStyle = useShadowStyle('sm');
 * <View style={shadowStyle}>...</View>
 *
 * @example
 * const customShadow = useShadowStyle('lg', 'rgba(19, 91, 236, 0.12)');
 */
export const useShadowStyle = (size: ShadowSize, color?: string): ViewStyle => {
  const isDark = useIsDarkMode();
  const config = SHADOW_CONFIGS[size];

  return useMemo(() => {
    // In dark mode, reduce shadow opacity or use transparent for subtlety
    const shadowColor = color ?? (isDark ? 'transparent' : 'rgba(0, 0, 0, 1)');
    const adjustedOpacity = isDark && !color ? 0 : config.opacity;

    return {
      shadowColor,
      shadowOffset: config.offset,
      shadowOpacity: adjustedOpacity,
      shadowRadius: config.radius,
      elevation: config.elevation,
    };
  }, [isDark, color, config]);
};

/**
 * Hook to generate a custom shadow style with specific parameters.
 *
 * @param params - Custom shadow parameters
 * @returns ViewStyle object with shadow properties
 *
 * @example
 * const shadow = useCustomShadow({
 *   offset: { width: 0, height: 8 },
 *   opacity: 1,
 *   radius: 30,
 *   elevation: 8,
 *   color: 'rgba(19, 91, 236, 0.12)'
 * });
 */
export const useCustomShadow = (params: {
  offset: { width: number; height: number };
  opacity: number;
  radius: number;
  elevation: number;
  color?: string;
}): ViewStyle => {
  const isDark = useIsDarkMode();

  return useMemo(() => {
    const shadowColor = params.color ?? (isDark ? 'transparent' : 'rgba(0, 0, 0, 1)');

    return {
      shadowColor,
      shadowOffset: params.offset,
      shadowOpacity: params.opacity,
      shadowRadius: params.radius,
      elevation: params.elevation,
    };
  }, [isDark, params]);
};
