import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/pages',
  workers: 1,
  retries: 0,
  timeout: 45000,
  expect: { timeout: 15000 },
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://127.0.0.1:5175/tree-flow-demo/',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run preview -- --port 5175 --strictPort --base=/tree-flow-demo/',
    url: 'http://127.0.0.1:5175/tree-flow-demo/',
    reuseExistingServer: false,
  },
});
