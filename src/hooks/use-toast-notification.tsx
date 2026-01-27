/**
 * @file Toast Notification Hook
 * @description Centralized hook for showing toast notifications
 * @module hooks
 */

import React, { memo, useCallback } from 'react';

import { Toast, ToastDescription, ToastTitle, useToast } from '@/components/ui/toast';

/**
 * Toast notification types
 */
type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast display options
 */
interface ToastOptions {
  duration?: number;
  placement?: 'top' | 'bottom';
}

/**
 * Default toast configuration
 */
const DEFAULT_TOAST_OPTIONS: Required<ToastOptions> = {
  duration: 3000,
  placement: 'top',
};

/**
 * Memoized toast component for better performance
 */
const ToastNotification = memo(
  ({
    id,
    type,
    title,
    description,
  }: {
    id: string;
    type: ToastType;
    title: string;
    description: string;
  }) => {
    return (
      <Toast nativeID={`toast-${id}`} action={type} variant="solid">
        <ToastTitle>{title}</ToastTitle>
        <ToastDescription>{description}</ToastDescription>
      </Toast>
    );
  }
);

ToastNotification.displayName = 'ToastNotification';

/**
 * Hook for displaying toast notifications with consistent styling
 * Centralizes toast logic to avoid duplication and improve maintainability
 *
 * @returns Object with methods to show different types of toasts
 *
 * @example
 * const toast = useToastNotification();
 *
 * // Show success message
 * toast.showSuccess('Success!', 'Your alarm was created');
 *
 * // Show error with custom duration
 * toast.showError('Error', 'Something went wrong', { duration: 5000 });
 *
 * // Show warning
 * toast.showWarning('Warning', 'This action requires premium');
 */
export const useToastNotification = () => {
  const toastInstance = useToast();

  const showToast = useCallback(
    (type: ToastType, title: string, description: string, options?: ToastOptions) => {
      const config = { ...DEFAULT_TOAST_OPTIONS, ...options };

      if (toastInstance?.show) {
        toastInstance.show({
          placement: config.placement,
          duration: config.duration,
          render: ({ id }: { id: string }) => (
            <ToastNotification id={id} type={type} title={title} description={description} />
          ),
        });
      }
    },
    [toastInstance]
  );

  const showSuccess = useCallback(
    (title: string, description: string, options?: ToastOptions) => {
      showToast('success', title, description, options);
    },
    [showToast]
  );

  const showError = useCallback(
    (title: string, description: string, options?: ToastOptions) => {
      showToast('error', title, description, { duration: 4000, ...options });
    },
    [showToast]
  );

  const showWarning = useCallback(
    (title: string, description: string, options?: ToastOptions) => {
      showToast('warning', title, description, { duration: 4000, ...options });
    },
    [showToast]
  );

  const showInfo = useCallback(
    (title: string, description: string, options?: ToastOptions) => {
      showToast('info', title, description, { duration: 5000, ...options });
    },
    [showToast]
  );

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};
