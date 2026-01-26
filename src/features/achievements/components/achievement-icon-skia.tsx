/**
 * Skia-based Achievement Icon Component
 * High-performance GPU-rendered icons with advanced effects
 */

import { useMemo } from 'react';

import { Canvas } from '@shopify/react-native-skia';

import type { AchievementTier } from '../types/achievement.types';
import {
  DefaultIcon,
  FireIcon,
  LightningIcon,
  StarIcon,
  SunIcon,
  TrophyIcon,
} from './achievement-icons';

interface AchievementIconSkiaProps {
  iconName: string;
  tier: AchievementTier;
  isUnlocked: boolean;
  size?: number;
}

export function AchievementIconSkia({
  iconName,
  tier,
  isUnlocked,
  size = 64,
}: AchievementIconSkiaProps) {
  // Tier-specific colors
  const colors = useMemo(() => {
    if (!isUnlocked) {
      return {
        start: '#94A3B8',
        end: '#64748B',
        highlight: '#CBD5E1',
        shadow: 'rgba(71, 85, 105, 0.4)',
      };
    }

    switch (tier) {
      case 'bronze':
        return {
          start: '#E6B88A',
          end: '#8B5A2B',
          highlight: '#FDD7A7',
          shadow: 'rgba(107, 68, 35, 0.5)',
        };
      case 'silver':
        return {
          start: '#E8E8E8',
          end: '#A0A0A0',
          highlight: '#FFFFFF',
          shadow: 'rgba(128, 128, 128, 0.5)',
        };
      case 'gold':
        return {
          start: '#FFD700',
          end: '#B8860B',
          highlight: '#FFF4CC',
          shadow: 'rgba(184, 134, 11, 0.6)',
        };
      case 'platinum':
        return {
          start: '#E0F2FE',
          end: '#3B82F6',
          highlight: '#F0F9FF',
          shadow: 'rgba(59, 130, 246, 0.6)',
        };
      default:
        return {
          start: '#94A3B8',
          end: '#64748B',
          highlight: '#CBD5E1',
          shadow: 'rgba(71, 85, 105, 0.4)',
        };
    }
  }, [tier, isUnlocked]);

  // Render icon based on name
  const renderIcon = () => {
    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.35;

    const commonProps = { cx, cy, r, colors };

    switch (iconName) {
      case 'emoji_events':
      case 'trophy':
        return <TrophyIcon {...commonProps} />;

      case 'local_fire_department':
      case 'whatshot':
      case 'flare':
        return <FireIcon {...commonProps} tier={tier} isUnlocked={isUnlocked} />;

      case 'stars':
      case 'grade':
      case 'star':
        return <StarIcon {...commonProps} tier={tier} isUnlocked={isUnlocked} />;

      case 'bolt':
      case 'flash_on':
      case 'electric_bolt':
        return <LightningIcon {...commonProps} />;

      case 'wb_twilight':
      case 'wb_sunny':
        return <SunIcon {...commonProps} />;

      default:
        return <DefaultIcon {...commonProps} />;
    }
  };

  return (
    <Canvas
      style={{
        width: size,
        height: size,
      }}
    >
      {renderIcon()}
    </Canvas>
  );
}
