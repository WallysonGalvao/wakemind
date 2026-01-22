/**
 * Retry Utility
 * Implements exponential backoff for retrying failed operations
 * Particularly useful for network requests and API calls
 */

import { AnalyticsEvents } from '@/analytics';

export interface RetryOptions {
  maxRetries?: number; // Maximum number of retry attempts (default: 3)
  initialDelay?: number; // Initial delay in ms (default: 1000)
  maxDelay?: number; // Maximum delay in ms (default: 10000)
  backoffMultiplier?: number; // Multiplier for exponential backoff (default: 2)
  shouldRetry?: (error: unknown) => boolean; // Custom function to determine if should retry
  onRetry?: (error: unknown, attempt: number) => void; // Callback on each retry
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'shouldRetry' | 'onRetry'>> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};

/**
 * Retry a function with exponential backoff
 * @param fn Function to retry
 * @param options Retry configuration options
 * @returns Result of the function
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let lastError: unknown;
  let delay = config.initialDelay;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      // If this is a retry attempt, wait before trying
      if (attempt > 0) {
        console.log(`[Retry] Attempt ${attempt}/${config.maxRetries}, waiting ${delay}ms...`);
        await sleep(delay);

        // Calculate next delay with exponential backoff
        delay = Math.min(delay * config.backoffMultiplier, config.maxDelay);
      }

      // Execute the function
      const result = await fn();

      // Success - log if it was a retry
      if (attempt > 0) {
        console.log(`[Retry] Success after ${attempt} retries`);
      }

      return result;
    } catch (error) {
      lastError = error;
      console.error(`[Retry] Attempt ${attempt + 1} failed:`, error);

      // Check if we should retry this error
      const shouldRetry = config.shouldRetry ? config.shouldRetry(error) : isRetryableError(error);

      if (!shouldRetry) {
        console.log('[Retry] Error is not retryable, giving up');
        throw error;
      }

      // If this was the last attempt, throw the error
      if (attempt === config.maxRetries) {
        console.error('[Retry] Max retries reached, giving up');

        // Track network error
        AnalyticsEvents.networkError('retry_failed', attempt);

        throw error;
      }

      // Call retry callback if provided
      config.onRetry?.(error, attempt + 1);

      // Track retry attempt
      AnalyticsEvents.networkError('retrying', attempt + 1);
    }
  }

  // Should never reach here, but TypeScript needs it
  throw lastError;
}

/**
 * Determine if an error is retryable (network-related)
 */
function isRetryableError(error: unknown): boolean {
  // Handle user cancellation - never retry
  if (error && typeof error === 'object' && 'userCancelled' in error) {
    return false;
  }

  // Network-related error keywords
  const retryableKeywords = [
    'network',
    'connection',
    'timeout',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'fetch failed',
    'internet',
    'offline',
  ];

  const errorMessage =
    error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
      ? error.message.toLowerCase()
      : '';

  return retryableKeywords.some((keyword) => errorMessage.includes(keyword.toLowerCase()));
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry wrapper specifically for RevenueCat operations
 */
export async function retryRevenueCatOperation<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  return retryWithBackoff(operation, {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 5000,
    onRetry: (error, attempt) => {
      console.log(`[RevenueCat] Retrying ${operationName}, attempt ${attempt}`);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      AnalyticsEvents.subscriptionError(operationName, errorMessage, {
        retry_attempt: attempt,
      });
    },
  });
}
