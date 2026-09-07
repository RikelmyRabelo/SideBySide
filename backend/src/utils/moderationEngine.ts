export function evaluateDirectMessageEligibility(userId: string, targetUserId: string, hasAcceptedFriendship: boolean): void {
  if (userId === targetUserId) {
    return;
  }

  if (!hasAcceptedFriendship) {
    throw new Error('UNAUTHORIZED_DIRECT_MESSAGE: É necessário possuir uma amizade aceita para trocar mensagens diretas.');
  }
}