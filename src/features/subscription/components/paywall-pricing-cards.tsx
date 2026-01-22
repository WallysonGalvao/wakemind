import { Pressable, View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/constants/colors';

// ============================================================================
// Types
// ============================================================================

interface BasePricingCardProps {
  title: string;
  price: string;
  period: string;
  isSelected: boolean;
  onPress: () => void;
}

interface YearlyPricingCardProps extends BasePricingCardProps {
  originalPrice: string;
  badge: string;
  hasTrial: boolean;
  trialText: string;
}

interface MonthlyPricingCardProps extends BasePricingCardProps {
  subtitle: string;
}

// ============================================================================
// Yearly Card
// ============================================================================

export function YearlyPricingCard({
  title,
  price,
  period,
  originalPrice,
  badge,
  hasTrial,
  trialText,
  isSelected,
  onPress,
}: YearlyPricingCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${price} ${period}, ${badge}`}
      accessibilityHint={trialText}
      accessibilityState={{ selected: isSelected }}
    >
      <View
        className={`relative w-full overflow-hidden rounded-2xl border p-5 ${
          isSelected
            ? 'border-primary-500 bg-white shadow-lg shadow-primary-500/20 dark:bg-[#1a2233]'
            : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-[#1a2233]'
        }`}
      >
        {/* Badge */}
        {badge ? (
          <View className="absolute right-3 top-3 rounded bg-primary-500 px-2 py-1 shadow-lg shadow-primary-500/40">
            <Text className="text-[10px] font-bold uppercase tracking-wider text-white">
              {badge}
            </Text>
          </View>
        ) : null}

        {/* Price Section */}
        <View className="mb-2 flex-row items-end justify-between">
          <View>
            <Text className="mb-1 text-sm font-semibold uppercase tracking-widest text-primary-500">
              {title}
            </Text>
            <Text className="text-3xl font-bold text-gray-900 dark:text-white">{price}</Text>
          </View>
          <View className="mb-1 items-end">
            {originalPrice ? (
              <Text className="text-sm text-gray-400 line-through dark:text-gray-500">
                {originalPrice}
              </Text>
            ) : null}
            <Text className="text-xs text-gray-500 dark:text-gray-400">{period}</Text>
          </View>
        </View>

        <View className="my-4 h-px bg-gray-200 dark:bg-gray-800" />

        {/* Trial Section */}
        {hasTrial ? (
          <View className="flex-row items-center gap-2">
            <MaterialSymbol name="check_circle" size={18} color={COLORS.brandPrimary} />
            <Text className="text-sm font-medium text-gray-900 dark:text-white">{trialText}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

// ============================================================================
// Monthly Card
// ============================================================================

export function MonthlyPricingCard({
  title,
  price,
  period,
  subtitle,
  isSelected,
  onPress,
}: MonthlyPricingCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${price} ${period}`}
      accessibilityHint={`${subtitle}`}
      accessibilityState={{ selected: isSelected }}
      className={`flex-row items-center justify-between rounded-xl border p-4 ${
        isSelected
          ? 'border-primary-500 bg-white dark:bg-[#1a2233]'
          : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-[#1a2233]'
      }`}
    >
      <View>
        <Text
          className={`text-sm font-medium ${
            isSelected ? 'text-primary-500' : 'text-gray-900 dark:text-white'
          }`}
        >
          {title}
        </Text>
        <Text className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</Text>
      </View>
      <View className="flex-row items-center gap-1">
        <Text className="text-lg font-bold text-gray-900 dark:text-white">{price}</Text>
        <Text className="text-xs text-gray-400 dark:text-gray-500">{period}</Text>
      </View>
    </Pressable>
  );
}
