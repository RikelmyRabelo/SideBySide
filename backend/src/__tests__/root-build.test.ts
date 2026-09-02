// backend/src/__tests__/root-build.test.ts
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

describe('Root Package.json Build Configuration', () => {
  it('deve conter os scripts de build configurados corretamente', () => {
    // Calcula a raiz do projeto de forma estática com base no local deste arquivo
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const rootDir = path.resolve(__dirname, '../../../'); // Retorna de __tests__ -> src -> backend -> raiz

    const packageJsonPath = path.resolve(rootDir, 'package.json');
    const packageJsonContent = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    expect(packageJsonContent.scripts).toHaveProperty('build');
    expect(packageJsonContent.scripts).toHaveProperty('build:backend');
    expect(packageJsonContent.scripts).toHaveProperty('build:frontend');
    expect(packageJsonContent.scripts.build).toBe('npm run build:backend && npm run build:frontend');
  });
});