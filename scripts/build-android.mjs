#!/usr/bin/env node
/**
 * Builds the Android APK for Wayfare.
 *
 * WHY A SCRIPT AND NOT AN NPM SCRIPT
 *
 * `expo prebuild` generates the `android/` project, and the APK is
 * then produced by Gradle. The two steps have to run in order, and the
 * Gradle wrapper is `gradlew.bat` on Windows but `./gradlew` everywhere
 * else. Spelling that out in a cross-platform npm script is possible
 * but ugly, so it lives here instead and the npm scripts just call
 * this file.
 *
 * USAGE
 *
 *   npm run build:apk              debug APK
 *   npm run build:apk -- --release release APK
 *   npm run build:apk -- --no-prebuild   reuse the existing android/
 *
 * The Google Maps API key is read from `.env` by `app.config.ts`
 * DURING the prebuild step, so `.env` must exist before this script
 * runs if you want the map to render real tiles. Without a key the
 * app still builds and installs; the map area simply shows Google's
 * grey authorisation-failure canvas instead of tiles.
 */

import {spawnSync} from 'node:child_process';
import {copyFileSync, existsSync, mkdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ANDROID_DIR = join(ROOT, 'android');
const ARTIFACTS_DIR = join(ROOT, 'artifacts');

const args = process.argv.slice(2);
const variant = args.includes('--release') ? 'release' : 'debug';
const skipPrebuild = args.includes('--no-prebuild');

/**
 * Runs a command and exits the process if it fails, so the first
 * broken step never silently produces a half-built APK.
 */
function run(command, commandArgs, cwd) {
  console.log(`\n> ${command} ${commandArgs.join(' ')}\n`);

  const result = spawnSync(command, commandArgs, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: process.env,
  });

  if (result.error) {
    console.error(`\nFailed to run "${command}":`, result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(`\n"${command}" exited with code ${result.status}.`);
    process.exit(result.status ?? 1);
  }
}

// ── Step 1 — generate (or refresh) the native Android project ──

if (!skipPrebuild) {
  run('npx', ['expo', 'prebuild', '--platform', 'android', '--no-install'], ROOT);
} else if (!existsSync(ANDROID_DIR)) {
  console.error(
    '\n--no-prebuild was passed but there is no android/ directory. ' +
      'Run the prebuild step first.\n',
  );
  process.exit(1);
}

// ── Step 2 — hand the project to Gradle ──

const gradlew = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
const gradleTask = variant === 'release' ? 'assembleRelease' : 'assembleDebug';

run(gradlew, [gradleTask, '--console=plain'], ANDROID_DIR);

// ── Step 3 — find the APK and copy it somewhere obvious ──

const apkDir = join(ANDROID_DIR, 'app', 'build', 'outputs', 'apk', variant);
const apkPath = join(apkDir, `app-${variant}.apk`);

if (!existsSync(apkPath)) {
  console.error(`\nGradle reported success but ${apkPath} does not exist.`);
  console.error(`Look in ${apkDir} for the APK.`);
  process.exit(1);
}

if (!existsSync(ARTIFACTS_DIR)) {
  mkdirSync(ARTIFACTS_DIR, {recursive: true});
}

const artifact = join(ARTIFACTS_DIR, `wayfare-${variant}.apk`);
copyFileSync(apkPath, artifact);

console.log(`\nAPK ready:\n  ${artifact}\n`);
console.log(
  'Install it with:\n' +
    '  adb install -r "' +
    artifact +
    '"\n',
);
