#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const MANIFEST_REL = 'profile-al-development/.claude-plugin/plugin.json';
const MANIFEST_PATH = resolve(process.cwd(), MANIFEST_REL);

if (!existsSync(MANIFEST_PATH)) {
  process.exit(0);
}

// 1. Retrieve staged files from git index
let staged = [];
try {
  const output = execSync('git diff --cached --name-only', { encoding: 'utf8' });
  staged = output
    .trim()
    .split(/\r?\n/)
    .map((f) => f.replace(/\\/g, '/'))
    .filter(Boolean);
} catch {
  process.exit(0);
}

if (staged.length === 0) {
  process.exit(0);
}

// 2. Determine if any plugin-related files are staged
const isPluginFile = (f) =>
  (f.startsWith('profile-al-development/') || f === 'CLAUDE.md') &&
  f !== MANIFEST_REL &&
  !f.endsWith('README.md') &&
  !f.endsWith('.gitignore');

const hasPluginChanges = staged.some(isPluginFile);

if (!hasPluginChanges) {
  process.exit(0);
}

// 3. Check if plugin.json is already staged (manual bump)
const isManifestStaged = staged.includes(MANIFEST_REL);

if (isManifestStaged) {
  console.log('[pre-commit] plugin.json version bump detected in commit (manual bump preserved).');
  process.exit(0);
}

// 4. Auto-bump patch version if manifest was not explicitly modified
try {
  const content = readFileSync(MANIFEST_PATH, 'utf8');
  const pkg = JSON.parse(content);
  const oldVersion = pkg.version || '0.0.0';
  const parts = oldVersion.split('.').map(Number);

  if (parts.length >= 3 && !parts.some(isNaN)) {
    parts[2] += 1;
    pkg.version = parts.join('.');
  } else {
    pkg.version = `${oldVersion}.1`;
  }

  writeFileSync(MANIFEST_PATH, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  execSync(`git add "${MANIFEST_REL}"`);
  console.log(`[pre-commit] ⚡ Auto-bumped profile-al-development version: ${oldVersion} -> ${pkg.version} (patch)`);
} catch (err) {
  console.error('[pre-commit ERROR] Failed to auto-bump plugin version:', err.message);
  process.exit(1);
}
