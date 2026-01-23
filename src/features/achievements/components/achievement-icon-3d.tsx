/**
 * 3D Achievement Icon Component
 * Renders tier-specific 3D icons with gradients and shadows
 */

import { useMemo } from 'react';

import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Stop } from 'react-native-svg';

import { View } from 'react-native';

import type { AchievementTier } from '../types/achievement.types';

interface AchievementIcon3DProps {
  iconName: string;
  tier: AchievementTier;
  isUnlocked: boolean;
  size?: number;
}

export function AchievementIcon3D({
  iconName,
  tier,
  isUnlocked,
  size = 48,
}: AchievementIcon3DProps) {
  // Tier-specific gradients
  const gradients = useMemo(() => {
    if (!isUnlocked) {
      return {
        primary: { start: '#94A3B8', end: '#64748B' },
        secondary: { start: '#CBD5E1', end: '#94A3B8' },
        accent: '#475569',
      };
    }

    switch (tier) {
      case 'bronze':
        return {
          primary: { start: '#D4A574', end: '#8B5A2B' },
          secondary: { start: '#E6B88A', end: '#CD7F32' },
          accent: '#6B4423',
        };
      case 'silver':
        return {
          primary: { start: '#D4D4D4', end: '#A0A0A0' },
          secondary: { start: '#E8E8E8', end: '#C0C0C0' },
          accent: '#808080',
        };
      case 'gold':
        return {
          primary: { start: '#FFD700', end: '#DAA520' },
          secondary: { start: '#FFF4CC', end: '#FFD700' },
          accent: '#B8860B',
        };
      case 'platinum':
        return {
          primary: { start: '#E0F2FE', end: '#BAE6FD' },
          secondary: { start: '#F0F9FF', end: '#E0F2FE' },
          accent: '#3B82F6',
        };
      default:
        return {
          primary: { start: '#94A3B8', end: '#64748B' },
          secondary: { start: '#CBD5E1', end: '#94A3B8' },
          accent: '#475569',
        };
    }
  }, [tier, isUnlocked]);

  // Icon renderer based on name
  const renderIcon = () => {
    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.35;

    switch (iconName) {
      // Trophy icon (for progression achievements)
      case 'emoji_events':
      case 'trophy':
        return (
          <G>
            {/* Trophy base */}
            <Ellipse
              cx={cx}
              cy={cy + r * 0.9}
              rx={r * 0.5}
              ry={r * 0.2}
              fill={gradients.accent}
              opacity={0.3}
            />
            {/* Trophy cup */}
            <Path
              d={`
                M ${cx - r * 0.6} ${cy - r * 0.3}
                L ${cx - r * 0.4} ${cy + r * 0.4}
                Q ${cx - r * 0.4} ${cy + r * 0.6} ${cx} ${cy + r * 0.6}
                Q ${cx + r * 0.4} ${cy + r * 0.6} ${cx + r * 0.4} ${cy + r * 0.4}
                L ${cx + r * 0.6} ${cy - r * 0.3}
                Z
              `}
              fill="url(#primaryGradient)"
            />
            {/* Trophy handles */}
            <Path
              d={`M ${cx - r * 0.7} ${cy - r * 0.2} Q ${cx - r * 0.9} ${cy} ${cx - r * 0.7} ${cy + r * 0.2}`}
              stroke="url(#secondaryGradient)"
              strokeWidth={r * 0.15}
              fill="none"
            />
            <Path
              d={`M ${cx + r * 0.7} ${cy - r * 0.2} Q ${cx + r * 0.9} ${cy} ${cx + r * 0.7} ${cy + r * 0.2}`}
              stroke="url(#secondaryGradient)"
              strokeWidth={r * 0.15}
              fill="none"
            />
            {/* Shine effect */}
            <Ellipse
              cx={cx - r * 0.2}
              cy={cy}
              rx={r * 0.15}
              ry={r * 0.25}
              fill="#FFFFFF"
              opacity={0.4}
            />
          </G>
        );

      // Fire icon (for streak achievements)
      case 'local_fire_department':
      case 'whatshot':
      case 'flare':
        return (
          <G>
            {/* Flame shape */}
            <Path
              d={`
                M ${cx} ${cy + r * 0.6}
                Q ${cx - r * 0.5} ${cy + r * 0.2} ${cx - r * 0.3} ${cy - r * 0.2}
                Q ${cx - r * 0.4} ${cy - r * 0.6} ${cx} ${cy - r * 0.8}
                Q ${cx + r * 0.4} ${cy - r * 0.6} ${cx + r * 0.3} ${cy - r * 0.2}
                Q ${cx + r * 0.5} ${cy + r * 0.2} ${cx} ${cy + r * 0.6}
                Z
              `}
              fill="url(#primaryGradient)"
            />
            {/* Inner flame */}
            <Path
              d={`
                M ${cx} ${cy + r * 0.3}
                Q ${cx - r * 0.2} ${cy} ${cx - r * 0.1} ${cy - r * 0.3}
                Q ${cx} ${cy - r * 0.5} ${cx} ${cy - r * 0.5}
                Q ${cx} ${cy - r * 0.5} ${cx + r * 0.1} ${cy - r * 0.3}
                Q ${cx + r * 0.2} ${cy} ${cx} ${cy + r * 0.3}
                Z
              `}
              fill="url(#secondaryGradient)"
            />
          </G>
        );

      // Star icon (for mastery achievements)
      case 'stars':
      case 'grade':
      case 'star':
        return (
          <G>
            {/* Star shape */}
            <Path
              d={`
                M ${cx} ${cy - r * 0.9}
                L ${cx + r * 0.2} ${cy - r * 0.2}
                L ${cx + r * 0.9} ${cy - r * 0.2}
                L ${cx + r * 0.35} ${cy + r * 0.2}
                L ${cx + r * 0.55} ${cy + r * 0.9}
                L ${cx} ${cy + r * 0.4}
                L ${cx - r * 0.55} ${cy + r * 0.9}
                L ${cx - r * 0.35} ${cy + r * 0.2}
                L ${cx - r * 0.9} ${cy - r * 0.2}
                L ${cx - r * 0.2} ${cy - r * 0.2}
                Z
              `}
              fill="url(#primaryGradient)"
            />
            {/* Inner star highlight */}
            <Path
              d={`
                M ${cx} ${cy - r * 0.5}
                L ${cx + r * 0.15} ${cy - r * 0.1}
                L ${cx + r * 0.4} ${cy}
                L ${cx} ${cy + r * 0.2}
                L ${cx - r * 0.4} ${cy}
                L ${cx - r * 0.15} ${cy - r * 0.1}
                Z
              `}
              fill="url(#secondaryGradient)"
            />
          </G>
        );

      // Lightning bolt (for speed achievements)
      case 'bolt':
      case 'flash_on':
      case 'electric_bolt':
        return (
          <G>
            {/* Lightning bolt */}
            <Path
              d={`
                M ${cx + r * 0.2} ${cy - r * 0.8}
                L ${cx - r * 0.3} ${cy}
                L ${cx + r * 0.1} ${cy}
                L ${cx - r * 0.2} ${cy + r * 0.8}
                L ${cx + r * 0.3} ${cy - r * 0.1}
                L ${cx - r * 0.1} ${cy - r * 0.1}
                Z
              `}
              fill="url(#primaryGradient)"
            />
            {/* Glow effect */}
            <Path
              d={`
                M ${cx + r * 0.2} ${cy - r * 0.8}
                L ${cx - r * 0.3} ${cy}
                L ${cx + r * 0.1} ${cy}
                L ${cx - r * 0.2} ${cy + r * 0.8}
                L ${cx + r * 0.3} ${cy - r * 0.1}
                L ${cx - r * 0.1} ${cy - r * 0.1}
                Z
              `}
              fill={gradients.accent}
              opacity={0.3}
              transform={`scale(1.2) translate(${-cx * 0.2}, ${-cy * 0.2})`}
            />
          </G>
        );

      // Shield (for mastery achievements)
      case 'shield':
      case 'verified':
      case 'verified_user':
        return (
          <G>
            {/* Shield shape */}
            <Path
              d={`
                M ${cx} ${cy - r * 0.8}
                L ${cx + r * 0.6} ${cy - r * 0.5}
                L ${cx + r * 0.6} ${cy + r * 0.2}
                Q ${cx + r * 0.6} ${cy + r * 0.8} ${cx} ${cy + r * 0.9}
                Q ${cx - r * 0.6} ${cy + r * 0.8} ${cx - r * 0.6} ${cy + r * 0.2}
                L ${cx - r * 0.6} ${cy - r * 0.5}
                Z
              `}
              fill="url(#primaryGradient)"
            />
            {/* Shield emblem */}
            <Path
              d={`
                M ${cx - r * 0.35} ${cy}
                L ${cx - r * 0.1} ${cy + r * 0.3}
                L ${cx + r * 0.4} ${cy - r * 0.4}
              `}
              stroke="url(#secondaryGradient)"
              strokeWidth={r * 0.15}
              strokeLinecap="round"
              fill="none"
            />
          </G>
        );

      // Brain/Psychology (for cognitive achievements)
      case 'psychology':
      case 'smart_toy':
        return (
          <G>
            {/* Brain outline */}
            <Path
              d={`
                M ${cx - r * 0.3} ${cy - r * 0.6}
                Q ${cx - r * 0.7} ${cy - r * 0.5} ${cx - r * 0.7} ${cy}
                Q ${cx - r * 0.7} ${cy + r * 0.5} ${cx - r * 0.3} ${cy + r * 0.6}
                L ${cx + r * 0.3} ${cy + r * 0.6}
                Q ${cx + r * 0.7} ${cy + r * 0.5} ${cx + r * 0.7} ${cy}
                Q ${cx + r * 0.7} ${cy - r * 0.5} ${cx + r * 0.3} ${cy - r * 0.6}
                Z
              `}
              fill="url(#primaryGradient)"
            />
            {/* Brain details */}
            <Path
              d={`M ${cx - r * 0.4} ${cy - r * 0.3} Q ${cx - r * 0.3} ${cy - r * 0.1} ${cx - r * 0.4} ${cy + r * 0.1}`}
              stroke="url(#secondaryGradient)"
              strokeWidth={r * 0.1}
              fill="none"
            />
            <Path
              d={`M ${cx + r * 0.4} ${cy - r * 0.3} Q ${cx + r * 0.3} ${cy - r * 0.1} ${cx + r * 0.4} ${cy + r * 0.1}`}
              stroke="url(#secondaryGradient)"
              strokeWidth={r * 0.1}
              fill="none"
            />
          </G>
        );

      // Sun/Morning (for time-based achievements)
      case 'wb_twilight':
      case 'wb_sunny':
        return (
          <G>
            {/* Sun rays */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
              const rad = (angle * Math.PI) / 180;
              const x1 = cx + Math.cos(rad) * r * 0.6;
              const y1 = cy + Math.sin(rad) * r * 0.6;
              const x2 = cx + Math.cos(rad) * r * 0.9;
              const y2 = cy + Math.sin(rad) * r * 0.9;
              return (
                <Path
                  key={angle}
                  d={`M ${x1} ${y1} L ${x2} ${y2}`}
                  stroke="url(#secondaryGradient)"
                  strokeWidth={r * 0.1}
                  strokeLinecap="round"
                />
              );
            })}
            {/* Sun circle */}
            <Circle cx={cx} cy={cy} r={r * 0.4} fill="url(#primaryGradient)" />
            {/* Shine */}
            <Circle
              cx={cx - r * 0.15}
              cy={cy - r * 0.15}
              r={r * 0.15}
              fill="#FFFFFF"
              opacity={0.5}
            />
          </G>
        );

      // Rocket (for achievement milestones)
      case 'rocket_launch':
      case 'rocket':
        return (
          <G>
            {/* Rocket body */}
            <Path
              d={`
                M ${cx} ${cy - r * 0.8}
                Q ${cx + r * 0.3} ${cy - r * 0.6} ${cx + r * 0.25} ${cy + r * 0.5}
                L ${cx + r * 0.15} ${cy + r * 0.5}
                L ${cx + r * 0.3} ${cy + r * 0.8}
                L ${cx} ${cy + r * 0.6}
                L ${cx - r * 0.3} ${cy + r * 0.8}
                L ${cx - r * 0.15} ${cy + r * 0.5}
                L ${cx - r * 0.25} ${cy + r * 0.5}
                Q ${cx - r * 0.3} ${cy - r * 0.6} ${cx} ${cy - r * 0.8}
                Z
              `}
              fill="url(#primaryGradient)"
            />
            {/* Window */}
            <Circle cx={cx} cy={cy - r * 0.2} r={r * 0.2} fill="url(#secondaryGradient)" />
            {/* Flame */}
            <Path
              d={`
                M ${cx - r * 0.15} ${cy + r * 0.5}
                L ${cx} ${cy + r * 0.9}
                L ${cx + r * 0.15} ${cy + r * 0.5}
              `}
              fill={tier === 'platinum' ? '#3B82F6' : gradients.accent}
              opacity={0.7}
            />
          </G>
        );

      // Diamond (for platinum achievements)
      case 'diamond':
      case 'workspace_premium':
        return (
          <G>
            {/* Diamond shape */}
            <Path
              d={`
                M ${cx} ${cy - r * 0.8}
                L ${cx + r * 0.6} ${cy - r * 0.3}
                L ${cx + r * 0.4} ${cy + r * 0.7}
                L ${cx} ${cy + r * 0.9}
                L ${cx - r * 0.4} ${cy + r * 0.7}
                L ${cx - r * 0.6} ${cy - r * 0.3}
                Z
              `}
              fill="url(#primaryGradient)"
            />
            {/* Diamond facets */}
            <Path
              d={`M ${cx - r * 0.6} ${cy - r * 0.3} L ${cx} ${cy + r * 0.9}`}
              stroke={gradients.accent}
              strokeWidth={1}
              opacity={0.3}
            />
            <Path
              d={`M ${cx + r * 0.6} ${cy - r * 0.3} L ${cx} ${cy + r * 0.9}`}
              stroke={gradients.accent}
              strokeWidth={1}
              opacity={0.3}
            />
            <Path
              d={`M ${cx} ${cy - r * 0.8} L ${cx} ${cy + r * 0.9}`}
              stroke="#FFFFFF"
              strokeWidth={1}
              opacity={0.5}
            />
            {/* Sparkle */}
            <Circle cx={cx - r * 0.3} cy={cy - r * 0.1} r={r * 0.08} fill="#FFFFFF" opacity={0.8} />
          </G>
        );

      // Explore/World (for exploration achievements)
      case 'explore':
      case 'public':
        return (
          <G>
            {/* Globe */}
            <Circle cx={cx} cy={cy} r={r * 0.7} fill="url(#primaryGradient)" />
            {/* Latitude lines */}
            <Ellipse
              cx={cx}
              cy={cy}
              rx={r * 0.7}
              ry={r * 0.3}
              stroke="url(#secondaryGradient)"
              strokeWidth={r * 0.08}
              fill="none"
            />
            <Ellipse
              cx={cx}
              cy={cy}
              rx={r * 0.7}
              ry={r * 0.15}
              stroke="url(#secondaryGradient)"
              strokeWidth={r * 0.08}
              fill="none"
            />
            {/* Longitude line */}
            <Ellipse
              cx={cx}
              cy={cy}
              rx={r * 0.3}
              ry={r * 0.7}
              stroke="url(#secondaryGradient)"
              strokeWidth={r * 0.08}
              fill="none"
            />
          </G>
        );

      // Default: Circle with icon initial
      default:
        return (
          <G>
            <Circle cx={cx} cy={cy} r={r} fill="url(#primaryGradient)" />
            <Circle cx={cx - r * 0.2} cy={cy - r * 0.2} r={r * 0.2} fill="#FFFFFF" opacity={0.3} />
          </G>
        );
    }
  };

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          {/* Primary gradient */}
          <LinearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={gradients.primary.start} stopOpacity="1" />
            <Stop offset="100%" stopColor={gradients.primary.end} stopOpacity="1" />
          </LinearGradient>

          {/* Secondary gradient (for highlights) */}
          <LinearGradient id="secondaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={gradients.secondary.start} stopOpacity="1" />
            <Stop offset="100%" stopColor={gradients.secondary.end} stopOpacity="1" />
          </LinearGradient>

          {/* Platinum shine gradient */}
          {tier === 'platinum' && isUnlocked ? (
            <LinearGradient id="platinumShine" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#3B82F6" stopOpacity="0" />
              <Stop offset="50%" stopColor="#3B82F6" stopOpacity="0.4" />
              <Stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
            </LinearGradient>
          ) : null}
        </Defs>

        {/* Shadow layer */}
        <Ellipse
          cx={size / 2}
          cy={size * 0.55}
          rx={size * 0.35}
          ry={size * 0.1}
          fill={gradients.accent}
          opacity={0.15}
        />

        {/* Main icon */}
        {renderIcon()}

        {/* Platinum shine overlay */}
        {tier === 'platinum' && isUnlocked ? (
          <Circle cx={size / 2} cy={size / 2} r={size * 0.4} fill="url(#platinumShine)" />
        ) : null}
      </Svg>
    </View>
  );
}
