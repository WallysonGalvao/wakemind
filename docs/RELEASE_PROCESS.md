# WakeMind - Release Process

## 🚀 Automated Release Flow

### Prerequisites

1. **EAS configured** with store credentials:

   ```bash
   eas credentials
   ```

2. **GitHub secrets** configured:
   - `EXPO_TOKEN` - EAS authentication token
   - `GITHUB_TOKEN` - Auto-configured by GitHub Actions

---

## 📋 Release Steps

### Option A: Using Release Script (Recommended) ⭐

```bash
# Simple one-command release
npm run release 1.1.0

# Or specify build numbers manually
npm run release 1.1.0 -- --ios-build 5 --android-build 10
```

The script will automatically:

- ✅ Update `package.json` version
- ✅ Update `app.config.ts` version, buildNumber, versionCode
- ✅ Auto-increment build numbers (iOS +1, Android +1)
- ✅ Create git commit
- ✅ Create git tag `v1.1.0`
- ✅ Push to GitHub (triggers release workflow)

### Option B: Manual Release

### 1. Update Version

Edit `app.config.ts`:

```typescript
version: '1.1.0',        // User-facing version
ios: {
  buildNumber: '2',      // Increment for each iOS build
},
android: {
  versionCode: 2,        // Increment for each Android build
}
```

### 2. Update Changelog (Optional)

Create/update `CHANGELOG.md`:

```markdown
## [1.1.0] - 2026-01-17

### Added

- Alarm volume slider
- Volume lock during alarm

### Fixed

- Audio player crash on dismissal
- Notification action buttons
```

### 3. Commit & Push

```bash
git add app.config.ts CHANGELOG.md
git commit -m "chore: bump version to 1.1.0"
git push origin main
```

### 4. Create Release Tag

```bash
git tag v1.1.0
git push origin v1.1.0
```

**🎉 That's it!** GitHub Actions will:

- ✅ Build Android & iOS production builds
- ✅ Submit to Google Play Store
- ✅ Submit to Apple App Store
- ✅ Create GitHub Release with notes

---

## 🔍 Monitor Progress

1. **GitHub Actions**: `https://github.com/WallysonGalvao/wakemind/actions`
2. **EAS Builds**: `https://expo.dev/accounts/wallyson/projects/wakemind/builds`
3. **Play Console**: Check for new review
4. **App Store Connect**: Check for new build

---

## 🆘 Manual Release (Fallback)

If automation fails:

```bash
# Build
eas build --platform all --profile production

# Submit
eas submit --platform android --latest
eas submit --platform ios --latest
```

---

## 📝 Version Numbering

Follow **Semantic Versioning** (semver):

- `MAJOR.MINOR.PATCH` (e.g., `1.2.3`)
  - **MAJOR**: Breaking changes
  - **MINOR**: New features (backward compatible)
  - **PATCH**: Bug fixes

**iOS buildNumber & Android versionCode**:

- Increment by 1 for every release
- Never reuse a number
- Independent of version string

---

## ⚠️ Important Notes

1. **Store Review Times**:
   - Google Play: ~1-3 days
   - App Store: ~1-7 days

2. **EAS Build Credits**:
   - Each release uses 2 builds (Android + iOS)
   - Check remaining credits: `eas build:list`

3. **Rollback**:
   - Google Play: Promote previous version
   - iOS: Remove current build, submit previous

---

## 🎯 Best Practices

- ✅ Test thoroughly before creating tag
- ✅ Create tags only from `main` branch
- ✅ Use meaningful release notes
- ✅ Increment build numbers consistently
- ✅ Keep changelog updated
