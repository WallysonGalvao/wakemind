# WakeMind - Git Workflow

## 🌳 Branch Strategy

### Branches

- **`main`** - Production branch (auto-deploys via EAS Update)
- **`develop`** - Development/experimental branch (manual testing)
- **`feature/*`** - Feature branches (created from `main`)

### Workflow

```
1. Create feature branch from main
   git checkout main
   git pull
   git checkout -b feature/alarm-snooze

2. Develop and commit
   git add .
   git commit -m "feat: add snooze functionality"

3. Push and create PR to main
   git push -u origin feature/alarm-snooze
   (Create PR on GitHub)

4. Merge to main → Auto-deploy via EAS Update
   (CI runs, tests pass, merge PR)

5. Delete feature branch
   git branch -d feature/alarm-snooze
```

### Branch Protection Rules

Configure on GitHub: **Settings > Branches > Add rule**

#### `main` branch:

- ✅ Require pull request before merging
- ✅ Require status checks (CI must pass)
- ✅ Require conversation resolution
- ✅ Do not allow bypassing

#### `develop` branch:

- ✅ Allow force pushes (for experiments)

---

## 🚀 Deployment Strategy

| Branch      | Trigger  | Deploy To      | Purpose     |
| ----------- | -------- | -------------- | ----------- |
| `main`      | Merge PR | EAS Production | Live users  |
| `develop`   | Manual   | EAS Preview    | Testing     |
| `feature/*` | -        | Local only     | Development |

---

## 📋 Conventional Commits

Use conventional commits for automatic changelogs:

```bash
feat: add new alarm sound
fix: resolve notification bug
chore: update dependencies
docs: improve README
refactor: simplify alarm logic
test: add unit tests for scheduler
ci: update GitHub Actions workflow
```

---

## 🔄 EAS Updates

```bash
# Production (from main)
git checkout main
git pull
eas update --branch production --message "Bug fixes"

# Development (from develop)
git checkout develop
eas update --branch preview --message "Testing new feature"
```

---

## 🆘 Emergency Hotfix

```bash
# Create hotfix branch from main
git checkout main
git pull
git checkout -b hotfix/critical-bug

# Fix and commit
git add .
git commit -m "fix: resolve critical alarm bug"

# Push and create emergency PR
git push -u origin hotfix/critical-bug
# Merge immediately after CI passes
```
