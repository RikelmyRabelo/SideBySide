import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const backendEnvPath = path.resolve(process.cwd(), 'backend', '.env');

if (process.env.CI !== 'true' && fs.existsSync(backendEnvPath)) {
  dotenv.config({
    path: backendEnvPath,
    override: false,
  });
}

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  testIgnore: ['**/*.test.ts', '**/backend/**'],

  fullyParallel: true,
  forbidOnly: false,
  retries: 0,
  workers: undefined,

  reporter: 'html',

  globalSetup: './e2e/global-setup.ts',

  webServer: [
    {
      command:
        'npx prisma generate --schema=prisma/schema.prisma && npm run dev',
      cwd: './backend',

      url: 'http://localhost:3000/health',

      reuseExistingServer: true,
      timeout: 120000,

      stdout: 'pipe',
      stderr: 'pipe',

      env: {
        NODE_ENV: 'test',
        E2E_TEST: 'true',

        DATABASE_URL: process.env.DATABASE_URL || '',

        JWT_SECRET:
          process.env.JWT_SECRET ||
          'integration-test-secret-with-at-least-32-chars',

        REDIS_URL:
          process.env.REDIS_URL || 'redis://localhost:6379',
      },
    },

    {
      command: 'npx tsx src/sockets/server-ws.ts',
      cwd: './backend',

      url: 'http://localhost:3001/health/ready',

      reuseExistingServer: true,
      timeout: 120000,

      stdout: 'pipe',
      stderr: 'pipe',

      env: {
        NODE_ENV: 'test',
        E2E_TEST: 'true',

        DATABASE_URL: process.env.DATABASE_URL || '',

        JWT_SECRET:
          process.env.JWT_SECRET ||
          'integration-test-secret-with-at-least-32-chars',

        REDIS_URL:
          process.env.REDIS_URL || 'redis://localhost:6379',

        WS_PORT: '3001',
      },
    },

    {
      command: 'npm run dev:frontend -- --host 0.0.0.0',
      cwd: '.',

      url: 'http://localhost:5173',

      reuseExistingServer: true,
      timeout: 120000,

      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
});