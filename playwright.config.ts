import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  testIgnore: ['**/*.test.ts', '**/backend/**'],
  fullyParallel: true,
  forbidOnly: false,
  retries: 0,
  workers: undefined,
  reporter: 'html',
  webServer: [
    {
      command: 'npx prisma generate --schema=prisma/schema.prisma && npm run dev',
      cwd: './backend',
      url: 'http://localhost:3000/health',
      reuseExistingServer: true,
      timeout: 120000,
    },
    {
      command: 'npm run dev -- --host 0.0.0.0',
      cwd: '.',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 120000,
    },
  ],
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],
});