/**
 * Subscription Error Boundary
 * Catches and handles errors related to subscription/purchase operations
 * Provides retry functionality for network failures
 */

import { Component, type ReactNode } from 'react';

import { ActivityIndicator, Pressable, View } from 'react-native';

import { AnalyticsEvents } from '@/analytics';
import { Text } from '@/components/ui/text';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: unknown) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isRetrying: boolean;
}

export class SubscriptionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isRetrying: false,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      isRetrying: false,
    };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    // Log error to analytics
    AnalyticsEvents.subscriptionError('error_boundary', error.message, {
      component_stack:
        errorInfo && typeof errorInfo === 'object' && 'componentStack' in errorInfo
          ? String(errorInfo.componentStack)
          : 'unknown',
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    console.error('[SubscriptionErrorBoundary] Caught error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ isRetrying: true });

    // Reset error state after a brief delay
    setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        isRetrying: false,
      });
    }, 500);
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      // Default error UI
      return (
        <View className="flex-1 items-center justify-center bg-background-light px-6 dark:bg-background-dark">
          <View className="items-center">
            {/* Error Icon */}
            <View className="mb-6 h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <Text className="text-3xl">⚠️</Text>
            </View>

            {/* Error Title */}
            <Text className="text-text-light dark:text-text-dark mb-2 text-center text-xl font-bold">
              Oops! Something went wrong
            </Text>

            {/* Error Message */}
            <Text className="text-text-muted-light dark:text-text-muted-dark mb-8 text-center text-sm">
              {this.isNetworkError(this.state.error)
                ? 'Unable to connect. Please check your internet connection and try again.'
                : 'An error occurred while processing your subscription. Please try again.'}
            </Text>

            {/* Retry Button */}
            <Pressable
              accessibilityRole="button"
              onPress={this.handleRetry}
              disabled={this.state.isRetrying}
              className="bg-primary-light dark:bg-primary-dark w-full rounded-xl px-8 py-4"
              style={({ pressed }) => ({
                opacity: pressed || this.state.isRetrying ? 0.7 : 1,
              })}
            >
              {this.state.isRetrying ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-center font-semibold text-white">Try Again</Text>
              )}
            </Pressable>

            {/* Error Details (Debug) */}
            {__DEV__ ? (
              <View className="mt-4 rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
                <Text className="text-xs text-gray-600 dark:text-gray-400">
                  {this.state.error.message}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      );
    }

    return this.props.children;
  }

  // Helper to determine if error is network-related
  private isNetworkError(error: Error): boolean {
    const networkKeywords = [
      'network',
      'connection',
      'timeout',
      'fetch',
      'internet',
      'offline',
      'ECONNREFUSED',
      'ETIMEDOUT',
    ];

    return networkKeywords.some((keyword) =>
      error.message.toLowerCase().includes(keyword.toLowerCase())
    );
  }
}
