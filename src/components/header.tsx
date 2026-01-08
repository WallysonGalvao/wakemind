import { useTranslation } from 'react-i18next';

import { Platform, Pressable, Text, View } from 'react-native';

export type IconButton = {
  icon?: React.ReactNode;
  label?: React.ReactNode;
  menu?: React.ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

type HeaderProps = {
  title?: string;
  customTitle?: React.ReactNode;
  leftIcons?: IconButton[];
  rightIcons?: IconButton[];
  showOnWeb?: boolean;
};

export const Header = ({
  title,
  customTitle,
  leftIcons = [],
  rightIcons = [],
  showOnWeb = false,
}: HeaderProps) => {
  const { t } = useTranslation();
  const limitedLeftIcons = leftIcons.slice(0, 3);
  const limitedRightIcons = rightIcons.slice(0, 3);

  if (Platform.OS === 'web' && !showOnWeb) return null;

  return (
    <View className="h-14 flex-row items-center justify-between px-4" accessibilityRole="header">
      {/* Left icons/labels */}
      <View className="flex-row gap-4">
        {limitedLeftIcons.map((item, index) => (
          <Pressable
            testID={`left-icon-${index}`}
            accessibilityRole="button"
            accessibilityLabel={item.accessibilityLabel || t('HEADER_LEFT_ACTION')}
            accessibilityHint={item.accessibilityHint}
            accessibilityState={{ disabled: !item.onPress }}
            key={`left-icon-${index}`}
            onPress={item.onPress}
            className="min-h-[44px] min-w-[44px] items-center justify-center"
            hitSlop={8}
            disabled={!item.onPress}
          >
            {item.icon || item.label || item.menu}
          </Pressable>
        ))}
      </View>

      {/* Center title */}
      <View
        // testID={test_id['header-title']}
        className="pointer-events-none absolute left-0 right-0 items-center"
        accessibilityRole="text"
        accessibilityLabel={title ? t('HEADER_TITLE_LABEL', { title }) : undefined}
        accessibilityHint={t('CURRENT_PAGE_TITLE_HINT')}
      >
        {customTitle ? (
          customTitle
        ) : (
          <Text className="text-base font-bold text-slate-900 dark:text-white">{title}</Text>
        )}
      </View>

      {/* Right icons/labels */}
      <View className="flex-row gap-4">
        {limitedRightIcons.map((item, index) => (
          <Pressable
            testID={`right-icon-${index}`}
            accessibilityRole="button"
            accessibilityLabel={item.accessibilityLabel || t('HEADER_RIGHT_ACTION')}
            accessibilityHint={item.accessibilityHint}
            accessibilityState={{ disabled: !item.onPress }}
            key={`right-icon-${index}`}
            onPress={item.onPress}
            className="min-h-[44px] min-w-[44px] items-center justify-center"
            hitSlop={8}
            disabled={!item.onPress}
          >
            {item.icon || item.label || item.menu}
          </Pressable>
        ))}
      </View>
    </View>
  );
};
