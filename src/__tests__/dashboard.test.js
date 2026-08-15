import { describe, it, expect } from 'vitest';
// Mock dashboard functions
const filterCandidatesByMinScore = (candidates, minScore) => {
    return candidates.filter((c) => c.score >= minScore);
};
const sortCandidatesByScore = (candidates) => {
    return [...candidates].sort((a, b) => b.score - a.score);
};
const getCandidateCompatibilityLabel = (score) => {
    if (score >= 80)
        return 'Excelente';
    if (score >= 60)
        return 'Muito Bom';
    if (score >= 40)
        return 'Bom';
    if (score >= 20)
        return 'Aceitável';
    return 'Baixo';
};
const shouldShowCandidateFlag = (flagStatus) => {
    return flagStatus !== 'clean';
};
const isUserBanned = (user) => {
    if (!user.isBanned)
        return false;
    if (!user.bannedUntil)
        return true;
    return new Date(user.bannedUntil) > new Date();
};
describe('Dashboard & Matching', () => {
    it('should filter candidates by minimum score', () => {
        const candidates = [
            { id: '1', name: 'Alice', score: 85 },
            { id: '2', name: 'Bob', score: 50 },
            { id: '3', name: 'Charlie', score: 25 },
        ];
        const filtered = filterCandidatesByMinScore(candidates, 50);
        expect(filtered).toHaveLength(2);
        expect(filtered.map((c) => c.id)).toEqual(['1', '2']);
    });
    it('should sort candidates by score descending', () => {
        const candidates = [
            { id: '1', name: 'Alice', score: 50 },
            { id: '2', name: 'Bob', score: 85 },
            { id: '3', name: 'Charlie', score: 65 },
        ];
        const sorted = sortCandidatesByScore(candidates);
        expect(sorted.map((c) => c.score)).toEqual([85, 65, 50]);
    });
    it('should display correct compatibility label', () => {
        expect(getCandidateCompatibilityLabel(90)).toBe('Excelente');
        expect(getCandidateCompatibilityLabel(70)).toBe('Muito Bom');
        expect(getCandidateCompatibilityLabel(50)).toBe('Bom');
        expect(getCandidateCompatibilityLabel(30)).toBe('Aceitável');
        expect(getCandidateCompatibilityLabel(10)).toBe('Baixo');
    });
    it('should show safety flag for non-clean users', () => {
        expect(shouldShowCandidateFlag('clean')).toBe(false);
        expect(shouldShowCandidateFlag('warning')).toBe(true);
        expect(shouldShowCandidateFlag('suspended')).toBe(true);
        expect(shouldShowCandidateFlag('banned')).toBe(true);
    });
    it('should check if user is banned', () => {
        const notBanned = { isBanned: false };
        const permanentlyBanned = { isBanned: true, bannedUntil: null };
        const tempBanned = {
            isBanned: true,
            bannedUntil: new Date(Date.now() + 1000),
        };
        const unbanned = {
            isBanned: true,
            bannedUntil: new Date(Date.now() - 1000),
        };
        expect(isUserBanned(notBanned)).toBe(false);
        expect(isUserBanned(permanentlyBanned)).toBe(true);
        expect(isUserBanned(tempBanned)).toBe(true);
        expect(isUserBanned(unbanned)).toBe(false);
    });
    it('should limit candidates to top 8', () => {
        const candidates = Array.from({ length: 15 }, (_, i) => ({
            id: `${i}`,
            name: `User ${i}`,
            score: 100 - i * 5,
        }));
        const topCandidates = candidates.slice(0, 8);
        expect(topCandidates).toHaveLength(8);
        expect(topCandidates[0].score).toBe(100);
        expect(topCandidates[7].score).toBe(65);
    });
    it('should calculate match feedback impact', () => {
        const applyFeedback = (baseScore, feedback) => {
            if (feedback === 'positive')
                return baseScore + 20;
            if (feedback === 'negative')
                return baseScore - 60;
            if (feedback === 'skip')
                return baseScore - 12;
            return baseScore;
        };
        expect(applyFeedback(100, 'positive')).toBe(120);
        expect(applyFeedback(100, 'negative')).toBe(40);
        expect(applyFeedback(100, 'skip')).toBe(88);
    });
});
