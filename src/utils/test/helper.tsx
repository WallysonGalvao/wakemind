import type { RenderHookOptions } from '@testing-library/react-native';
import { render, renderHook } from '@testing-library/react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { StyleSheet } from 'react-native';

const initialMetrics = {
  frame: { height: 0, width: 0, x: 0, y: 0 },
  insets: { bottom: 0, left: 0, right: 0, top: 0 },
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <GestureHandlerRootView style={styles.gestureHandlerRootView}>
    <SafeAreaProvider initialMetrics={initialMetrics}>{children}</SafeAreaProvider>
  </GestureHandlerRootView>
);

export function renderWithClient(children: React.ReactElement) {
  return render(<Wrapper>{children}</Wrapper>);
}

export function renderHookWithClient<TProps, TResult>(
  hook: (props: TProps) => TResult,
  options?: RenderHookOptions<TProps>
) {
  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Wrapper>{children}</Wrapper>
  );

  return renderHook(hook, { wrapper, ...options });
}

const styles = StyleSheet.create({
  gestureHandlerRootView: {
    flex: 1,
  },
});
