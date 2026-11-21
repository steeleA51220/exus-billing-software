/**
 * start.js — Launcher script for Sri Kumaran Agencies Billing
 * Ensures ELECTRON_RUN_AS_NODE is stripped from the environment before
 * launching Electron, preventing VS Code terminal inheritance issues.
 */

const { spawn } = require('child_process');
const path = require('path');
const electron = require('electron');

const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

const child = spawn(electron, ['.'], {
  stdio: 'inherit',
  env: env,
  windowsHide: false
});

child.on('close', (code) => {
  process.exit(code || 0);
});
