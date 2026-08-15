# Testing Guide for SideBySide

## Overview

This project includes comprehensive test suites for both backend and frontend, covering:
- **Matching algorithm** - Compatibility scoring, feedback loops, temporal decay
- **Moderation system** - Report escalation, user flags, penalties
- **Conversation quality** - Session metrics, repeat matching preferences
- **Authentication** - Email validation, password strength
- **Dashboard** - Candidate filtering, safety flags, ban management
- **Room session** - Timer formatting, media state tracking

## Backend Tests (Jest)

### Running Tests

```bash
cd backend
npm test                # Run all tests
npm run test:watch     # Watch mode
npm run test:coverage  # Generate coverage report
```

### Test Structure

- **`src/__tests__/matching.test.ts`** - Matching algorithm core logic
  - Same level prioritization (+50 points)
  - Nearby level boost (+25 points)
  - Shared interests (+15 per interest)
  - Reputation and activity bonuses
  
- **`src/__tests__/moderation.test.ts`** - Safety escalation
  - Report counts trigger flags (3→warning, 6→suspended, 10→banned)
  - Penalty scoring (-30 for warning, -80 for suspended)
  - Ban duration management (7 days temporary)
  - User filtering in match candidates

- **`src/__tests__/quality.test.ts`** - Conversation metrics
  - Quality boost calculation (duration + message count)
  - Temporal decay (30-day window, min 50% boost)
  - Repeat match bonus (+40 points)
  - Average rating triggering (≥4.0 saves preference)

### Example Backend Test

```typescript
it('should prioritize same level', () => {
  const me = { level: 'B1', interests: [], reputation: 100, totalSessions: 0, totalMinutes: 0 };
  const sameLevel = { level: 'B1', interests: [], reputation: 100, totalSessions: 0, totalMinutes: 0 };
  const sameLevelScore = calculateScore(me, sameLevel).score;
  
  expect(sameLevelScore).toBeGreaterThan(diffLevelScore);
  expect(sameLevelScore).toBe(60); // 50 base + 10 reputation
});
```

## Frontend Tests (Vitest)

### Running Tests

```bash
cd ..  # root
npm test                # Run all tests
npm run test:ui        # Interactive UI
npm run test:coverage  # Generate coverage report
```

### Test Structure

- **`src/__tests__/auth.test.ts`** - Authentication validation
  - Email format validation
  - Password strength (0-4 levels)
  - Minimum password length (6 chars)
  - Form validation logic

- **`src/__tests__/rating.test.ts`** - Rating and feedback
  - Rating range validation (1-5)
  - Average rating calculation
  - Repeat match triggering (≥4.0)
  - Session duration formatting
  - Message tracking

- **`src/__tests__/room.test.ts`** - Room session management
  - Topic ID validation
  - Random topic selection
  - Timer formatting (MM:SS or HH:MM:SS)
  - Camera and microphone state tracking
  - Session state transitions

- **`src/__tests__/dashboard.test.ts`** - Dashboard and matching
  - Candidate filtering by score
  - Score-based sorting
  - Compatibility labels (Excelente, Muito Bom, etc.)
  - Safety flag visibility
  - Ban status checking
  - Match feedback impact scoring

### Example Frontend Test

```typescript
it('should display correct compatibility label', () => {
  expect(getCandidateCompatibilityLabel(90)).toBe('Excelente');
  expect(getCandidateCompatibilityLabel(70)).toBe('Muito Bom');
  expect(getCandidateCompatibilityLabel(50)).toBe('Bom');
  expect(getCandidateCompatibilityLabel(30)).toBe('Aceitável');
});
```

## Test Coverage

### Backend Coverage Goals
- Matching algorithm: 100% (core business logic)
- Moderation escalation: 100% (safety critical)
- Quality metrics: 100% (learning signal)
- API validation: 80% (schema coverage)

### Frontend Coverage Goals
- Validation functions: 100% (data integrity)
- Timer/formatting: 100% (UX correctness)
- Safety checks: 100% (user protection)
- Component logic: 70% (complex interactions)

## Running All Tests

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd .. && npm test

# Combined coverage report
cd backend && npm run test:coverage
cd .. && npm run test:coverage
```

## Continuous Integration

Tests should run on:
- Pre-commit (git hooks recommended)
- Pull requests (GitHub Actions/similar)
- Pre-deployment (CI/CD pipeline)

## Adding New Tests

1. **Backend (Jest)**
   ```bash
   # Create test file in src/__tests__/
   touch src/__tests__/feature.test.ts
   
   # Follow test structure:
   describe('Feature Name', () => {
     it('should do something', () => {
       expect(result).toBe(expected);
     });
   });
   ```

2. **Frontend (Vitest)**
   ```bash
   # Create test file in src/__tests__/
   touch src/__tests__/feature.test.ts
   
   # Import and test:
   import { describe, it, expect } from 'vitest';
   ```

## Debugging Tests

```bash
# Backend with debugging
node --inspect-brk node_modules/.bin/jest --runInBand

# Frontend with UI
npm run test:ui

# Watch specific file
npm test -- matching.test
```

## Performance

- Backend: ~7-10s full suite
- Frontend: ~2-3s full suite
- Target: Keep < 15s for fast feedback loop

## Known Issues & Limitations

- Prisma client mocks may require additional setup for API integration tests
- Some timing tests may be flaky due to system load
- RTCPeerConnection tests require browser environment (not implemented)

## Future Improvements

1. Integration tests for API endpoints
2. E2E tests for critical user flows
3. Performance benchmarking
4. Load testing for matching algorithm
5. Component snapshot tests
6. Accessibility testing
