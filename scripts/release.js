#!/usr/bin/env node

/**
 * WakeMind Release Automation Script
 *
 * Updates version across project files, commits changes, creates a git tag,
 * and pushes everything to trigger GitHub Actions release workflow.
 *
 * Usage:
 *   node scripts/release.js                    # Auto-determine version from git history
 *   node scripts/release.js <version>          # Specify version manually
 *   node scripts/release.js [version] --ios-build N --android-build N
 *
 * Version Auto-Detection (Conventional Commits):
 *   - feat: commits -> minor bump (0.X.0)
 *   - fix:, perf: commits -> patch bump (0.0.X)
 *   - BREAKING CHANGE: or feat! -> major bump (X.0.0)
 *
 * Examples:
 *   node scripts/release.js                    # 1.0.0 -> 1.0.1 (based on commits)
 *   node scripts/release.js 1.1.0              # Force version to 1.1.0
 *   node scripts/release.js --ios-build 5      # Auto version + custom iOS build
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, '..');

// Configuration: files that need version updates
const VERSION_FILES = [
  {
    path: 'package.json',
    update: (content, version) => {
      const json = JSON.parse(content);
      json.version = version;
      return JSON.stringify(json, null, 2) + '\n';
    },
  },
  {
    path: 'app.config.ts',
    update: (content, version, buildNumbers) => {
      // Update version string
      content = content.replace(/version: '[^']+'/m, `version: '${version}'`);

      // Update iOS buildNumber if provided
      if (buildNumbers.ios) {
        content = content.replace(/buildNumber: '[^']+'/m, `buildNumber: '${buildNumbers.ios}'`);
      }

      // Update Android versionCode if provided
      if (buildNumbers.android) {
        content = content.replace(/versionCode: \d+/m, `versionCode: ${buildNumbers.android}`);
      }

      return content;
    },
  },
];

/**
 * Executes a shell command and logs it
 */
function run(command, silent = false) {
  if (!silent) {
    console.log(`\n→ ${command}`);
  }
  try {
    return execSync(command, {
      encoding: 'utf-8',
      stdio: silent ? 'pipe' : 'inherit',
      cwd: ROOT_DIR,
    });
  } catch (error) {
    if (!silent) {
      console.error(`\n✗ Command failed: ${command}`);
      process.exit(1);
    }
    return null;
  }
}

/**
 * Validates version format (semver)
 */
function validateVersion(version) {
  const semverRegex = /^\d+\.\d+\.\d+(-[\w.]+)?$/;
  if (!semverRegex.test(version)) {
    console.error(`\n✗ Invalid version format: ${version}`);
    console.error('  Expected format: X.Y.Z (e.g., 1.0.0, 1.1.0-beta.1)');
    process.exit(1);
  }
}

/**
 * Checks if working directory is clean
 */
function checkGitStatus() {
  const status = run('git status --porcelain', true);
  if (status.trim()) {
    console.error('\n✗ Working directory is not clean. Please commit or stash changes first.');
    console.error('\nUncommitted changes:');
    console.error(status);
    process.exit(1);
  }
}

/**
 * Gets the current version from package.json
 */
function getCurrentVersion() {
  const packagePath = resolve(ROOT_DIR, 'package.json');
  const content = readFileSync(packagePath, 'utf-8');
  const json = JSON.parse(content);
  return json.version || '0.0.0';
}

/**
 * Gets the latest git tag version
 */
function getLatestGitTag() {
  const tag = run('git describe --tags --abbrev=0', true);
  if (!tag) {
    return null;
  }
  return tag.trim().replace(/^v/, ''); // Remove 'v' prefix if present
}

/**
 * Gets commits since the last tag
 */
function getCommitsSinceLastTag() {
  const lastTag = getLatestGitTag();
  const range = lastTag ? `${lastTag}..HEAD` : '';
  const commits = run(`git log ${range} --pretty=format:"%s"`, true);

  if (!commits) {
    return [];
  }

  return commits.trim().split('\n').filter(Boolean);
}

/**
 * Analyzes commits to determine version bump type
 * Uses Conventional Commits specification
 */
function analyzeCommits(commits) {
  let hasMajor = false;
  let hasMinor = false;
  let hasPatch = false;

  for (const commit of commits) {
    // Check for breaking changes (major)
    if (
      commit.includes('BREAKING CHANGE:') ||
      commit.match(/^[^:]+!:/) // feat!, fix!, etc.
    ) {
      hasMajor = true;
      continue;
    }

    // Check for features (minor)
    if (commit.match(/^feat(\([^)]+\))?:/)) {
      hasMinor = true;
      continue;
    }

    // Check for fixes, perf, etc. (patch)
    if (commit.match(/^(fix|perf|refactor|docs|style|test|chore)(\([^)]+\))?:/)) {
      hasPatch = true;
    }
  }

  if (hasMajor) return 'major';
  if (hasMinor) return 'minor';
  if (hasPatch) return 'patch';
  return 'patch'; // Default to patch if no conventional commits found
}

/**
 * Increments version based on bump type
 */
function incrementVersion(version, bumpType) {
  const [major, minor, patch] = version.split('.').map((n) => parseInt(n, 10));

  switch (bumpType) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
    default:
      return `${major}.${minor}.${patch + 1}`;
  }
}

