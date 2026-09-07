import { prisma } from '../lib/prisma.js';

export async function assertCanMessage(userId: string, targetUserId: string): Promise<void> {
  if (userId === targetUserId) {
    return;
  }

  const friendship = await prisma.friendRelation.findFirst({
    where: {
      status: 'ACCEPTED',
      OR: [
        { userId, friendId: targetUserId },
        { userId: targetUserId, friendId: userId },
      ],
    },
  });

  if (!friendship) {
    throw new Error('UNAUTHORIZED_DIRECT_MESSAGE: É necessário possuir uma amizade aceita para trocar mensagens diretas.');
  }
}