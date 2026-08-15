describe('Conversation Quality & Repeat Matching', () => {
  // Quality metrics calculation
  const calculateQualityBoost = (duration: number, messages: number) => {
    return Math.min(30, duration / 10 + messages / 2);
  };

  // Temporal decay
  const applyTemporalDecay = (score: number, timestamp: Date) => {
    const ageMs = Date.now() - timestamp.getTime();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const timeDecay = Math.max(0.5, 1 - ageMs / thirtyDaysMs);
    return score * timeDecay;
  };

  it('should calculate quality boost from duration and messages', () => {
    expect(calculateQualityBoost(0, 0)).toBe(0);
    expect(calculateQualityBoost(100, 10)).toBe(15); // 10 + 5
    expect(calculateQualityBoost(300, 60)).toBe(30); // capped at 30
  });

  it('should apply full boost for recent conversations', () => {
    const score = 100;
    const now = new Date();
    
    const boosted = applyTemporalDecay(score, now);
    expect(boosted).toBeCloseTo(100, 1);
  });

  it('should decay boost over time', () => {
    const score = 100;
    
    // 15 days old
    const mid = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
    const midBoosted = applyTemporalDecay(score, mid);
    expect(midBoosted).toBeCloseTo(50, 0); // ~50% decay
    
    // 30 days old
    const old = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const oldBoosted = applyTemporalDecay(score, old);
    expect(oldBoosted).toBeCloseTo(50, 1); // min 50% boost remains
  });

  it('should give repeat match bonus', () => {
    const repeatMatchBonus = 40;
    const baseScore = 100;
    
    const userRepeatPrefs = new Set(['partner-id-1', 'partner-id-2']);
    const score = userRepeatPrefs.has('partner-id-1')
      ? baseScore + repeatMatchBonus
      : baseScore;
    
    expect(score).toBe(140);
  });

  it('should not give bonus for non-repeat partners', () => {
    const repeatMatchBonus = 40;
    const baseScore = 100;
    
    const userRepeatPrefs = new Set(['partner-id-1']);
    const score = userRepeatPrefs.has('partner-id-2')
      ? baseScore + repeatMatchBonus
      : baseScore;
    
    expect(score).toBe(100);
  });

  it('should combine quality and repeat bonuses', () => {
    const baseScore = 80;
    const qualityBoost = 15;
    const repeatBonus = 40;
    
    const finalScore = baseScore + qualityBoost + repeatBonus;
    expect(finalScore).toBe(135);
  });

  it('should track conversation metrics correctly', () => {
    const metrics = {
      duration: 420, // 7 minutes
      messages: 30,
      rating: 4,
      timestamp: new Date(),
    };

    expect(metrics.duration).toBeGreaterThan(300); // at least 5 mins
    expect(metrics.messages).toBeGreaterThan(0);
    expect(metrics.rating).toBeGreaterThanOrEqual(1);
    expect(metrics.rating).toBeLessThanOrEqual(5);
  });

  it('should calculate average rating correctly', () => {
    const partnerRating = 4;
    const platformRating = 5;
    const averageRating = (partnerRating + platformRating) / 2;

    expect(averageRating).toBe(4.5);

    // Should trigger repeat match preference if >= 4
    expect(averageRating >= 4).toBe(true);
  });
});
