import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const resultDir = process.env.TEST_RESULT_DIR || 'test_result/playwright';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  outputDir: path.join(resultDir, 'artifacts'),
  reporter: [['html', { outputFolder: path.join(resultDir, 'html-report'), open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:3000',
    ...devices['Desktop Chrome'],
    viewport: { width: 1600, height: 900 },
    trace: 'on',
    video: 'on',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --hostname 127.0.0.1 --port 3000',
    url: 'http://127.0.0.1:3000/crazy-chess-project',
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
    timeout: 120_000,
  },
});
