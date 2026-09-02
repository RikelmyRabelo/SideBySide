// backend/src/__tests__/root-build.test.ts
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Root Package.json Build Configuration', () => {
  const rootDir = path.resolve(process.cwd(), '..');

  it('deve conter os scripts de build configurados corretamente', () => {
    const packageJsonPath = path.resolve(rootDir, 'package.json');
    const packageJsonContent = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    expect(packageJsonContent.scripts).toHaveProperty('build');
    expect(packageJsonContent.scripts).toHaveProperty('build:backend');
    expect(packageJsonContent.scripts).toHaveProperty('build:frontend');
    expect(packageJsonContent.scripts.build).toBe('npm run build:backend && npm run build:frontend');
  });
});