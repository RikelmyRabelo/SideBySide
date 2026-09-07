import { prisma } from '../lib/prisma.js';
import { evaluateDirectMessageEligibility } from './moderationEngine.js';

export async function assertCanMessage(userId: string, targetUserId: string): Promise<void> {
  const friendship = userId === targetUserId ? null : await prisma.friendRelation.findFirst({
    where: {
      status: 'ACCEPTED',
      OR: [
        { userId, friendId: targetUserId },
        { userId: targetUserId, friendId: userId },
      ],
    },
  });

  evaluateDirectMessageEligibility(userId, targetUserId, !!friendship);
}