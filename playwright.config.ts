import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const backendEnvPath = path.resolve(
  process.cwd(),
  'backend',
  '.env',
);

if (fs.existsSync(backendEnvPath)) {
  dotenv.config({
    path: backendEnvPath,
    override: false,
  });
}

/**
 * Preserva todas as variáveis de ambiente disponíveis
 * no processo atual, removendo apenas valores undefined.
 */
const inheritedEnv: Record<string, string> =
  Object.fromEntries(
    Object.entries(process.env).filter(
      (entry): entry is [string, string] =>
        typeof entry[1] === 'string',
    ),
  );

// 1. Fallbacks seguros caso as variáveis venham vazias do CI
const databaseUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgrespassword@localhost:5432/testdb?schema=public';

const jwtSecret =
  process.env.JWT_SECRET ||
  'integration-test-secret-with-at-least-32-chars';

const redisUrl =
  process.env.REDIS_URL ||
  'redis://127.0.0.1:6379';

// Garante no processo principal do Node
process.env.DATABASE_URL = databaseUrl;
process.env.JWT_SECRET = jwtSecret;
process.env.REDIS_URL = redisUrl;

const backendEnv: Record<string, string> = {
  ...inheritedEnv,

  NODE_ENV: 'test',

  E2E_TEST: 'true',

  DATABASE_URL: databaseUrl, // <--- AGORA O WEBSERVER RECEBE A DATABASE_URL!

  JWT_SECRET: jwtSecret,

  REDIS_URL: redisUrl,
};

export default defineConfig({
  testDir: './e2e',

  testMatch: '**/*.spec.ts',

  testIgnore: [
    '**/*.test.ts',
    '**/backend/**',
  ],

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

      reuseExistingServer: !process.env.CI,

      timeout: 120000,

      stdout: 'pipe',

      stderr: 'pipe',

      env: backendEnv,
    },

    {
      command:
        'npx tsx src/sockets/server-ws.ts',

      cwd: './backend',

      url: 'http://localhost:3001/health/ready',

      reuseExistingServer: !process.env.CI,

      timeout: 120000,

      stdout: 'pipe',

      stderr: 'pipe',

      env: {
        ...backendEnv,

        WS_PORT: '3001',
      },
    },

    {
      command:
        'npm run dev:frontend -- --host 0.0.0.0',

      cwd: '.',

      url: 'http://localhost:5173',

      reuseExistingServer: !process.env.CI,

      timeout: 120000,

      stdout: 'pipe',

      stderr: 'pipe',
    },
  ],
});