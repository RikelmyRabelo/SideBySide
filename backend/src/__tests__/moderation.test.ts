describe('Moderation System', () => {
  // Escalation logic
  const getEscalationStatus = (reportCount: number, currentFlag: string) => {
    let flagStatus = currentFlag || 'clean';
    let bannedUntil = null;

    if (reportCount >= 3 && flagStatus === 'clean') {
      flagStatus = 'warning';
    } else if (reportCount >= 6 && flagStatus === 'warning') {
      flagStatus = 'suspended';
      bannedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    } else if (reportCount >= 10) {
      flagStatus = 'banned';
    }

    return { flagStatus, bannedUntil };
  };

  it('should keep user clean until 3 reports', () => {
    expect(getEscalationStatus(0, 'clean').flagStatus).toBe('clean');
    expect(getEscalationStatus(1, 'clean').flagStatus).toBe('clean');
    expect(getEscalationStatus(2, 'clean').flagStatus).toBe('clean');
  });

  it('should flag as warning at 3 reports', () => {
    const result = getEscalationStatus(3, 'clean');
    expect(result.flagStatus).toBe('warning');
    expect(result.bannedUntil).toBeNull();
  });

  it('should keep warning status from 3-5 reports', () => {
    expect(getEscalationStatus(3, 'warning').flagStatus).toBe('warning');
    expect(getEscalationStatus(4, 'warning').flagStatus).toBe('warning');
    expect(getEscalationStatus(5, 'warning').flagStatus).toBe('warning');
  });

  it('should suspend at 6 reports', () => {
    const result = getEscalationStatus(6, 'warning');
    expect(result.flagStatus).toBe('suspended');
    expect(result.bannedUntil).not.toBeNull();
    
    const banDuration = result.bannedUntil!.getTime() - Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    expect(Math.abs(banDuration - sevenDaysMs)).toBeLessThan(1000); // within 1 second
  });

  it('should ban at 10 reports', () => {
    const result = getEscalationStatus(10, 'suspended');
    expect(result.flagStatus).toBe('banned');
  });

  it('should have correct penalty multipliers', () => {
    const getPenalty = (flagStatus: string) => {
      let penalty = 0;
      if (flagStatus === 'warning') penalty = -30;
      if (flagStatus === 'suspended') penalty = -80;
      return penalty;
    };

    expect(getPenalty('clean')).toBe(0);
    expect(getPenalty('warning')).toBe(-30);
    expect(getPenalty('suspended')).toBe(-80);
  });

  it('should filter out banned users from matches', () => {
    const candidates = [
      { id: '1', name: 'Alice', flagStatus: 'clean' },
      { id: '2', name: 'Bob', flagStatus: 'warning' },
      { id: '3', name: 'Charlie', flagStatus: 'suspended' },
      { id: '4', name: 'David', flagStatus: 'banned' },
    ];

    const filtered = candidates.filter((c) => c.flagStatus !== 'banned');
    expect(filtered).toHaveLength(3);
    expect(filtered.map((c) => c.id)).not.toContain('4');
  });

  it('should apply penalty to matching score', () => {
    const baseScore = 100;
    const applyPenalty = (score: number, flagStatus: string) => {
      if (flagStatus === 'warning') return score - 30;
      if (flagStatus === 'suspended') return score - 80;
      return score;
    };

    expect(applyPenalty(baseScore, 'clean')).toBe(100);
    expect(applyPenalty(baseScore, 'warning')).toBe(70);
    expect(applyPenalty(baseScore, 'suspended')).toBe(20);
  });
});
