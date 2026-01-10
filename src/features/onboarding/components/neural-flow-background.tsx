import { useEffect, useMemo } from 'react';

import {
  BlurMask,
  Canvas,
  Circle,
  Group,
  LinearGradient,
  Path,
  RadialGradient,
  vec,
} from '@shopify/react-native-skia';
import type { SharedValue } from 'react-native-reanimated';
import {
  Easing,
  interpolate,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';

// ============================================================================
// Constants
// ============================================================================

// Slower, more meditative rhythm (3 seconds per cycle)
const BRAIN_RHYTHM_DURATION = 3000;
const FLOAT_DURATION = 8000; // Slow floating motion for nodes
const PULSE_DURATION = 400;

// Pre-computed RGB colors for worklet compatibility (no parsing needed)
type RGBA = { r: number; g: number; b: number; a: number };

// Screen 0: Foggy purple/gray - scattered, unfocused (but still visible!)
// Screen 1: Teal/cyan - awakening, connecting
// Screen 2: Bright blue/white - clear, peak performance
const COLORS_RGB_DARK = {
  background: [
    { r: 15, g: 12, b: 25, a: 1 }, // Dark purple-gray (foggy)
    { r: 10, g: 22, b: 35, a: 1 }, // Dark teal (awakening)
    { r: 8, g: 20, b: 40, a: 1 }, // Deep blue (clarity)
  ] as RGBA[],
  wave: [
    { r: 120, g: 100, b: 160, a: 0.35 }, // Muted purple (fog) - MORE VISIBLE
    { r: 34, g: 180, b: 200, a: 0.45 }, // Teal (activation)
    { r: 80, g: 200, b: 255, a: 0.55 }, // Bright cyan (clarity)
  ] as RGBA[],
  node: [
    { r: 140, g: 120, b: 180, a: 0.55 }, // Purple dots - MORE VISIBLE
    { r: 56, g: 189, b: 220, a: 0.7 }, // Teal nodes
    { r: 130, g: 220, b: 255, a: 0.9 }, // Bright cyan nodes
  ] as RGBA[],
  glow: [
    { r: 100, g: 80, b: 150, a: 0.25 }, // Soft purple glow - MORE VISIBLE
    { r: 34, g: 180, b: 220, a: 0.5 }, // Medium glow
    { r: 100, g: 200, b: 255, a: 0.75 }, // Strong glow
  ] as RGBA[],
  connection: [
    { r: 120, g: 100, b: 170, a: 0.15 }, // Visible connections on screen 0
    { r: 56, g: 189, b: 220, a: 0.3 }, // Visible connections
    { r: 130, g: 220, b: 255, a: 0.5 }, // Strong connections
  ] as RGBA[],
};

const COLORS_RGB_LIGHT = {
  background: [
    { r: 245, g: 242, b: 248, a: 1 }, // Light purple-gray
    { r: 240, g: 248, b: 250, a: 1 }, // Light teal tint
    { r: 235, g: 245, b: 255, a: 1 }, // Light blue
  ] as RGBA[],
  wave: [
    { r: 140, g: 120, b: 180, a: 0.12 },
    { r: 34, g: 160, b: 200, a: 0.2 },
    { r: 19, g: 120, b: 220, a: 0.3 },
  ] as RGBA[],
  node: [
    { r: 140, g: 120, b: 180, a: 0.25 },
    { r: 34, g: 160, b: 200, a: 0.5 },
    { r: 19, g: 100, b: 200, a: 0.7 },
  ] as RGBA[],
  glow: [
    { r: 140, g: 120, b: 180, a: 0.08 },
    { r: 34, g: 160, b: 200, a: 0.25 },
    { r: 19, g: 100, b: 200, a: 0.45 },
  ] as RGBA[],
  connection: [
    { r: 140, g: 120, b: 180, a: 0.04 },
    { r: 34, g: 160, b: 200, a: 0.12 },
    { r: 19, g: 100, b: 200, a: 0.25 },
  ] as RGBA[],
};

// ============================================================================
// Types
// ============================================================================

type NeuralFlowBackgroundProps = {
  scrollX: SharedValue<number>;
  totalScreens: number;
  pulseIntensity?: SharedValue<number>;
};

type NodeData = {
  // Base positions (normalized 0-1)
  baseX: number;
  baseY: number;
  baseRadius: number;
  phase: number;
  index: number;
  // Floating animation parameters
  floatSpeedX: number;
  floatSpeedY: number;
  floatAmplitudeX: number;
  floatAmplitudeY: number;
};

// ============================================================================
// Worklet-safe Helper Functions
// ============================================================================

function lerpRgba(c1: RGBA, c2: RGBA, t: number): string {
  'worklet';
  const r = Math.round(c1.r + (c2.r - c1.r) * t);
  const g = Math.round(c1.g + (c2.g - c1.g) * t);
  const b = Math.round(c1.b + (c2.b - c1.b) * t);
  const a = c1.a + (c2.a - c1.a) * t;
  return `rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`;
}

function interpolateColor(colors: RGBA[], progress: number): string {
  'worklet';
  const clampedProgress = Math.max(0, Math.min(2, progress));
  const idx = Math.floor(clampedProgress);
  const t = clampedProgress - idx;
  const nextIdx = Math.min(idx + 1, 2);
  return lerpRgba(colors[idx], colors[nextIdx], t);
}

function rgbaToString(c: RGBA): string {
  'worklet';
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a.toFixed(3)})`;
}

// Generate wave with different characteristics per screen
function generateDynamicWavePath(
  width: number,
  height: number,
  phase: number,
  progress: number, // 0-2 scroll progress
  waveIndex: number
): string {
  'worklet';
  const segments = 50;
  const points: string[] = [];

  // Screen 0: Low, slow, few waves (foggy brain)
  // Screen 1: Medium, moderate (awakening)
  // Screen 2: High, fast, many waves (peak clarity)
  const amplitude = interpolate(progress, [0, 1, 2], [15, 35, 55]) + waveIndex * 8;
  const frequency = interpolate(progress, [0, 1, 2], [1.2, 2.0, 3.0]) + waveIndex * 0.3;
  const yBase = interpolate(progress, [0, 1, 2], [0.65, 0.5, 0.35]) + waveIndex * 0.08;
  const chaos = interpolate(progress, [0, 1, 2], [0.8, 0.4, 0.15]); // More chaos = more fog

  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * width;
    const normalizedX = i / segments;

    // Primary wave
    const primary = Math.sin(normalizedX * Math.PI * frequency + phase) * amplitude;

    // Secondary harmonics (more on screen 2)
    const harmonicStrength = interpolate(progress, [0, 1, 2], [0.1, 0.25, 0.4]);
    const secondary =
      Math.sin(normalizedX * Math.PI * frequency * 2.1 + phase * 1.3) *
      amplitude *
      harmonicStrength;

    // Chaos/noise (more on screen 0)
    const noise = Math.sin(normalizedX * 17 + phase * 0.7) * amplitude * 0.15 * chaos;

    const y = height * yBase + primary + secondary + noise;

    if (i === 0) {
      points.push(`M ${x} ${y}`);
    } else {
      points.push(`L ${x} ${y}`);
    }
  }

  points.push(`L ${width} ${height}`);
  points.push(`L 0 ${height}`);
  points.push('Z');

  return points.join(' ');
}

// Generate nodes with positions that morph based on screen
function generateBaseNodes(count: number): NodeData[] {
  const nodes: NodeData[] = [];
  for (let i = 0; i < count; i++) {
    // Create a spiral-like distribution
    const angle = (i / count) * Math.PI * 4;
    const radius = 0.15 + (i / count) * 0.35;

    // Each node has unique floating behavior
    const floatVariation = ((i * 7) % 11) / 11; // Pseudo-random variation

    nodes.push({
      baseX: 0.5 + Math.cos(angle) * radius,
      baseY: 0.35 + Math.sin(angle) * radius * 0.7,
      baseRadius: 2 + (i % 4),
      phase: (i / count) * Math.PI * 2,
      index: i,
      // Unique floating speeds and amplitudes per node
      floatSpeedX: 0.7 + floatVariation * 0.6, // 0.7 to 1.3
      floatSpeedY: 0.8 + (((i * 13) % 11) / 11) * 0.5, // 0.8 to 1.3
      floatAmplitudeX: 0.015 + floatVariation * 0.02, // 1.5% to 3.5% of width
      floatAmplitudeY: 0.02 + (((i * 17) % 11) / 11) * 0.025, // 2% to 4.5% of height
    });
  }
  return nodes;
}

// Calculate node position based on scroll progress and floating animation
function getNodePosition(
  node: NodeData,
  progress: number,
  width: number,
  height: number,
  phase: number,
  floatPhase: number // Separate phase for slow floating
): { x: number; y: number; radius: number; opacity: number } {
  'worklet';

  // Screen 0: Nodes scattered, random, small, dim
  // Screen 1: Nodes converging, medium, visible
  // Screen 2: Nodes organized, large, bright, pulsing

  // Spread factor - how scattered the nodes are
  const spreadX = interpolate(progress, [0, 1, 2], [1.4, 1.0, 0.7]);
  const spreadY = interpolate(progress, [0, 1, 2], [1.3, 1.0, 0.8]);

  // Center attraction - nodes move toward center on later screens
  const centerPull = interpolate(progress, [0, 1, 2], [0, 0.15, 0.3]);

  // Floating animation - continuous gentle movement
  const floatX = Math.sin(floatPhase * node.floatSpeedX + node.phase) * node.floatAmplitudeX;
  const floatY = Math.sin(floatPhase * node.floatSpeedY + node.phase * 1.3) * node.floatAmplitudeY;

  // Calculate base position
  const baseX = node.baseX - 0.5;
  const baseY = node.baseY - 0.5;

  // Apply spread, center pull, and floating
  const x = width * (0.5 + baseX * spreadX * (1 - centerPull) + floatX);
  const y = height * (0.45 + baseY * spreadY * (1 - centerPull) + floatY);

  // Breathing animation (stronger on screen 2)
  const breatheStrength = interpolate(progress, [0, 1, 2], [0.5, 0.8, 1.2]);
  const breathe = Math.sin(phase + node.phase) * breatheStrength;

  // Radius grows with progress - but visible on all screens
  const baseRadius = interpolate(progress, [0, 1, 2], [2.5, 3.5, 5]);
  const radius = node.baseRadius * (baseRadius / 3) + breathe;

  // Opacity - visible on all screens, brighter as we progress
  const opacity = interpolate(progress, [0, 1, 2], [0.5, 0.7, 0.95]);

  return { x, y, radius, opacity };
}

// ============================================================================
// Sub-Components
// ============================================================================

type WaveLayerProps = {
  width: number;
  height: number;
  phase: SharedValue<number>;
  scrollX: SharedValue<number>;
  screenWidth: number;
  pulseIntensity: SharedValue<number>;
  waveIndex: number;
  colorsRgb: typeof COLORS_RGB_DARK;
};

function WaveLayer({
  width,
  height,
  phase,
  scrollX,
  screenWidth,
  pulseIntensity,
  waveIndex,
  colorsRgb,
}: WaveLayerProps) {
  const pathString = useDerivedValue(() => {
    'worklet';
    const progress = scrollX.value / screenWidth;
    const pulseBoost = pulseIntensity.value * 20;
    return generateDynamicWavePath(
      width,
      height,
      phase.value + waveIndex * 0.5 + pulseBoost * 0.1,
      progress,
      waveIndex
    );
  });

  const waveColor = useDerivedValue(() => {
    'worklet';
    const progress = scrollX.value / screenWidth;
    return interpolateColor(colorsRgb.wave, progress);
  });

  const waveEndColor = useDerivedValue(() => {
    'worklet';
    const progress = scrollX.value / screenWidth;
    // Make end color more transparent
    const baseColor = colorsRgb.wave[Math.floor(Math.min(progress, 2))];
    return `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.02)`;
  });

  // Wave count increases per screen - only show wave if it should be visible
  const waveOpacity = useDerivedValue(() => {
    'worklet';
    const progress = scrollX.value / screenWidth;

    // Screen 0: 2 waves, Screen 1: 3 waves, Screen 2: 4 waves
    const maxWavesForProgress = interpolate(progress, [0, 1, 2], [2, 3, 4]);

    if (waveIndex >= maxWavesForProgress) {
      // Fade in as we approach the screen where this wave appears
      const fadeStart = waveIndex === 2 ? 0.5 : waveIndex === 3 ? 1.5 : 0;
      const fadeEnd = fadeStart + 0.5;
      return interpolate(progress, [fadeStart, fadeEnd], [0, 1], 'clamp');
    }

    // Base opacity increases with screen
    return interpolate(progress, [0, 1, 2], [0.4, 0.6, 0.8]) - waveIndex * 0.1;
  });

  return (
    <Group opacity={waveOpacity}>
      <Path path={pathString}>
        <LinearGradient
          start={vec(0, height * 0.3)}
          end={vec(0, height)}
          colors={[waveColor.value, waveEndColor.value]}
        />
      </Path>
      <BlurMask blur={8 + waveIndex * 4} style="normal" />
    </Group>
  );
}

type DynamicNodeProps = {
  node: NodeData;
  phase: SharedValue<number>;
  floatPhase: SharedValue<number>;
  scrollX: SharedValue<number>;
  screenWidth: number;
  width: number;
  height: number;
  pulseIntensity: SharedValue<number>;
  colorsRgb: typeof COLORS_RGB_DARK;
};

function DynamicNode({
  node,
  phase,
  floatPhase,
  scrollX,
  screenWidth,
  width,
  height,
  pulseIntensity,
  colorsRgb,
}: DynamicNodeProps) {
  const nodeX = useDerivedValue(() => {
    'worklet';
    const progress = scrollX.value / screenWidth;
    const pos = getNodePosition(node, progress, width, height, phase.value, floatPhase.value);
    return pos.x;
  });

  const nodeY = useDerivedValue(() => {
    'worklet';
    const progress = scrollX.value / screenWidth;
    const pos = getNodePosition(node, progress, width, height, phase.value, floatPhase.value);
    return pos.y;
  });

  const nodeRadius = useDerivedValue(() => {
    'worklet';
    const progress = scrollX.value / screenWidth;
    const pos = getNodePosition(node, progress, width, height, phase.value, floatPhase.value);
    const pulse = pulseIntensity.value * 4;
    return Math.max(1, pos.radius + pulse);
  });

  const nodeOpacity = useDerivedValue(() => {
    'worklet';
    const progress = scrollX.value / screenWidth;
    const pos = getNodePosition(node, progress, width, height, phase.value, floatPhase.value);
    return pos.opacity;
  });

  const glowRadius = useDerivedValue(() => {
    'worklet';
    const progress = scrollX.value / screenWidth;
    const glowMultiplier = interpolate(progress, [0, 1, 2], [1.5, 2.5, 4]);
    return nodeRadius.value * glowMultiplier;
  });

  const nodeColor = useDerivedValue(() => {
    'worklet';
    const progress = scrollX.value / screenWidth;
    return interpolateColor(colorsRgb.node, progress);
  });

  const glowColor = useDerivedValue(() => {
    'worklet';
    const progress = scrollX.value / screenWidth;
    return interpolateColor(colorsRgb.glow, progress);
  });

  return (
    <Group opacity={nodeOpacity}>
      <Circle cx={nodeX} cy={nodeY} r={glowRadius} color={glowColor} opacity={0.5}>
        <BlurMask blur={12} style="normal" />
      </Circle>
      <Circle cx={nodeX} cy={nodeY} r={nodeRadius} color={nodeColor} />
    </Group>
  );
}

type DynamicConnectionsProps = {
  nodes: NodeData[];
  phase: SharedValue<number>;
  floatPhase: SharedValue<number>;
  scrollX: SharedValue<number>;
  screenWidth: number;
  width: number;
  height: number;
  colorsRgb: typeof COLORS_RGB_DARK;
};

function DynamicConnections({
  nodes,
  phase,
  floatPhase,
  scrollX,
  screenWidth,
  width,
  height,
  colorsRgb,
}: DynamicConnectionsProps) {
  // Pre-calculate connection pairs (which nodes should connect)
  const connectionPairs = useMemo(() => {
    const pairs: Array<{ i: number; j: number }> = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        // Only connect nearby nodes in base positions
        const dx = nodes[i].baseX - nodes[j].baseX;
        const dy = nodes[i].baseY - nodes[j].baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.35) {
          pairs.push({ i, j });
        }
      }
    }
    return pairs;
  }, [nodes]);

  return (
    <Group>
      {connectionPairs.map((pair, idx) => (
        <ConnectionLine
          key={`conn-${idx}`}
          nodeA={nodes[pair.i]}
          nodeB={nodes[pair.j]}
          phase={phase}
          floatPhase={floatPhase}
          scrollX={scrollX}
          screenWidth={screenWidth}
          width={width}
          height={height}
          colorsRgb={colorsRgb}
        />
      ))}
    </Group>
  );
}

type ConnectionLineProps = {
  nodeA: NodeData;
  nodeB: NodeData;
  phase: SharedValue<number>;
  floatPhase: SharedValue<number>;
  scrollX: SharedValue<number>;
  screenWidth: number;
  width: number;
  height: number;
  colorsRgb: typeof COLORS_RGB_DARK;
};

function ConnectionLine({
  nodeA,
  nodeB,
  phase,
  floatPhase,
  scrollX,
  screenWidth,
  width,
  height,
  colorsRgb,
}: ConnectionLineProps) {
  const pathString = useDerivedValue(() => {
    'worklet';
    const progress = scrollX.value / screenWidth;
    const posA = getNodePosition(nodeA, progress, width, height, phase.value, floatPhase.value);
    const posB = getNodePosition(nodeB, progress, width, height, phase.value, floatPhase.value);
    return `M ${posA.x} ${posA.y} L ${posB.x} ${posB.y}`;
  });

  const connectionColor = useDerivedValue(() => {
    'worklet';
    const progress = scrollX.value / screenWidth;
    return interpolateColor(colorsRgb.connection, progress);
  });

  // Connections become more visible as we progress
  const opacity = useDerivedValue(() => {
    'worklet';
    const progress = scrollX.value / screenWidth;
    return interpolate(progress, [0, 1, 2], [0.15, 0.5, 0.85]);
  });

  const strokeWidth = useDerivedValue(() => {
    'worklet';
    const progress = scrollX.value / screenWidth;
    return interpolate(progress, [0, 1, 2], [0.5, 1, 1.5]);
  });

  return (
    <Group opacity={opacity}>
      <Path
        path={pathString}
        color={connectionColor}
        style="stroke"
        strokeWidth={strokeWidth.value}
      />
    </Group>
  );
}

type CentralGlowProps = {
  width: number;
  height: number;
  scrollX: SharedValue<number>;
  screenWidth: number;
  colorsRgb: typeof COLORS_RGB_DARK;
};

function CentralGlow({ width, height, scrollX, screenWidth, colorsRgb }: CentralGlowProps) {
  const glowOpacity = useDerivedValue(() => {
    'worklet';
    const progress = scrollX.value / screenWidth;
    // Glow visible on all screens, grows dramatically
    return interpolate(progress, [0, 1, 2], [0.15, 0.35, 0.55]);
  });

  const glowRadius = useDerivedValue(() => {
    'worklet';
    const progress = scrollX.value / screenWidth;
    return interpolate(progress, [0, 1, 2], [120, 200, 320]);
  });

  const glowColor = useDerivedValue(() => {
    'worklet';
    const progress = scrollX.value / screenWidth;
    return interpolateColor(colorsRgb.glow, progress);
  });

  return (
    <Group opacity={glowOpacity}>
      <Circle cx={width * 0.5} cy={height * 0.4} r={glowRadius}>
        <RadialGradient
          c={vec(width * 0.5, height * 0.4)}
          r={glowRadius.value || 100}
          colors={[glowColor.value, 'rgba(0, 0, 0, 0)']}
        />
      </Circle>
    </Group>
  );
}

type PulseRippleProps = {
  width: number;
  height: number;
  pulseIntensity: SharedValue<number>;
};

function PulseRipple({ width, height, pulseIntensity }: PulseRippleProps) {
  const centerX = width / 2;
  const centerY = height * 0.4;
  const maxRadius = Math.max(width, height);

  const rippleRadius = useDerivedValue(() => {
    'worklet';
    return pulseIntensity.value * maxRadius * 0.5;
  });

  const rippleOpacity = useDerivedValue(() => {
    'worklet';
    return pulseIntensity.value * 0.4;
  });

  return (
    <Group opacity={rippleOpacity}>
      <Circle cx={centerX} cy={centerY} r={rippleRadius}>
        <RadialGradient
          c={vec(centerX, centerY)}
          r={rippleRadius.value || 1}
          colors={['rgba(100, 200, 255, 0.5)', 'rgba(100, 200, 255, 0)']}
        />
      </Circle>
    </Group>
  );
}

// ============================================================================
// Main Component
// ============================================================================

const NODE_COUNT = 16; // Single set of nodes that morphs
const WAVE_COUNT = 4; // Max waves (some hidden on early screens)

export function NeuralFlowBackground({
  scrollX,
  totalScreens: _totalScreens,
  pulseIntensity,
}: NeuralFlowBackgroundProps) {
  const { width, height } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colorsRgb = isDark ? COLORS_RGB_DARK : COLORS_RGB_LIGHT;

  const phase = useSharedValue(0);
  const floatPhase = useSharedValue(0); // Separate slow phase for floating
  const internalPulseIntensity = useSharedValue(0);
  const activePulseIntensity = pulseIntensity ?? internalPulseIntensity;

  // Generate a single set of nodes that will morph based on scroll
  const nodes = useMemo(() => generateBaseNodes(NODE_COUNT), []);

  // Dynamic background color that transitions between screens
  const backgroundColor = useDerivedValue(() => {
    'worklet';
    const progress = scrollX.value / width;
    return interpolateColor(colorsRgb.background, progress);
  });

  // Brain rhythm animation (for waves and breathing)
  useEffect(() => {
    phase.value = withRepeat(
      withTiming(Math.PI * 2, {
        duration: BRAIN_RHYTHM_DURATION,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [phase]);

  // Slow floating animation for nodes
  useEffect(() => {
    floatPhase.value = withRepeat(
      withTiming(Math.PI * 2, {
        duration: FLOAT_DURATION,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [floatPhase]);

  // Initial background color for View
  const initialBgColor = rgbaToString(colorsRgb.background[0]);

  return (
    <View style={[styles.container, { backgroundColor: initialBgColor }]}>
      <Canvas style={styles.canvas}>
        {/* Dynamic background fill */}
        <Group>
          <Path
            path={`M 0 0 L ${width} 0 L ${width} ${height} L 0 ${height} Z`}
            color={backgroundColor}
          />
        </Group>

        {/* Central glow (grows with progress) */}
        <CentralGlow
          width={width}
          height={height}
          scrollX={scrollX}
          screenWidth={width}
          colorsRgb={colorsRgb}
        />

        {/* Pulse ripple effect */}
        <PulseRipple width={width} height={height} pulseIntensity={activePulseIntensity} />

        {/* Dynamic waves (count and intensity increase per screen) */}
        {Array.from({ length: WAVE_COUNT }).map((_, index) => (
          <WaveLayer
            key={`wave-${index}`}
            width={width}
            height={height}
            phase={phase}
            scrollX={scrollX}
            screenWidth={width}
            pulseIntensity={activePulseIntensity}
            waveIndex={index}
            colorsRgb={colorsRgb}
          />
        ))}

        {/* Dynamic connections (visibility increases per screen) */}
        <DynamicConnections
          nodes={nodes}
          phase={phase}
          floatPhase={floatPhase}
          scrollX={scrollX}
          screenWidth={width}
          width={width}
          height={height}
          colorsRgb={colorsRgb}
        />

        {/* Dynamic nodes (position, size, brightness morph per screen) */}
        {nodes.map((node, index) => (
          <DynamicNode
            key={`node-${index}`}
            node={node}
            phase={phase}
            floatPhase={floatPhase}
            scrollX={scrollX}
            screenWidth={width}
            width={width}
            height={height}
            pulseIntensity={activePulseIntensity}
            colorsRgb={colorsRgb}
          />
        ))}
      </Canvas>
    </View>
  );
}

// ============================================================================
// Pulse Trigger Hook
// ============================================================================

export function usePulseTrigger() {
  const pulseIntensity = useSharedValue(0);

  const triggerPulse = () => {
    'worklet';
    pulseIntensity.value = withSequence(
      withTiming(1, { duration: PULSE_DURATION * 0.3, easing: Easing.out(Easing.cubic) }),
      withTiming(0, { duration: PULSE_DURATION * 0.7, easing: Easing.inOut(Easing.cubic) })
    );
  };

  return { pulseIntensity, triggerPulse };
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  canvas: {
    flex: 1,
  },
});
