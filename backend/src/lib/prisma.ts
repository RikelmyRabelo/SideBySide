import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import type { PrismaClient as PrismaClientType } from '@prisma/client';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { PrismaClient } = require('@prisma/client') as { PrismaClient: typeof PrismaClientType };
const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });