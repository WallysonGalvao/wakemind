import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { PressableScale } from '@/components/pressable-scale';
import { tailwindColors } from '@/theme/colors';

type SplitAction = {
  label: string;
  onPress: () => void;
  backgroundColor?: string;
};

type SplitButtonProps = {
  splitted: boolean;
  mainAction: SplitAction;
  leftAction: SplitAction;
  rightAction: SplitAction;
};

const BUTTON_HEIGHT = 60;
const PADDING_HORIZONTAL = 20;
const GAP = 10;

export function SplitButton({ splitted, mainAction, leftAction, rightAction }: SplitButtonProps) {
  const { width: windowWidth } = useWindowDimensions();

  const splittedButtonWidth = (windowWidth - PADDING_HORIZONTAL * 2 - GAP) / 2;

  const rLeftButtonStyle = useAnimatedStyle(() => {
    const leftButtonWidth = splitted ? splittedButtonWidth : 0;
    return {
      width: withTiming(leftButtonWidth),
      opacity: withTiming(splitted ? 1 : 0),
    };
  }, [splitted]);

  const rLeftTextStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(splitted ? 1 : 0, {
        duration: 150,
      }),
    };
  }, [splitted]);

  const rMainButtonStyle = useAnimatedStyle(() => {
    const mainButtonWidth = splitted ? splittedButtonWidth : splittedButtonWidth * 2 + GAP;
    return {
      width: withTiming(mainButtonWidth),
      marginLeft: withTiming(splitted ? GAP : 0),
    };
  }, [splitted]);

  const rMainTextStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(splitted ? 0 : 1),
    };
  }, [splitted]);

  const rRightTextStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(splitted ? 1 : 0),
    };
  }, [splitted]);

  return (
    <View style={styles.container}>
      <PressableScale
        onPress={leftAction.onPress}
        style={[
          styles.button,
          styles.leftActionButton,
          rLeftButtonStyle,
          { backgroundColor: leftAction.backgroundColor || 'transparent' },
        ]}
      >
        <Animated.Text numberOfLines={1} style={[styles.label, rLeftTextStyle]}>
          {leftAction.label}
        </Animated.Text>
      </PressableScale>

      <PressableScale
        onPress={splitted ? rightAction.onPress : mainAction.onPress}
        style={[styles.button, styles.rightActionButton, rMainButtonStyle]}
      >
        <Animated.Text style={[styles.label, styles.darkLabel, rMainTextStyle]}>
          {mainAction.label}
        </Animated.Text>
        <Animated.Text style={[styles.label, styles.darkLabel, rRightTextStyle]}>
          {rightAction.label}
        </Animated.Text>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: BUTTON_HEIGHT,
    paddingHorizontal: PADDING_HORIZONTAL,
    flexDirection: 'row',
  },
  label: {
    fontSize: 16,
    color: tailwindColors.background,
    fontFamily: 'Sora-SemiBold',
    position: 'absolute',
  },
  darkLabel: {
    color: tailwindColors.primary,
  },
  button: {
    height: BUTTON_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  leftActionButton: {
    borderWidth: 1,
    borderColor: tailwindColors.background,
  },
  rightActionButton: {
    backgroundColor: tailwindColors.background,
  },
});
