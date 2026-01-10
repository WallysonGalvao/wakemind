import { useEffect, useMemo } from 'react';

import {
  BlurMask,
  Canvas,
  Circle,
  Group,
  LinearGradient,
  Path,
  useCanvasRef,
  vec,
} from '@shopify/react-native-skia';
import type { SharedValue } from 'react-native-reanimated';
import {
  Easing,
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

const WAVE_COUNT = 4;
const NODE_COUNT = 12;
const CONNECTION_DISTANCE = 150;
const BRAIN_RHYTHM_DURATION = 1200; // ~0.83Hz - brain-like cadence
const PULSE_DURATION = 400;

// Color palettes
const COLORS_DARK = {
  background: '#0a0f1a',
  gradientStart: '#0d1929',
  gradientEnd: '#0a0f1a',
  waveStart: 'rgba(19, 91, 236, 0.4)', // brandPrimary
  waveEnd: 'rgba(34, 211, 238, 0.1)', // cyan
  nodeColor: 'rgba(34, 211, 238, 0.6)',
  nodeGlow: 'rgba(19, 91, 236, 0.8)',
  connectionColor: 'rgba(34, 211, 238, 0.15)',
  pulseColor: 'rgba(251, 191, 36, 0.3)', // amber accent
};

const COLORS_LIGHT = {
  background: '#f0f4f8',
  gradientStart: '#e8eff7',
  gradientEnd: '#f0f4f8',
  waveStart: 'rgba(19, 91, 236, 0.25)',
  waveEnd: 'rgba(34, 211, 238, 0.08)',
  nodeColor: 'rgba(19, 91, 236, 0.5)',
  nodeGlow: 'rgba(19, 91, 236, 0.6)',
  connectionColor: 'rgba(19, 91, 236, 0.12)',
  pulseColor: 'rgba(251, 191, 36, 0.25)',
};

// ============================================================================
// Types
// ============================================================================

type NeuralFlowBackgroundProps = {
  pulseIntensity?: SharedValue<number>;
};

type Node = {
  x: number;
  y: number;
  baseRadius: number;
  phase: number;
};

// ============================================================================
// Helper Functions
// ============================================================================

function generateWavePathSVG(
  width: number,
  height: number,
  phase: number,
  amplitude: number,
  frequency: number,
  yOffset: number
): string {
  'worklet';
  const segments = 50;
  const points: string[] = [];

  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * width;
    const normalizedX = x / width;

    // Multiple sine waves for organic feel
    const y =
      yOffset +
      Math.sin(normalizedX * Math.PI * frequency + phase) * amplitude * 0.6 +
      Math.sin(normalizedX * Math.PI * frequency * 0.5 + phase * 1.3) * amplitude * 0.3 +
      Math.sin(normalizedX * Math.PI * frequency * 2 + phase * 0.7) * amplitude * 0.1;

    if (i === 0) {
      points.push(`M ${x} ${y}`);
    } else {
      points.push(`L ${x} ${y}`);
    }
  }

  // Close the path at the bottom
  points.push(`L ${width} ${height}`);
  points.push(`L 0 ${height}`);
  points.push('Z');

  return points.join(' ');
}

function generateNodes(width: number, height: number): Node[] {
  const nodes: Node[] = [];

  for (let i = 0; i < NODE_COUNT; i++) {
    nodes.push({
      x: Math.random() * width * 0.8 + width * 0.1,
      y: Math.random() * height * 0.6 + height * 0.2,
      baseRadius: Math.random() * 2 + 2,
      phase: Math.random() * Math.PI * 2,
    });
  }

  return nodes;
}

// ============================================================================
// Sub-Components
// ============================================================================

type WaveLayerProps = {
  width: number;
  height: number;
  phase: SharedValue<number>;
  pulseIntensity: SharedValue<number>;
  index: number;
  colors: typeof COLORS_DARK;
};

function WaveLayer({ width, height, phase, pulseIntensity, index, colors }: WaveLayerProps) {
  const baseAmplitude = 30 + index * 15;
  const frequency = 2 + index * 0.5;
  const yOffset = height * 0.4 + index * (height * 0.12);
  const phaseOffset = index * 0.8;

  const pathString = useDerivedValue(() => {
    'worklet';
    const currentPhase = phase.value + phaseOffset;
    const pulseBoost = pulseIntensity.value * 20;
    const amplitude = baseAmplitude + pulseBoost;

    return generateWavePathSVG(width, height, currentPhase, amplitude, frequency, yOffset);
  }, [phase, pulseIntensity, width, height]);

  const opacity = 0.4 - index * 0.08;

  return (
    <Group opacity={opacity}>
      <Path path={pathString}>
        <LinearGradient
          start={vec(0, yOffset - baseAmplitude)}
          end={vec(0, height)}
          colors={[colors.waveStart, colors.waveEnd]}
        />
      </Path>
      <BlurMask blur={8 + index * 4} style="normal" />
    </Group>
  );
}

type CognitiveNodesProps = {
  width: number;
  height: number;
  phase: SharedValue<number>;
  pulseIntensity: SharedValue<number>;
  colors: typeof COLORS_DARK;
};

