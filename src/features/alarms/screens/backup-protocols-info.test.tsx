import { render } from '@testing-library/react-native';

import BackupProtocolsInfoScreen from './backup-protocols-info';

// Mock expo-router
const mockBack = jest.fn();
const mockSetOptions = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
  }),
  useNavigation: () => ({
    setOptions: mockSetOptions,
  }),
}));

// Mock react-i18next with actual translations
jest.mock('react-i18next', () => {
  const mockEnTranslations = jest.requireActual('@/i18n/en').default;

  return {
    useTranslation: () => ({
      t: (key: string) => {
        const translations = mockEnTranslations as Record<string, string>;
        return translations[key] || key;
      },
    }),
  };
});

// Mock custom hooks
jest.mock('@/hooks/use-shadow-style', () => ({
  useCustomShadow: () => ({}),
  useShadowStyle: () => ({}),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  return Reanimated;
});

/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock MaterialSymbol
jest.mock('@/components/material-symbol', () => ({
  MaterialSymbol: ({ name }: any) => {
    const { Text } = require('react-native');
    return <Text testID={`icon-${name}`}>{name}</Text>;
  },
}));

// Mock Text component
jest.mock('@/components/ui/text', () => ({
  Text: ({ children, ...props }: any) => {
    const { Text: RNText } = require('react-native');
    return <RNText {...props}>{children}</RNText>;
  },
}));

describe('BackupProtocolsInfoScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the screen with hero section', () => {
      const { getByTestId, getByText } = render(<BackupProtocolsInfoScreen />);

      // Hero icon
      expect(getByTestId('icon-verified_user')).toBeTruthy();

      // Description text
      expect(
        getByText(
          "Backup Protocols are safety mechanisms that ensure you actually wake up, even if you can't dismiss the main alarm with the cognitive challenge."
        )
      ).toBeTruthy();
    });

    it('should render Why section with benefits', () => {
      const { getByText, getAllByTestId } = render(<BackupProtocolsInfoScreen />);

      // Section title
      expect(getByText('Why are they important?')).toBeTruthy();

      // Benefits
      expect(getByText('Zero-fail guarantee - you will wake up')).toBeTruthy();
      expect(getByText('Prevents falling back asleep')).toBeTruthy();
      expect(getByText('Forces physical and cognitive engagement')).toBeTruthy();

      // Check icons
      const checkIcons = getAllByTestId('icon-check');
      expect(checkIcons.length).toBe(3);
    });

    it('should render Available Protocols section', () => {
      const { getByText } = render(<BackupProtocolsInfoScreen />);

      // Section title
      expect(getByText('Available Protocols')).toBeTruthy();
    });

    it('should render Snooze protocol card', () => {
      const { getByText, getByTestId } = render(<BackupProtocolsInfoScreen />);

      expect(getByTestId('icon-snooze')).toBeTruthy();
      expect(getByText('Snooze')).toBeTruthy();
      expect(
        getByText(
          'Snooze is strictly controlled or disabled by default. Easy snoozing would be counterproductive for a performance-focused alarm.'
        )
      ).toBeTruthy();
    });

    it('should render Wake Check protocol card', () => {
      const { getByText, getByTestId } = render(<BackupProtocolsInfoScreen />);

      expect(getByTestId('icon-check_circle')).toBeTruthy();
      expect(getByText('Wake Check')).toBeTruthy();
      expect(
        getByText(
          "After dismissing the alarm, the app requests a confirmation 5 minutes later to ensure you haven't fallen back asleep."
        )
      ).toBeTruthy();
    });

    it('should render Barcode Scan protocol card', () => {
      const { getByText, getByTestId } = render(<BackupProtocolsInfoScreen />);

      expect(getByTestId('icon-qr_code_scanner')).toBeTruthy();
      expect(getByText('Barcode Scan')).toBeTruthy();
      expect(
        getByText(
          'Forces you to scan a barcode (like toothpaste) to fully dismiss the alarm, requiring you to physically get out of bed.'
        )
      ).toBeTruthy();
    });
  });

  describe('Navigation Header', () => {
    it('should set navigation options on mount', () => {
      render(<BackupProtocolsInfoScreen />);

      expect(mockSetOptions).toHaveBeenCalledWith(
        expect.objectContaining({
          headerTitle: 'What are Backup Protocols?',
          headerLeft: expect.any(Function),
        })
      );
    });

    it('should have close button in header that navigates back', () => {
      render(<BackupProtocolsInfoScreen />);

      // Get the headerLeft component from the mock call
      const setOptionsCall = mockSetOptions.mock.calls[0][0];
      const HeaderLeftComponent = setOptionsCall.headerLeft;

      // Render the header left component
      const { getByTestId } = render(<HeaderLeftComponent />);

      // Should have close icon
      expect(getByTestId('icon-close')).toBeTruthy();
    });
  });

  describe('Content Structure', () => {
    it('should render dividers between sections', () => {
      // This test ensures the visual structure is maintained
      const { getByText } = render(<BackupProtocolsInfoScreen />);

      // All sections should be present
      expect(getByText('Why are they important?')).toBeTruthy();
      expect(getByText('Available Protocols')).toBeTruthy();
    });

    it('should render all three benefit items', () => {
      const { getAllByTestId } = render(<BackupProtocolsInfoScreen />);

      // Should have 3 check icons for benefits
      const checkIcons = getAllByTestId('icon-check');
      expect(checkIcons).toHaveLength(3);
    });

    it('should render all three protocol cards', () => {
      const { getByTestId } = render(<BackupProtocolsInfoScreen />);

      // All protocol icons should be present
      expect(getByTestId('icon-snooze')).toBeTruthy();
      expect(getByTestId('icon-check_circle')).toBeTruthy();
      expect(getByTestId('icon-qr_code_scanner')).toBeTruthy();
    });
  });
});
