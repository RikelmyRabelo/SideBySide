// backend/src/__tests__/prisma-schema-indices.test.ts
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

describe('Prisma Schema Structural Indices', () => {
  it('deve conter índices estruturais nas tabelas principais', () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const schemaPath = path.resolve(__dirname, '../../prisma/schema.prisma');
    const schemaContent = fs.readFileSync(schemaPath, 'utf-8');

    expect(schemaContent).toContain('@@index([userId])');
    expect(schemaContent).toContain('@@index([friendId])');
    expect(schemaContent).toContain('@@index([status])');
    expect(schemaContent).toContain('@@index([senderId])');
    expect(schemaContent).toContain('@@index([recipientId])');
    expect(schemaContent).toContain('@@index([reportedUserId])');
  });
});