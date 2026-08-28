import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcrypt';

async function main() {
  // 1. Limpa o estado anterior para garantir um ambiente E2E limpo
  await prisma.friendRelation.deleteMany();
  await prisma.directMessage.deleteMany();

  const passwordHash = await bcrypt.hash('senha123', 10);

  const userA = await prisma.user.upsert({
    where: { email: 'userA@teste.com' },
    update: { tag: 'UserA#1111' },
    create: {
      id: '11110000-0000-4000-8000-000000000000',
      name: 'User A',
      email: 'userA@teste.com',
      password: passwordHash,
      tag: 'UserA#1111',
      level: 'B1',
      reputation: 100,
    },
  });

  const userB = await prisma.user.upsert({
    where: { email: 'userB@teste.com' },
    update: { tag: 'UserB#1234' },
    create: {
      id: '12340000-0000-4000-8000-000000000000',
      name: 'User B',
      email: 'userB@teste.com',
      password: passwordHash,
      tag: 'UserB#1234',
      level: 'B1',
      reputation: 100,
    },
  });

  console.log(`Usuários prontos: ${userA.tag} e ${userB.tag}`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());