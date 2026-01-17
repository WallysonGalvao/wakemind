# WakeMind

A cognitive alarm clock app that helps you wake up by engaging your brain with interactive challenges.

## Features

- **Smart Alarms** - Create, edit, and manage alarms with customizable schedules
- **Cognitive Challenges** - Three challenge types to ensure you're fully awake:
  - **Math** - Solve arithmetic problems (3 difficulty levels)
  - **Memory** - Simon Says-style pattern recognition
  - **Logic** - Sequence completion and odd-one-out puzzles
- **Backup Protocols** - Snooze protection and wake check notifications
- **Critical Alerts** - Notifications that bypass Do Not Disturb (iOS)
- **Dark Mode** - Full light/dark theme support
- **Internationalization** - Available in English, Portuguese, and Spanish

## Tech Stack

- **Framework**: [Expo](https://expo.dev) (SDK 54) + [React Native](https://reactnative.dev) 0.81
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/) (file-based routing)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) + [MMKV](https://github.com/mrousavy/react-native-mmkv) persistence
- **Styling**: [TailwindCSS](https://tailwindcss.com/) + [NativeWind](https://www.nativewind.dev/)
- **Animations**: [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- **Notifications**: [Notifee](https://notifee.app/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + Zod validation
- **Testing**: [Jest](https://jestjs.io/) + [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- **i18n**: [i18next](https://www.i18next.com/) + [react-i18next](https://react.i18next.com/)

## Getting Started

### Prerequisites

- Node.js 18+
- iOS: Xcode 15+ (for iOS development)
- Android: Android Studio with SDK 34+ (for Android development)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/wakemind.git
   cd wakemind
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Install iOS pods (macOS only):

   ```bash
   cd ios && pod install && cd ..
   ```

4. Start the development server:

   ```bash
   npm start
   ```

### Running the App

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Start Metro bundler
npm start
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo development server |
| `npm run ios` | Run on iOS simulator |
| `npm run android` | Run on Android emulator |
| `npm test` | Run Jest tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |
| `npm run format` | Format code with Prettier |
| `npm run maestro` | Run Maestro E2E tests |

## Project Structure

```
src/
├── app/                    # Expo Router pages
│   ├── (tabs)/             # Tab navigation
│   ├── alarm/              # Alarm screens
│   ├── onboarding/         # Onboarding flow
│   └── settings/           # Settings screens
├── components/             # Shared components
├── constants/              # App constants and colors
├── features/               # Feature modules
│   ├── alarms/             # Alarm management
│   │   ├── components/     # Alarm components
│   │   ├── screens/        # Alarm screens
│   │   └── schemas/        # Validation schemas
│   ├── onboarding/         # Onboarding flow
│   └── settings/           # Settings screens
├── hooks/                  # Custom React hooks
├── i18n/                   # Internationalization
│   └── locales/            # Translation files (en, pt, es)
├── services/               # Business logic services
│   ├── alarm-scheduler.ts  # Notification scheduling
│   └── notification-handler.ts
├── stores/                 # Zustand stores
├── types/                  # TypeScript types
└── utils/                  # Utility functions
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Building & Publishing

This project uses [EAS Build](https://docs.expo.dev/build/introduction/) for cloud builds and [EAS Submit](https://docs.expo.dev/submit/introduction/) for store submissions.

### Build Profiles

| Profile | Platform | Output | Use Case |
|---------|----------|--------|----------|
| `development` | iOS | Simulator build | Local development |
| `development` | Android | APK | Local development |
| `preview` | iOS | Ad-hoc IPA | Internal testing |
| `preview` | Android | APK | Internal testing |
| `production` | iOS | App Store build | Production release |
| `production` | Android | AAB | Production release |

### Building the App

```bash
# Development builds
eas build --profile development --platform ios
eas build --profile development --platform android

# Preview builds (internal testing)
eas build --profile preview --platform ios
eas build --profile preview --platform android

# Production builds
eas build --profile production --platform ios
eas build --profile production --platform android

# Build for all platforms
eas build --profile production --platform all
```

### Over-the-Air Updates

```bash
# Push an update to production
eas update --branch production --message "Bug fixes"

# Push an update to preview
eas update --branch preview --message "New feature"
```

### Publishing to Stores

#### iOS App Store

1. **Configure credentials** in `eas.json`:
   ```json
   "ios": {
     "appleId": "your-apple-id@email.com",
     "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID",
     "appleTeamId": "YOUR_APPLE_TEAM_ID"
   }
   ```

2. **Request Critical Alerts entitlement** (required for alarm apps):
   - Apply at: https://developer.apple.com/contact/request/notifications-critical-alerts-entitlement/

3. **Submit to App Store**:
   ```bash
   eas submit --platform ios --latest
   ```

#### Google Play Store

1. **Create a service account** in Google Cloud Console

2. **Download the JSON key** and save as `google-service-account.json` in project root

3. **Configure in `eas.json`**:
   ```json
   "android": {
     "serviceAccountKeyPath": "./google-service-account.json",
     "track": "internal"
   }
   ```

4. **Submit to Play Store**:
   ```bash
   eas submit --platform android --latest
   ```

### Environment Variables

For production builds, set secrets using EAS:

```bash
# Set a secret
eas secret:create --name API_KEY --value "your-api-key" --scope project

# List secrets
eas secret:list
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes using conventional commits
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Acknowledgments

- [Expo](https://expo.dev) for the excellent React Native tooling
- [Notifee](https://notifee.app) for reliable notification handling
- [NativeWind](https://nativewind.dev) for bringing Tailwind to React Native
