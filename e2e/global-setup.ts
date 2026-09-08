import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

import { fileURLToPath } from 'url';

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

import pg from 'pg';
import bcrypt from 'bcrypt';

import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendEnvPath = path.join(
  __dirname,
  '../backend/.env',
);

if (process.env.CI !== 'true' && fs.existsSync(backendEnvPath)) {
  dotenv.config({
    path: backendEnvPath,
    override: false,
  });
}

if (process.env.CI !== 'true') {
  dotenv.config({
    override: false,
  });
}

export default async function globalSetup() {
  let connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL não está definida nas variáveis de ambiente.',
    );
  }

  connectionString = connectionString
    .replace(':6543', ':5432')
    .replace('?pgbouncer=true', '');

  console.log(
    '\n🔄 Sincronizando o banco de dados de teste (Prisma Push)...',
  );

  try {
    execSync(
      'npx prisma db push --accept-data-loss',
      {
        cwd: path.join(
          __dirname,
          '../backend',
        ),

        env: {
          ...process.env,
          DATABASE_URL: connectionString,
        },

        stdio: 'inherit',
      },
    );
  } catch (err) {
    console.error(
      '❌ Erro ao sincronizar o schema:',
      err,
    );
  }

  const pool = new pg.Pool({
    connectionString,
  });

  const adapter = new PrismaPg(pool);

  const prisma = new PrismaClient({
    adapter,
  });

  const hashedPassword = await bcrypt.hash(
    'senha123',
    10,
  );

  const testUsers = [
    {
      email: 'userA@teste.com',
      name: 'User A',
      tag: 'UserA#1234',
    },
    {
      email: 'userB@teste.com',
      name: 'User B',
      tag: 'UserB#1234',
    },
  ];

  console.log(
    '👥 Criando usuários de teste...',
  );

  for (const userData of testUsers) {
    try {
      await prisma.user.upsert({
        where: {
          email: userData.email,
        },

        update: {
          password: hashedPassword,
        },

        create: {
          email: userData.email,
          name: userData.name,
          password: hashedPassword,
          level: 'B1',
          tag: userData.tag,
          reputation: 100,
        },
      });
    } catch (error) {
      console.error(
        `❌ Erro ao inserir usuário de teste ${userData.email}:`,
        error,
      );

      throw error;
    }
  }

  await prisma.$disconnect();

  await pool.end();
}