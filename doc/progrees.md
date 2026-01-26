## **Building a Cognitive Alarm Clock App – January Progress Update**

Hey Reddit! I've been working on an alarm clock app designed to help people actually wake up by engaging their brain with cognitive challenges. Thought I'd share the progress from this month.

### **What is it?**

An alarm app that forces you to solve challenges (math, memory, logic) before you can dismiss it. Think of it as a cognitive wake-up system that ensures you're mentally active before turning off the alarm.

Built with React Native (Expo SDK 54), TypeScript, and native notifications (Notifee for Android/iOS critical alerts).

### **January Stats**

- **245 commits** this month
- Version **1.1.0** (up from 1.0.0)
- Core app is feature-complete and stable

### **Major Features Shipped This Month**

**🎮 Gamification & Achievement System**

- Full achievement registry with 50+ unlockable achievements
- Tier-based progression (Bronze → Silver → Gold → Platinum)
- Premium achievements with exclusive rewards
- Achievement history with sectioned views
- 3D Skia-based achievement icons with customizable rendering
- Mindfulness Points (MP) system for unlocking achievements
- Streak tracking with freeze mechanics

**📊 Dashboard Widgets**

- **Snooze Analytics** – Track snooze patterns and identify habits
- **Weekly Heatmap** – Visual calendar of wake-up performance
- **Sleep Quality Tracker** – Monitor sleep consistency
- **Goal Progress** – Daily/weekly completion rates
- **Circadian Rhythm** – Optimal wake time suggestions
- **Morning Routine Tracker** – Post-alarm activity monitoring
- **Streak Freeze** – Protection system for maintaining streaks

**💎 Monetization & Premium**

- RevenueCat integration for subscriptions
- Paywall with feature carousel
- Premium features: hard difficulty challenges, exclusive alarm sounds, premium achievements
- Multi-tier subscription system

**⚙️ Technical Improvements**

- Android build configuration enhancements with expo-build-properties
- Database seeding system for testing
- Performance optimizations for widget rendering
- Enhanced localization (EN, PT-BR, ES)
- Comprehensive error handling and logging

**🎨 UX Refinements**

- Improved paywall layout and performance
- Premium badge styling updates
- Achievement card animations and touchable states
- Better visual hierarchy in dashboard
- Color scheme updates across widgets

### **Tech Stack Highlights**

- **Framework:** Expo 54 + React Native 0.81 (New Architecture)
- **Database:** SQLite with Drizzle ORM
- **State:** Zustand + MMKV (encrypted storage)
- **Styling:** TailwindCSS + NativeWind v4
- **Animations:** Reanimated v4 + React Native Skia
- **Notifications:** Notifee (critical alerts, full-screen intent)
- **Analytics:** Mixpanel + Sentry
- **Subscriptions:** RevenueCat
- **Testing:** Jest + React Native Testing Library + Maestro (E2E)

### **What's Next?**

Currently preparing for:

- Final production build testing
- Store submission (iOS App Store + Google Play)
- Marketing materials and screenshots
- Beta testing program

### **Challenges Faced**

1. **Android Build Issues** – Gradle daemon conflicts and temp directory issues with EAS local builds (still troubleshooting)
2. **iOS Critical Alerts** – Requires Apple approval, temporarily disabled
3. **RevenueCat Integration** – Platform-specific config complexity, simplified to single API key
4. **Performance** – Widget rendering optimization needed careful React.memo and useMemo usage

### **Why I'm Building This**

Standard alarm apps are too easy to dismiss while half-asleep. I wanted something that genuinely ensures you're mentally awake before letting you turn it off. The cognitive challenges combined with gamification creates a compelling habit loop.

### **Ask Me Anything**

Happy to answer questions about the tech stack, design decisions, or building with React Native/Expo in general.
