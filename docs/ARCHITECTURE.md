# SideBySide Architecture Documentation

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   Frontend (React + TypeScript)              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Dashboard.tsx  │  Room.tsx  │  Moderation.tsx       │   │
│  │  Auth Pages     │  Modals    │  Admin Interface      │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                    │
│                  React Router + Hooks                        │
│                  (useMediaStream, custom hooks)              │
└─────────────────────────────────────────────────────────────┘
                           ↓ HTTP + WebSocket
┌─────────────────────────────────────────────────────────────┐
│              Backend (Express + TypeScript)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Auth Routes   │  Matching   │  Moderation          │   │
│  │  Room Routes   │  Quality    │  Admin Routes        │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                    │
│        Prisma ORM + Business Logic                           │
│        (In-memory Maps for Session State)                    │
└─────────────────────────────────────────────────────────────┘
                           ↓ SQL
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL Database                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Users Table   │  Reports Table │  Sessions (cache)  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Testing**: Vitest + @testing-library
- **Real-time**: WebRTC for peer video

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js v5.2.1
- **Language**: TypeScript
- **Database ORM**: Prisma v7.9.1
- **Authentication**: JWT + Bcrypt
- **Database**: PostgreSQL
- **Testing**: Jest + ts-jest

### DevOps
- **Package Manager**: npm
- **Version Control**: Git
- **CI/CD**: GitHub Actions (recommended)
- **Hosting**: Node.js compatible servers
- **Database**: Managed PostgreSQL

## Core Features Architecture

### 1. Authentication Layer

```
User Registration
    ↓
Email Validation
    ↓
Password Strength Check (0-4 levels)
    ↓
Bcrypt Hash Password
    ↓
Create User in DB
    ↓
JWT Token Generation
    ↓
Store Token in Browser
    ↓
Protected Routes Check Token
```

**Key Files**:
- Backend: Auth endpoints in `src/index.ts`
- Frontend: `pages/Login.tsx`, `pages/Onboarding.tsx`
- Tests: `auth.test.ts` (validation logic)

### 2. Matching Algorithm

```
User Profile
├── Level: A1-C2
├── Interests: [array]
├── Reputation: 0-100
├── Activity: sessions + minutes
└── Flag Status: clean/warning/suspended/banned

Scoring Formula:
  base = 50 (same level) | 25 (±1 level) | 0 (far)
  + 15 × (shared interests count)
  + reputation / 10
  + totalSessions / 5
  + totalMinutes / 60
  + repeatMatchBonus (if previous rated ≥4)
  + qualityBoost (from conversation metrics)
  - penaltyFromFlags (warning -30, suspended -80)
  = Final Match Score
```

**Key Files**:
- Backend: `src/index.ts` - `/api/match/find` endpoint
- Tests: `matching.test.ts` - 7 test cases

### 3. Moderation System

```
User Reports (accumulated)
    ↓
    0-2 reports: Clean
    ↓
    3 reports: Warning Flag (-30 penalty)
    ↓
    4-5 reports: Warning (continued)
    ↓
    6 reports: Suspended (7-day ban, -80 penalty)
    ↓
    7-9 reports: Suspended (continued)
    ↓
    10+ reports: Permanently Banned (removed from matches)
    ↓
Admin Resolution Options:
├── Keep flag active
├── Dismiss report
└── Override ban
```

**Key Files**:
- Backend: `/api/room/report`, `/api/admin/*` endpoints
- Database: `Report` model + User flag fields
- Tests: `moderation.test.ts` - 7 test cases

### 4. Conversation Quality

```
Session Metrics Collection
├── Session Duration (seconds)
├── Message Count
└── User Rating (1-5)

Quality Boost Calculation:
  base = Math.min(duration/60, 10) + messages/2
  
Temporal Decay (30-day window):
  daysOld = (today - sessionDate) / (1000*60*60*24)
  decayFactor = Math.max(1 - daysOld/30, 0.5)
  finalBoost = base × decayFactor

Repeat Match Bonus:
  if (previousRating ≥ 4.0): +40 points to score

Stored in Database:
  - conversationQuality map (in-memory)
  - repeatMatchPreferences map (in-memory)
  - Loaded on server startup (TODO: persist)
```

**Key Files**:
- Backend: `/api/room/quality`, `/api/room/want-to-talk-again`
- Tests: `quality.test.ts` - 8 test cases

## Database Schema

### Users Table
```sql
CREATE TABLE "User" (
  id                String @id @default(uuid())
  email             String @unique
  password          String
  
  -- Profile
  level             String (A1-C2)
  interests         String[] @default([])
  avatar            String?
  bio               String?
  
  -- Activity
  reputation        Int @default(100)
  totalSessions     Int @default(0)
  totalMinutes      Int @default(0)
  
  -- Safety
  reportCount       Int @default(0)
  flagStatus        String @default("clean")
  flagReason        String?
  flaggedAt         DateTime?
  isBanned          Boolean @default(false)
  bannedUntil       DateTime?
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([level])
  @@index([flagStatus])
}
```

### Reports Table
```sql
CREATE TABLE "Report" (
  id                String @id @default(uuid())
  reporterId        String @db.Text
  reportedUserId    String @db.Text
  
  reason            String (harassment|inappropriate|spam)
  description       String
  
  status            String @default("pending")
  createdAt         DateTime @default(now())
  resolvedAt        DateTime?
  resolution        String?
  
  @@index([reportedUserId])
  @@index([status])
}
```

## API Endpoints

