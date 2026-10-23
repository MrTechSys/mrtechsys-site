#!/usr/bin/env node
// scripts/session-manager.mjs
/**
 * MrTechSys Session Continuity & Engineering State Manager
 * Deterministic Git telemetry, secret scrubbing, path hygiene,
 * and TOL-Core kernel integration.
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tolCore } from './tolCoreClient.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

const HANDOFF_DIR = path.join(REPO_ROOT, 'handoff');
const CHANGELOG_DIR = path.join(REPO_ROOT, 'changelog');

const STATE_FILE = path.join(HANDOFF_DIR, 'session-state.json');
const SUMMARY_FILE = path.join(HANDOFF_DIR, 'handoff-summary.md');
const TODO_FILE = path.join(HANDOFF_DIR, 'todo.md');
const HISTORY_FILE = path.join(CHANGELOG_DIR, 'session-history.md');

// Ensure directories exist
fs.mkdirSync(HANDOFF_DIR, { recursive: true });
fs.mkdirSync(CHANGELOG_DIR, { recursive: true });

function runGit(cmd) {
  try {
    return execSync(cmd, { cwd: REPO_ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
  } catch (err) {
    return '';
  }
}

// Secret Scrubber
function scrubSecrets(str) {
  if (!str || typeof str !== 'string') return str;
  return str
    .replace(/(api[_-]?key|secret|token|password|bearer|auth)["']?\s*[:=]\s*["']?([a-zA-Z0-9_\-\.]{8,})["']?/gi, '$1: "[REDACTED SECRET]"')
    .replace(/ghp_[a-zA-Z0-9]{20,}/g, '[REDACTED SECRET]')
    .replace(/sk-[a-zA-Z0-9]{20,}/g, '[REDACTED SECRET]');
}

// Relative Path Sanitizer
function sanitizePath(filePath) {
  if (!filePath) return '';
  if (path.isAbsolute(filePath)) {
    return path.relative(REPO_ROOT, filePath).replace(/\\/g, '/');
  }
  return filePath.replace(/\\/g, '/');
}

function getGitTelemetry() {
  const branch = runGit('git rev-parse --abbrev-ref HEAD') || 'unknown';
  const commit = runGit('git rev-parse HEAD') || 'unknown';
  const shortCommit = runGit('git rev-parse --short HEAD') || 'unknown';
  const commitMsg = runGit('git log -1 --pretty=%B') || '';
  const statusOutput = runGit('git status --porcelain');
  
  const modifiedFiles = [];
  const untrackedFiles = [];
  const stagedFiles = [];

  if (statusOutput) {
    statusOutput.split('\n').filter(Boolean).forEach(line => {
      const status = line.slice(0, 2);
      const rawPath = line.slice(3).trim();
      const cleanPath = sanitizePath(rawPath);
      
      if (status[0] !== ' ' && status[0] !== '?') stagedFiles.push(cleanPath);
      if (status[1] === 'M' || status[1] === 'D') modifiedFiles.push(cleanPath);
      if (status.includes('?')) untrackedFiles.push(cleanPath);
    });
  }

  const diffStat = runGit('git diff --stat');

  return {
    branch,
    commit,
    shortCommit,
    commitMsg: scrubSecrets(commitMsg.split('\n')[0]),
    workingTreeClean: !statusOutput,
    stagedFiles,
    modifiedFiles,
    untrackedFiles,
    diffStat: scrubSecrets(diffStat)
  };
}

function loadState() {
  if (fs.existsSync(STATE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    } catch {
      return null;
    }
  }
  return null;
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n');
}

// Command: status
async function commandStatus() {
  const telemetry = getGitTelemetry();
  const state = loadState();
  const isHealthy = await tolCore.isHealthy();

  console.log('\n================ MRTECHS ENGINEERING SESSION STATUS ================');
  console.log(`Git Branch:     ${telemetry.branch} (at ${telemetry.shortCommit})`);
  console.log(`Commit Message: ${telemetry.commitMsg}`);
  console.log(`Working Tree:   ${telemetry.workingTreeClean ? 'CLEAN' : 'DIRTY (' + (telemetry.modifiedFiles.length + telemetry.stagedFiles.length + telemetry.untrackedFiles.length) + ' uncommitted changes)'}`);
  console.log(`TOL-Core Kernel: ${isHealthy ? 'ONLINE (http://localhost:4000)' : 'OFFLINE / UNREACHABLE (using local fallback)'}`);

  if (state) {
    console.log(`Session ID:     ${state.sessionId}`);
    console.log(`Session Phase:  ${state.phase || 'IN_PROGRESS'}`);
    console.log(`Last Updated:   ${state.timestamp}`);
    if (state.activeTask) {
      console.log(`Active Task:    ${state.activeTask}`);
    }
  } else {
    console.log(`Session State:  No active session-state.json found. Run "session handoff" or "session checkpoint" to initialize.`);
  }

  if (telemetry.modifiedFiles.length > 0) {
    console.log('\nModified Files:');
    telemetry.modifiedFiles.forEach(f => console.log(`  - ${f}`));
  }
  if (telemetry.untrackedFiles.length > 0) {
    console.log('\nUntracked Files:');
    telemetry.untrackedFiles.forEach(f => console.log(`  + ${f}`));
  }
  console.log('====================================================================\n');
}

// Command: diff
function commandDiff() {
  const state = loadState();
  const baseCommit = state?.baseCommit || 'HEAD~1';
  console.log(`\nDiff compared to session base (${baseCommit}):\n`);
  const diffOutput = runGit(`git diff --stat ${baseCommit}`);
  if (diffOutput) {
    console.log(scrubSecrets(diffOutput));
  } else {
    console.log('No git differences detected against base commit.');
  }
}

// Command: checkpoint / handoff
async function saveSession(isFinalHandoff = false, customNote = '') {
  const telemetry = getGitTelemetry();
  const existingState = loadState() || {};
  const isHealthy = await tolCore.isHealthy();

  const now = new Date();
  const timestampIso = now.toISOString();
  const dateStr = now.toISOString().split('T')[0];
  const sessionId = existingState.sessionId || `session-${dateStr}-${telemetry.shortCommit}`;

  const newState = {
    sessionId,
    timestamp: timestampIso,
    status: isFinalHandoff ? 'COMPLETED' : 'IN_PROGRESS',
    baseCommit: existingState.baseCommit || telemetry.commit,
    currentCommit: telemetry.commit,
    branch: telemetry.branch,
    workingTreeClean: telemetry.workingTreeClean,
    tolCoreKernelOnline: isHealthy,
    activeTask: customNote || existingState.activeTask || 'Continue engineering plan',
    modifiedFiles: telemetry.modifiedFiles,
    stagedFiles: telemetry.stagedFiles,
    untrackedFiles: telemetry.untrackedFiles,
    diffStat: telemetry.diffStat
  };

  saveState(newState);

  // Notify TOL-Core if healthy
  if (isHealthy) {
    try {
      await tolCore.triggerJob('session-checkpoint', {
        runtimeParams: { sessionId, isFinalHandoff, note: customNote }
      }).catch(() => {});
    } catch {}
  }

  console.log(`\n[OK] ${isFinalHandoff ? 'Handoff generated' : 'Checkpoint saved'} for ${sessionId}`);
  console.log(`State file: ${path.relative(REPO_ROOT, STATE_FILE)}`);
}

// CLI Router
const [,, command, ...args] = process.argv;

switch (command) {
  case 'status':
    await commandStatus();
    break;
  case 'diff':
    commandDiff();
    break;
  case 'checkpoint':
    await saveSession(false, args.join(' '));
    break;
  case 'handoff':
    await saveSession(true, args.join(' '));
    break;
  default:
    console.log(`
MrTechSys Engineering Session Manager
Usage:
  node scripts/session-manager.mjs status               Show current dev session state & telemetry
  node scripts/session-manager.mjs diff                 Show changes since session base commit
  node scripts/session-manager.mjs checkpoint [note]   Save state without closing session
  node scripts/session-manager.mjs handoff [note]      Generate complete verifiable handoff package
`);
    break;
}
