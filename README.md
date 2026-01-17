<div align="center">
  <img src="./assets/images/icon.png" alt="WakeMind Logo" width="120" height="120" />
  
  # WakeMind
  
  **Wake your mind. Execute your day.**
  
  A cognitive alarm clock app that helps you wake up by engaging your brain with interactive challenges.
  
  [![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/WallysonGalvao/wakemind)
  [![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?logo=react)](https://reactnative.dev/)
  [![Expo](https://img.shields.io/badge/Expo-54-000020?logo=expo)](https://expo.dev)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
  [![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)
  
</div>

---

## ✨ Features

### 🎯 Smart Alarms

- Create, edit, and manage alarms with customizable schedules
- Repeat options: Once, Daily, Weekdays, Weekends, Custom
- Difficulty levels for each challenge (Easy, Medium, Hard)

### 🧠 Cognitive Challenges

Ensure you're fully awake with three brain-engaging challenge types:

- **Math** 🔢 - Arithmetic problems with 3 difficulty levels
- **Memory** 🧩 - Simon Says-style pattern recognition
- **Logic** 💡 - Sequence completion and odd-one-out puzzles

### 🛡️ Backup Protocols

- **Snooze Protection** - Disable snooze to prevent oversleeping
- **Wake Check** - Follow-up notification 5 minutes after dismissal

### 🔔 Reliable Notifications

- Critical alerts that bypass Do Not Disturb (iOS)
- Exact alarm scheduling (Android 12+)
- Full-screen intent for lock screen display
- Battery optimization handling

### 🎨 Polished Experience

- **Dark Mode** - Full light/dark theme support with system preference detection
- **Multi-language** - Available in English, Portuguese, and Spanish
- **Analytics** - Mixpanel integration for usage insights
- **Error Tracking** - Sentry integration for production monitoring

---

## 🛠️ Tech Stack

| Category          | Technologies                                                                                                           |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Framework**     | [Expo](https://expo.dev) SDK 54 + [React Native](https://reactnative.dev) 0.81                                         |
| **Architecture**  | New Architecture enabled                                                                                               |
| **Navigation**    | [Expo Router](https://docs.expo.dev/router/introduction/) (file-based)                                                 |
| **State**         | [Zustand](https://zustand-demo.pmnd.rs/) + [MMKV](https://github.com/mrousavy/react-native-mmkv) (encrypted)           |
| **Styling**       | [TailwindCSS](https://tailwindcss.com/) + [NativeWind](https://www.nativewind.dev/) v4                                 |
| **Animations**    | [Reanimated](https://docs.swmansion.com/react-native-reanimated/) v4                                                   |
| **Notifications** | [Notifee](https://notifee.app/) v9                                                                                     |
| **Forms**         | [React Hook Form](https://react-hook-form.com/) + Zod                                                                  |
| **Testing**       | [Jest](https://jestjs.io/) + [React Native Testing Library](https://callstack.github.io/react-native-testing-library/) |
| **E2E Testing**   | [Maestro](https://maestro.mobile.dev/)                                                                                 |
| **i18n**          | [i18next](https://www.i18next.com/) + [react-i18next](https://react.i18next.com/)                                      |
| **Analytics**     | [Mixpanel](https://mixpanel.com/)                                                                                      |
| **Monitoring**    | [Sentry](https://sentry.io/)                                                                                           |
| **CI/CD**         | [EAS Build](https://docs.expo.dev/build/introduction/) + [EAS Submit](https://docs.expo.dev/submit/introduction/)      |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **iOS**: macOS with Xcode 15+ (iOS development)
- **Android**: Android Studio with SDK 34+ (Android development)
- **EAS CLI**: `npm install -g eas-cli` (optional, for cloud builds)

### Installation

```bash
# Clone the repository
git clone https://github.com/WallysonGalvao/wakemind.git
cd wakemind

# Install dependencies
npm install

# iOS only: Install CocoaPods
cd ios && pod install && cd ..

# Start development server
npm start
```

### Running the App

```bash
# Development server
npm start

# iOS (opens simulator)
npm run ios

# Android (opens emulator)
npm run android

# Web
npm run web
```

---

## 📂 Project Structure

```
wakemind/
├── src/
│   ├── app/                    # Expo Router pages
│   │   ├── (tabs)/             # Tab navigation (Alarms, Settings)
│   │   ├── alarm/              # Alarm screens (create, edit, trigger)
│   │   ├── onboarding/         # First-time user onboarding
│   │   └── settings/           # Settings screens
│   ├── analytics/              # Mixpanel events and tracking
│   ├── components/             # Shared UI components
│   ├── configs/                # App configuration (Sentry, etc.)
│   ├── constants/              # Constants (colors, tones, themes)
│   ├── features/               # Feature modules
│   │   ├── alarms/             # Alarm management
│   │   │   ├── components/     # Alarm-specific components
│   │   │   ├── screens/        # Alarm screens
│   │   │   └── schemas/        # Zod validation schemas
│   │   ├── onboarding/         # Onboarding feature
│   │   └── settings/           # Settings feature
│   ├── hooks/                  # Custom React hooks
│   ├── i18n/                   # Internationalization
│   │   ├── en/                 # English translations
│   │   ├── pt/                 # Portuguese translations
│   │   └── es/                 # Spanish translations
│   ├── services/               # Business logic
│   │   ├── alarm-scheduler.ts  # Notifee scheduling
│   │   ├── notification-handler.ts # Event handling
│   │   └── vibration-service.ts
│   ├── stores/                 # Zustand stores
│   │   ├── use-alarms-store.ts
│   │   └── use-settings-store.ts
│   ├── types/                  # TypeScript type definitions
│   └── utils/                  # Utility functions
├── assets/                     # Images, fonts, sounds
├── .maestro/                   # Maestro E2E tests
└── plugins/                    # Expo config plugins
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tests with Maestro
npm run maestro
```

### Coverage

```
| Statements | Branches | Functions | Lines |
|------------|----------|-----------|-------|
| ~75%       | ~70%     | ~68%      | ~75%  |
```

---

## 📦 Building & Deployment

### Build Profiles

| Profile       | Platform    | Output        | Use Case         |
| ------------- | ----------- | ------------- | ---------------- |
| `development` | iOS/Android | Simulator/APK | Local dev        |
| `preview`     | iOS/Android | Ad-hoc/APK    | Internal testing |
| `production`  | iOS/Android | App Store/AAB | Production       |

### Build Commands

```bash
# Development builds
eas build --profile development --platform ios
eas build --profile development --platform android

# Preview builds (internal testing)
eas build --profile preview --platform all

# Production builds
eas build --profile production --platform all
```

### Over-the-Air Updates

```bash
# Push update to production
eas update --branch production --message "Bug fixes and improvements"

# Preview channel
eas update --branch preview --message "New feature testing"
```

### Store Submission

#### iOS App Store

1. **Configure `eas.json`** with your Apple credentials
2. **Request Critical Alerts entitlement** at [Apple Developer](https://developer.apple.com/contact/request/notifications-critical-alerts-entitlement/)
3. **Submit**:
   ```bash
   eas submit --platform ios --latest
   ```

#### Google Play Store

1. **Create service account** in Google Cloud Console
2. **Download JSON key** → save as `google-service-account.json`
3. **Configure `eas.json`** with service account path
4. **Submit**:
   ```bash
   eas submit --platform android --latest
   ```

---

## 🔐 Security

- ✅ **Encrypted Storage**: MMKV with encryption key
- ✅ **No Hardcoded Secrets**: All tokens via environment variables
- ✅ **No Console Logs**: Removed in production builds
- ✅ **Secure Permissions**: Android battery optimization + exact alarms
- ✅ **Error Tracking**: Sentry for production monitoring

---

## 🌍 Internationalization

Supported languages:

- 🇺🇸 English
- 🇧🇷 Portuguese
- 🇪🇸 Spanish

Translation files are located in `src/i18n/`.

---

## 📜 Scripts Reference

| Command                  | Description                   |
| ------------------------ | ----------------------------- |
| `npm start`              | Start Expo development server |
| `npm run ios`            | Run on iOS simulator          |
| `npm run android`        | Run on Android emulator       |
| `npm run web`            | Run on web browser            |
| `npm test`               | Run Jest tests                |
| `npm run test:watch`     | Run tests in watch mode       |
| `npm run test:coverage`  | Generate coverage report      |
| `npm run lint`           | Run ESLint                    |
| `npm run lint:fix`       | Fix ESLint errors             |
| `npm run format`         | Format code with Prettier     |
| `npm run maestro`        | Run Maestro E2E tests         |
| `npm run maestro:studio` | Open Maestro Studio           |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit using [Conventional Commits](https://www.conventionalcommits.org/)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is **private** and **proprietary**. All rights reserved.

---

## 🙏 Acknowledgments

- [Expo](https://expo.dev) - For excellent React Native tooling
- [Notifee](https://notifee.app) - For reliable local notifications
- [NativeWind](https://nativewind.dev) - For bringing Tailwind to React Native
- [Reanimated](https://docs.swmansion.com/react-native-reanimated/) - For smooth animations

---

<div align="center">
  
  ### 𝑊𝑎𝑘𝑒 𝑦𝑜𝑢𝑟 𝑚𝑖𝑛𝑑. 𝐸𝑥𝑒𝑐𝑢𝑡𝑒 𝑦𝑜𝑢𝑟 𝑑𝑎𝑦.
  
  Made with ❤️ by [Wallyson Galvão](https://github.com/WallysonGalvao)
  
</div>
