describe('Matching Algorithm', () => {
  // Scoring logic
  const levelWeight: Record<string, number> = {
    A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6,
  };

  const calculateScore = (me: any, candidate: any) => {
    const sharedInterests = (me.interests || []).filter((i: string) =>
      (candidate.interests || []).includes(i)
    );
    const sameLevel = candidate.level === me.level ? 1 : 0;
    const nearbyLevel = Math.abs((levelWeight[candidate.level] || 3) - (levelWeight[me.level] || 3)) <= 1 ? 1 : 0;
    const reputationBoost = Math.max(0, Math.min(25, candidate.reputation / 10));
    const activityBoost = Math.min(20, (candidate.totalSessions || 0) * 2 + (candidate.totalMinutes || 0) / 30);

    let score = 0;
    score += sameLevel ? 50 : 0;
    score += nearbyLevel && !sameLevel ? 25 : 0;
    score += sharedInterests.length * 15;
    score += reputationBoost;
    score += activityBoost;

    return { score, sharedInterests };
  };

  it('should prioritize same level', () => {
    const me = { level: 'B1', interests: ['sports', 'music'], reputation: 100, totalSessions: 0, totalMinutes: 0 };
    const sameLevel = { level: 'B1', interests: [], reputation: 100, totalSessions: 0, totalMinutes: 0 };
    const diffLevel = { level: 'C1', interests: [], reputation: 100, totalSessions: 0, totalMinutes: 0 };

    const sameLevelScore = calculateScore(me, sameLevel).score;
    const diffLevelScore = calculateScore(me, diffLevel).score;

    expect(sameLevelScore).toBeGreaterThan(diffLevelScore);
    // sameLevel: 50 (same level) + 10 (rep: 100/10)
    expect(sameLevelScore).toBe(60);
  });

  it('should give boost for nearby levels', () => {
    const me = { level: 'B1', interests: [], reputation: 100, totalSessions: 0, totalMinutes: 0 };
    const nearby = { level: 'B2', interests: [], reputation: 100, totalSessions: 0, totalMinutes: 0 };
    const far = { level: 'A1', interests: [], reputation: 100, totalSessions: 0, totalMinutes: 0 };

    const nearbyScore = calculateScore(me, nearby).score;
    const farScore = calculateScore(me, far).score;

    expect(nearbyScore).toBeGreaterThan(farScore);
    // nearby: 25 (nearby level) + 10 (rep: 100/10)
    expect(nearbyScore).toBe(35);
  });

  it('should reward shared interests', () => {
    const me = { level: 'B1', interests: ['sports', 'music', 'travel'], reputation: 100, totalSessions: 0, totalMinutes: 0 };
    const withSharedInterests = { level: 'B1', interests: ['sports', 'music'], reputation: 100, totalSessions: 0, totalMinutes: 0 };
    const noSharedInterests = { level: 'B1', interests: ['cooking', 'gaming'], reputation: 100, totalSessions: 0, totalMinutes: 0 };

    const withScore = calculateScore(me, withSharedInterests).score;
    const noScore = calculateScore(me, noSharedInterests).score;

    expect(withScore).toBeGreaterThan(noScore);
    expect(withScore - noScore).toBe(2 * 15); // 2 shared interests
  });

  it('should reward reputation', () => {
    const me = { level: 'B1', interests: [], reputation: 100, totalSessions: 0, totalMinutes: 0 };
    const highRep = { level: 'B1', interests: [], reputation: 100, totalSessions: 0, totalMinutes: 0 };
    const lowRep = { level: 'B1', interests: [], reputation: 20, totalSessions: 0, totalMinutes: 0 };

    const highRepScore = calculateScore(me, highRep).score;
    const lowRepScore = calculateScore(me, lowRep).score;

    // highRep: 50 (same level) + 10 (rep: 100/10)
    // lowRep: 50 (same level) + 2 (rep: 20/10)
    expect(highRepScore).toBeGreaterThan(lowRepScore);
    expect(highRepScore - lowRepScore).toBe(8);
  });

  it('should reward activity', () => {
    const me = { level: 'B1', interests: [], reputation: 100, totalSessions: 0, totalMinutes: 0 };
    const active = { level: 'B1', interests: [], reputation: 100, totalSessions: 10, totalMinutes: 300 };
    const inactive = { level: 'B1', interests: [], reputation: 100, totalSessions: 0, totalMinutes: 0 };

    const activeScore = calculateScore(me, active).score;
    const inactiveScore = calculateScore(me, inactive).score;

    expect(activeScore).toBeGreaterThan(inactiveScore);
  });
});
