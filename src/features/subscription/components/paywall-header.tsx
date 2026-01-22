import { useLayoutEffect } from 'react';

import { useNavigation } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Pressable } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';

interface PaywallHeaderProps {
  onClose: () => void;
  onRestore: () => void;
  isLoading: boolean;
}

/**
 * Configures paywall header with close and restore buttons
 * Extracted for better testability and reusability
 */
export function usePaywallHeader({ onClose, onRestore, isLoading }: PaywallHeaderProps) {
  const navigation = useNavigation();
  const { t } = useTranslation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'WakeMind Pro',
      headerLeft: () => (
        <Pressable accessibilityRole="button" onPress={onClose} className="p-2">
          <MaterialSymbol name="close" size={24} className="text-gray-900 dark:text-white" />
        </Pressable>
      ),
      headerRight: () => (
        <Pressable
          accessibilityRole="button"
          onPress={onRestore}
          disabled={isLoading}
          className="p-2"
        >
          <Text className="text-sm font-semibold text-primary-500">{t('paywall.cta.restore')}</Text>
        </Pressable>
      ),
    });
  }, [navigation, onClose, onRestore, isLoading, t]);
}
