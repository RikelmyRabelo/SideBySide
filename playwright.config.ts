import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const backendEnvPath = path.resolve(
  process.cwd(),
  'backend',
  '.env',
);

/**
 * Carrega o .env local somente fora do CI.
 *
 * No GitHub Actions, DATABASE_URL, JWT_SECRET e REDIS_URL
 * são fornecidos pelo próprio ambiente do workflow.
 */
if (
  process.env.CI !== 'true' &&
  fs.existsSync(backendEnvPath)
) {
  dotenv.config({
    path: backendEnvPath,
    override: false,
  });
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL não está configurada antes da inicialização do Playwright.',
  );
}

const jwtSecret =
  process.env.JWT_SECRET ||
  'integration-test-secret-with-at-least-32-chars';

const redisUrl =
  process.env.REDIS_URL ||
  'redis://localhost:6379';

/**
 * Ambiente utilizado pelos processos do backend.
 *
 * Não usamos ...process.env aqui porque o tipo de
 * process.env é Record<string, string | undefined>,
 * enquanto o Playwright exige Record<string, string>.
 */
const backendEnv = {
  NODE_ENV: 'test',
  E2E_TEST: 'true',
  DATABASE_URL: databaseUrl,
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
    /**
     * Backend HTTP
     *
     * Primeiro gera o Prisma Client e depois inicia
     * o servidor HTTP na porta 3000.
     */
    {
      command:
        'npx prisma generate --schema=prisma/schema.prisma && npm run dev',

      cwd: './backend',

      url: 'http://localhost:3000/health',

      reuseExistingServer: true,

      timeout: 120000,

      stdout: 'pipe',

      stderr: 'pipe',

      env: backendEnv,
    },

    /**
     * Servidor WebSocket / Socket.IO
     */
    {
      command:
        'npx tsx src/sockets/server-ws.ts',

      cwd: './backend',

      url: 'http://localhost:3001/health/ready',

      reuseExistingServer: true,

      timeout: 120000,

      stdout: 'pipe',

      stderr: 'pipe',

      env: {
        ...backendEnv,
        WS_PORT: '3001',
      },
    },

    /**
     * Frontend Vite
     */
    {
      command:
        'npm run dev:frontend -- --host 0.0.0.0',

      cwd: '.',

      url: 'http://localhost:5173',

      reuseExistingServer: true,

      timeout: 120000,

      stdout: 'pipe',

      stderr: 'pipe',
    },
  ],
});