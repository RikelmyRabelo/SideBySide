// backend/src/utils/authorization.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function assertCanMessage(userId: string, targetUserId: string): Promise<void> {
  if (userId === targetUserId) {
    return;
  }

  const friendship = await (prisma as any).friendship.findFirst({
    where: {
      status: 'ACCEPTED',
      OR: [
        { senderId: userId, receiverId: targetUserId },
        { senderId: targetUserId, receiverId: userId },
      ],
    },
  });

  if (!friendship) {
    throw new Error('UNAUTHORIZED_DIRECT_MESSAGE: É necessário possuir uma amizade aceita para trocar mensagens diretas.');
  }
}