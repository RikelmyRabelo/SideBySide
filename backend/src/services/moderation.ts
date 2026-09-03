// backend/src/services/moderation.ts
import { prisma } from '../lib/prisma.js';

export async function processUserReport(userId: string) {
  // Primeiro, buscamos o usuário para verificar o estado atual ou podemos aplicar diretamente com base na contagem atômica
  const currentUser = await (prisma as any).user.findUnique({
    where: { id: userId },
    select: { reportCount: true },
  });

  if (!currentUser) {
    throw new Error('Usuário não encontrado.');
  }

  const currentReports = currentUser.reportCount || 0;
  const projectedReports = currentReports + 1;

  let targetStatus = 'ACTIVE';
  if (projectedReports > 10) {
    targetStatus = 'BANNED';
  } else if (projectedReports > 5) {
    targetStatus = 'SUSPENDED';
  }

  const updatedUser = await (prisma as any).user.update({
    where: { id: userId },
    data: {
      reportCount: {
        increment: 1,
      },
      status: targetStatus,
    },
  });

  return updatedUser;
}