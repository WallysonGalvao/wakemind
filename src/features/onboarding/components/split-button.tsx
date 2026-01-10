import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { COLORS } from '@/constants/colors';

// ============================================================================
// Types
// ============================================================================

type SplitAction = {
  label: string;
  onPress: () => void;
};

type SplitButtonProps = {
  splitted: boolean;
  mainAction: SplitAction;
  leftAction: SplitAction;
  rightAction: SplitAction;
};

// ============================================================================
// Constants
// ============================================================================

const BUTTON_HEIGHT = 56;
const PADDING_HORIZONTAL = 24;
const GAP = 12;

// ============================================================================
// Main Component
// ============================================================================

export function SplitButton({ splitted, mainAction, leftAction, rightAction }: SplitButtonProps) {
  const { width: windowWidth } = useWindowDimensions();

  const splittedButtonWidth = (windowWidth - PADDING_HORIZONTAL * 2 - GAP) / 2;

  const rLeftButtonStyle = useAnimatedStyle(() => {
    const leftButtonWidth = splitted ? splittedButtonWidth : 0;
    return {
      width: withTiming(leftButtonWidth, { duration: 300 }),
      opacity: withTiming(splitted ? 1 : 0, { duration: 200 }),
    };
  }, [splitted, splittedButtonWidth]);

  const rLeftTextStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(splitted ? 1 : 0, { duration: 150 }),
    };
  }, [splitted]);

  const rMainButtonStyle = useAnimatedStyle(() => {
    const mainButtonWidth = splitted ? splittedButtonWidth : splittedButtonWidth * 2 + GAP;
    return {
      width: withTiming(mainButtonWidth, { duration: 300 }),
      marginLeft: withTiming(splitted ? GAP : 0, { duration: 300 }),
    };
  }, [splitted, splittedButtonWidth]);

  const rMainTextStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(splitted ? 0 : 1, { duration: 200 }),
    };
  }, [splitted]);

  const rRightTextStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(splitted ? 1 : 0, { duration: 200 }),
    };
  }, [splitted]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.leftButtonWrapper, rLeftButtonStyle]}>
        <Pressable
          onPress={leftAction.onPress}
          accessibilityRole="button"
          accessibilityLabel={leftAction.label}
          accessibilityHint="Skip onboarding"
          style={styles.leftButton}
        >
          <Animated.View style={rLeftTextStyle}>
            <Text style={styles.leftLabel}>{leftAction.label}</Text>
          </Animated.View>
        </Pressable>
      </Animated.View>

      <Animated.View style={[styles.rightButtonWrapper, rMainButtonStyle]}>
        <Pressable
          onPress={splitted ? rightAction.onPress : mainAction.onPress}
          accessibilityRole="button"
          accessibilityLabel={splitted ? rightAction.label : mainAction.label}
          accessibilityHint={splitted ? 'Go to next step' : 'Complete onboarding'}
          style={styles.rightButton}
        >
          <Animated.View style={[styles.textContainer, rMainTextStyle]}>
            <Text style={styles.rightLabel}>{mainAction.label}</Text>
          </Animated.View>
          <Animated.View style={[styles.textContainer, rRightTextStyle]}>
            <Text style={styles.rightLabel}>{rightAction.label}</Text>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: BUTTON_HEIGHT,
    paddingHorizontal: PADDING_HORIZONTAL,
    flexDirection: 'row',
  },
  leftButtonWrapper: {
    height: BUTTON_HEIGHT,
    overflow: 'hidden',
  },
  leftButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  leftLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  rightButtonWrapper: {
    height: BUTTON_HEIGHT,
  },
  rightButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: COLORS.white,
  },
  textContainer: {
    position: 'absolute',
  },
  rightLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.brandPrimary,
  },
});