/**
 * Automatically determines next version based on git history
 */
function determineNextVersion() {
  console.log('\n🔍 Analyzing git history...');

  const currentVersion = getCurrentVersion();
  console.log(`   Current version: ${currentVersion}`);

  const lastTag = getLatestGitTag();
  if (!lastTag) {
    console.log('   No tags found - analyzing all commits');
  } else {
    console.log(`   Last tag: v${lastTag}`);
  }

  const commits = getCommitsSinceLastTag();
  if (commits.length === 0) {
    console.log('\n⚠️  No commits since last tag. Version will not change.');
    return currentVersion;
  }

  console.log(`   Found ${commits.length} commit(s)${lastTag ? ' since last tag' : ''}:`);
  commits.slice(0, 5).forEach((commit) => {
    console.log(`     • ${commit}`);
  });
  if (commits.length > 5) {
    console.log(`     ... and ${commits.length - 5} more`);
  }

  const bumpType = analyzeCommits(commits);
  const nextVersion = incrementVersion(currentVersion, bumpType);

  console.log(`\n   Bump type: ${bumpType.toUpperCase()}`);
  console.log(`   Next version: ${nextVersion}`);

  return nextVersion;
}

/**
 * Extracts current build numbers from app.config.ts
 */
function getCurrentBuildNumbers() {
  const appConfigPath = resolve(ROOT_DIR, 'app.config.ts');
  const content = readFileSync(appConfigPath, 'utf-8');

  const iosBuildMatch = content.match(/buildNumber: '(\d+)'/);
  const androidCodeMatch = content.match(/versionCode: (\d+)/);

  return {
    ios: iosBuildMatch ? parseInt(iosBuildMatch[1], 10) : 1,
    android: androidCodeMatch ? parseInt(androidCodeMatch[1], 10) : 1,
  };
}

/**
 * Updates version in all configured files
 */
function updateVersionFiles(version, buildNumbers) {
  console.log('\n📝 Updating version files...');

  for (const file of VERSION_FILES) {
    const filePath = resolve(ROOT_DIR, file.path);

    try {
      const content = readFileSync(filePath, 'utf-8');
      const updated = file.update(content, version, buildNumbers);
      writeFileSync(filePath, updated, 'utf-8');
      console.log(`   ✓ ${file.path}`);
    } catch (error) {
      console.error(`\n✗ Failed to update ${file.path}:`, error.message);
      process.exit(1);
    }
  }
}

/**
 * Main release process
 */
function release(version, options = {}) {
  console.log('\n🚀 Starting WakeMind release process...');
  console.log(`   Version: ${version}`);

  // Step 1: Validate version format
  validateVersion(version);

  // Step 2: Check git status
  console.log('\n🔍 Checking git status...');
  checkGitStatus();

  // Step 3: Get current build numbers and increment
  const currentBuildNumbers = getCurrentBuildNumbers();
  const buildNumbers = {
    ios: options.iosBuild || currentBuildNumbers.ios + 1,
    android: options.androidBuild || currentBuildNumbers.android + 1,
  };

  console.log(`\n📱 Build numbers:`);
  console.log(`   iOS: ${buildNumbers.ios}`);
  console.log(`   Android: ${buildNumbers.android}`);

  // Step 4: Update version files
  updateVersionFiles(version, buildNumbers);

  // Step 5: Stage changes
  console.log('\n📦 Staging changes...');
  VERSION_FILES.forEach((file) => {
    run(`git add ${file.path}`, true);
  });

  // Step 6: Commit changes
  console.log('\n💾 Creating commit...');
  run(`git commit -m "chore: bump version to ${version}"`);

  // Step 7: Create tag
  console.log('\n🏷️  Creating tag...');
  const tag = `v${version}`;
  run(`git tag ${tag}`);

  // Step 8: Push commit and tag
  console.log('\n⬆️  Pushing to remote...');
  run('git push');
  run(`git push origin ${tag}`);

  console.log('\n✅ Release completed successfully!');
  console.log(`   Tag: ${tag}`);
  console.log(`   iOS Build: ${buildNumbers.ios}`);
  console.log(`   Android Build: ${buildNumbers.android}`);
  console.log(`\n🚀 GitHub Actions will now:`);
  console.log(`   1. Build production apps`);
  console.log(`   2. Submit to App Store & Play Store`);
  console.log(`   3. Create GitHub Release\n`);
}

// Parse CLI arguments
const args = process.argv.slice(2);

// If no version provided, determine it automatically
let version;
if (args.length === 0 || args[0].startsWith('--')) {
  version = determineNextVersion();
  console.log(`\n✨ Auto-determined version: ${version}`);

  // If user provided flags but no version, they should be at the start
  if (args.length > 0) {
    args.unshift(version);
  }
} else {
  version = args[0];
}

const options = {};

// Parse optional build number flags
for (let i = 1; i < args.length; i += 2) {
  if (args[i] === '--ios-build' && args[i + 1]) {
    options.iosBuild = parseInt(args[i + 1], 10);
  } else if (args[i] === '--android-build' && args[i + 1]) {
    options.androidBuild = parseInt(args[i + 1], 10);
  }
}

release(version, options);
