/**
 * GitArmor AI - Screenshot Automation Runner
 * Executes python capture_screenshots.py using Playwright
 */
const { execSync } = require('child_process');
const path = require('path');

console.log('Starting GitArmor AI Screenshot Capture via Playwright...');
try {
  execSync('python capture_screenshots.py', {
    stdio: 'inherit',
    cwd: __dirname
  });
  console.log('Screenshots captured successfully in public/screenshots/');
} catch (err) {
  console.error('Failed to run screenshot automation:', err.message);
  process.exit(1);
}