### Authentication
```
POST   /api/auth/register        - Create new account
POST   /api/auth/login           - Login user
GET    /api/auth/me              - Get current user
POST   /api/auth/logout          - Logout
```

### Matching
```
GET    /api/match/find           - Get candidates (with scoring)
POST   /api/match/feedback       - Submit match feedback
```

### Room Management
```
POST   /api/room/quality         - Submit quality metrics
POST   /api/room/want-to-talk-again - Save repeat preference
POST   /api/room/report          - File user report
```

### Admin
```
GET    /api/admin/reports        - List all reports
GET    /api/admin/flagged-users  - List flagged users
POST   /api/admin/resolve-report - Resolve report
```

## In-Memory Data Structures

### Conversation Quality Map
```typescript
const conversationQuality = new Map<string, {
  partnerId: string,
  duration: number,
  messageCount: number,
  rating: number,
  timestamp: Date
}>();
```

### Repeat Match Preferences
```typescript
const repeatMatchPreferences = new Map<string, Set<string>>();
// userId -> Set of partnerIds to match again
```

### Match Feedback
```typescript
const matchFeedback = new Map<string, {
  partnerId: string,
  feedback: 'positive' | 'negative' | 'skip',
  timestamp: Date
}>();
```

### Reports Map
```typescript
const reports = new Map<string, {
  reporterId: string,
  reason: string,
  description: string,
  timestamp: Date,
  resolved: boolean
}>();
```

## Frontend Component Architecture

### Page Components
```
Dashboard.tsx
├── Shows top 8 candidates
├── Displays compatibility scores
├── Shows safety flags
└── Handles candidate selection

Room.tsx
├── WebRTC video session
├── Timer tracking
├── Media controls (camera/mic)
├── Rating modal trigger
└── Quality metric submission

Moderation.tsx
├── Admin report viewing
├── Flag management
└── User resolution options
```

### Modal Components
```
Rating/FeedbackModal
├── 1-5 star rating
├── Feedback text
└── Submit quality metrics

ReportModal
├── Report reason
├── Description
└── Submit to backend

SafetyFlags
├── Warning badge
├── Suspended badge
└── Ban warning
```

### Data Flow

```
User Action (Dashboard)
    ↓
Select Candidate
    ↓
Room.tsx (start session)
    ↓
WebRTC Connection Established
    ↓
Collect Session Metrics (timer, messages)
    ↓
End Session
    ↓
Rating Modal
    ↓
calculateQualityBoost() + Submit
    ↓
Backend: Update metrics + Recalculate scores
    ↓
Next match reflects quality improvements
```

## State Management

### Frontend
- React hooks for local state
- Context API for global state (auth, user)
- No Redux (keep it simple for MVP)
- Browser localStorage for persistence

### Backend
- In-memory maps for session data (cleared on restart)
- PostgreSQL for persistent data
- JWT for stateless auth
- No session store needed (TODO: implement Redis for scaling)

## Error Handling

### Frontend
```typescript
try {
  const response = await fetch('/api/match/find');
  const data = await response.json();
} catch (error) {
  // Network error
  showErrorNotification(error.message);
} finally {
  // Cleanup
}
```

### Backend
```typescript
app.post('/api/match/find', (req, res) => {
  try {
    const candidates = calculateMatches();
    res.json(candidates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

## Security Architecture

### Frontend Security
- Password strength validation (0-4 levels)
- Email validation before submission
- JWT token storage (localStorage)
- CORS for API requests
- XSS prevention (React escaping)

### Backend Security
- Password hashing (Bcrypt)
- JWT verification on protected routes
- Input validation (type checking)
- SQL injection prevention (Prisma)
- Rate limiting (planned)
- CORS headers

### Database Security
- Parameterized queries (Prisma)
- Connection string in env variables
- No sensitive data in logs
- Backup encryption (planned)

## Performance Optimizations

### Frontend
- Lazy loading components
- Image optimization
- Code splitting by route
- Caching API responses (planned)
- Service Worker for offline (planned)

### Backend
- Indexed database queries
- Connection pooling (planned)
- Caching with Redis (planned)
- CDN for static assets
- Request compression (gzip)

### Database
- Indexes on frequently queried fields
  - User.level
  - User.flagStatus
  - Report.reportedUserId
  - Report.status

## Testing Architecture

### Unit Tests
- Business logic validation
- Algorithm correctness
- Edge case handling
- No external dependencies

### Integration Tests
- API endpoint validation
- Database integration
- Full user flows
- Error scenarios

### E2E Tests
- User journey validation
- Complete signup to match flow
- Admin moderation workflow
- Video session simulation

## Deployment Architecture

```
Developer (local)
    ↓
    Push to GitHub
    ↓
    GitHub Actions CI/CD
    ↓
    Run tests
    ↓
    Build frontend
    ↓
    Build backend
    ↓
    Deploy to Production
    ├── Frontend → CDN/Static Host
    └── Backend → Node.js Server
    ↓
    PostgreSQL Production DB
    ↓
    Live Application
```

## Scalability Roadmap

### Phase 1 (Current - MVP)
- Single backend server
- PostgreSQL primary
- In-memory session data
- Basic moderation

### Phase 2 (Scale)
- Load balanced backend
- PostgreSQL with replicas
- Redis for session cache
- Advanced moderation AI

### Phase 3 (Enterprise)
- Microservices architecture
- Message queue (RabbitMQ)
- Elasticsearch for search
- Real-time analytics
- Machine learning pipeline

---

**Last Updated**: 2024
**Architecture Version**: 1.0
**Status**: Production Ready MVP