type NodeWithGlowProps = {
  node: Node;
  phase: SharedValue<number>;
  pulseIntensity: SharedValue<number>;
  colors: typeof COLORS_DARK;
};

function NodeWithGlow({ node, phase, pulseIntensity, colors }: NodeWithGlowProps) {
  const nodeRadius = useDerivedValue(() => {
    const breathe = Math.sin(phase.value + node.phase) * 0.5 + 0.5;
    const pulse = pulseIntensity.value * 2;
    return node.baseRadius + breathe * 1.5 + pulse;
  }, [phase, pulseIntensity, node.phase, node.baseRadius]);

  const glowRadius = useDerivedValue(() => {
    return nodeRadius.value * 3;
  }, [nodeRadius]);

  return (
    <Group>
      {/* Glow */}
      <Circle cx={node.x} cy={node.y} r={glowRadius} color={colors.nodeGlow} opacity={0.3}>
        <BlurMask blur={12} style="normal" />
      </Circle>
      {/* Core */}
      <Circle cx={node.x} cy={node.y} r={nodeRadius} color={colors.nodeColor} />
    </Group>
  );
}

function CognitiveNodes({ width, height, phase, pulseIntensity, colors }: CognitiveNodesProps) {
  const nodes = useMemo(() => generateNodes(width, height), [width, height]);

  // Pre-compute connections
  const connections = useMemo(() => {
    const conns: { from: Node; to: Node }[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < CONNECTION_DISTANCE) {
          conns.push({ from: nodes[i], to: nodes[j] });
        }
      }
    }
    return conns;
  }, [nodes]);

  return (
    <Group>
      {/* Connections */}
      {connections.map((conn, index) => {
        const pathString = `M ${conn.from.x} ${conn.from.y} L ${conn.to.x} ${conn.to.y}`;
        return (
          <Path
            key={`conn-${index}`}
            path={pathString}
            color={colors.connectionColor}
            style="stroke"
            strokeWidth={1}
          />
        );
      })}

      {/* Nodes with glow */}
      {nodes.map((node, index) => (
        <NodeWithGlow
          key={`node-${index}`}
          node={node}
          phase={phase}
          pulseIntensity={pulseIntensity}
          colors={colors}
        />
      ))}
    </Group>
  );
}

type PulseRippleProps = {
  width: number;
  height: number;
  pulseIntensity: SharedValue<number>;
  colors: typeof COLORS_DARK;
};

function PulseRipple({ width, height, pulseIntensity, colors }: PulseRippleProps) {
  const centerX = width / 2;
  const centerY = height * 0.5;
  const maxRadius = Math.max(width, height);

  const rippleRadius = useDerivedValue(() => {
    return pulseIntensity.value * maxRadius * 0.8;
  }, [pulseIntensity, maxRadius]);

  const rippleOpacity = useDerivedValue(() => {
    return pulseIntensity.value * 0.4;
  }, [pulseIntensity]);

  return (
    <Group opacity={rippleOpacity}>
      <Circle cx={centerX} cy={centerY} r={rippleRadius} color={colors.pulseColor}>
        <BlurMask blur={40} style="normal" />
      </Circle>
    </Group>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function NeuralFlowBackground({ pulseIntensity }: NeuralFlowBackgroundProps) {
  const canvasRef = useCanvasRef();
  const { width, height } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? COLORS_DARK : COLORS_LIGHT;

  // Continuous phase animation (brain rhythm ~0.83Hz)
  const phase = useSharedValue(0);

  // Internal pulse intensity if not provided
  const internalPulseIntensity = useSharedValue(0);
  const activePulseIntensity = pulseIntensity ?? internalPulseIntensity;

  useEffect(() => {
    // Continuous breathing animation
    phase.value = withRepeat(
      withTiming(Math.PI * 2, {
        duration: BRAIN_RHYTHM_DURATION,
        easing: Easing.linear,
      }),
      -1, // infinite
      false
    );
  }, [phase]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Canvas ref={canvasRef} style={styles.canvas}>
        {/* Base gradient overlay */}
        <Group>
          <Path
            path={`M 0 0 L ${width} 0 L ${width} ${height} L 0 ${height} Z`}
            color={colors.gradientStart}
          >
            <LinearGradient
              start={vec(0, 0)}
              end={vec(0, height)}
              colors={[colors.gradientStart, colors.gradientEnd]}
            />
          </Path>
        </Group>

        {/* Pulse ripple effect */}
        <PulseRipple
          width={width}
          height={height}
          pulseIntensity={activePulseIntensity}
          colors={colors}
        />

        {/* Neural waves */}
        {Array.from({ length: WAVE_COUNT }).map((_, index) => (
          <WaveLayer
            key={`wave-${index}`}
            width={width}
            height={height}
            phase={phase}
            pulseIntensity={activePulseIntensity}
            index={index}
            colors={colors}
          />
        ))}

        {/* Cognitive grid nodes */}
        <CognitiveNodes
          width={width}
          height={height}
          phase={phase}
          pulseIntensity={activePulseIntensity}
          colors={colors}
        />
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
