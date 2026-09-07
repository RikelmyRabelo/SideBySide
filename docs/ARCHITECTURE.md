```markdown
# SideBySide Architecture Documentation

## System Overview


```

┌─────────────────────────────────────────────────────────────┐
│                   Frontend (React + TypeScript)              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Dashboard.tsx  │  Room.tsx  │  Moderation.tsx       │   │
│  │  Auth Pages     │  Modals    │  Settings Interface   │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                    │
│                  React Router + Hooks                        │
│         (useSocket, useMediaStream, custom hooks)            │
└─────────────────────────────────────────────────────────────┘
↓ HTTP + WebSocket (Socket.IO Singleton)
┌─────────────────────────────────────────────────────────────┐
│              Backend (Express + TypeScript)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Auth Routes   │  Matchmaking│  Direct Messages      │   │
│  │  Room Routes   │  Friends    │  User/Profile Routes  │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                    │
│        Prisma ORM + Business Logic + Atomic Transactions     │
│        (In-memory Maps for Session State & Rate Limits)      │
└─────────────────────────────────────────────────────────────┘
↓ SQL
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL Database                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Users Table   │  Reports Table │  Sessions History  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

```

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Testing**: Vitest + @testing-library (Isolated from E2E)
- **Real-time**: Socket.IO Client (Singleton Provider) + WebRTC

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database ORM**: Prisma (Strict Enums)
- **Authentication**: JWT + Bcrypt (HTTP-only cookies)
- **Real-time**: Socket.IO + Redis Adapter
- **Observability**: Winston (Log rotation), X-Request-Id Tracing
- **Database**: PostgreSQL

### DevOps
- **Package Manager**: npm
- **Version Control**: Git
- **CI/CD**: GitHub Actions (recommended)
- **Docker**: Deterministic builds with `npm ci`

## Database Schema (Prisma Core Models)

### Users Table
```prisma
model User {
  id                  String                @id @default(uuid())
  email               String                @unique
  password            String
  tag                 String                @unique
  
  -- Profile
  level               UserLevel             @default(B1)
  interests           String[]
  avatar              String?
  bio                 String?
  
  -- Activity
  reputation          Int                   @default(100)
  totalSessions       Int                   @default(0)
  totalMinutes        Int                   @default(0)
  
  -- Safety
  reportCount         Int                   @default(0)
  flagStatus          FlagStatus            @default(CLEAN)
  flagReason          String?
  flaggedAt           DateTime?
  isBanned            Boolean               @default(false)
  bannedUntil         DateTime?
  
  createdAt           DateTime              @default(now())
  updatedAt           DateTime              @updatedAt
}

```

### Reports Table

```prisma
model Report {
  id             String       @id @default(uuid())
  reporterId     String
  reportedUserId String
  reason         String
  description    String?
  status         ReportStatus @default(OPEN)
  resolvedAt     DateTime?
  resolution     String?
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  @@index([reporterId])
  @@index([reportedUserId])
}

```

## API Endpoints

### Authentication (`/api/auth`)

```
POST   /api/auth/register          - Send registration verification code
POST   /api/auth/login             - Authenticate user & set JWT cookie
POST   /api/auth/logout            - Clear authentication cookie
POST   /api/auth/forgot-password   - Send password reset code
POST   /api/auth/verify-reset-code - Validate reset code
POST   /api/auth/reset-password    - Set new password
POST   /api/auth/verify-code       - Confirm registration and create user
POST   /api/auth/resend-code       - Resend pending verification code

```

### Matchmaking & Rooms (`/api/matches`, `/api/room`)

```
GET    /api/matches/candidates     - Fetch potential matching candidates
POST   /api/matches/feedback       - Submit candidate feedback (positive/negative/skip)
GET    /api/room/status            - Check current active session status
POST   /api/room/join              - Join matchmaking queue for a specific topic
POST   /api/room/report            - File user report (Atomic transaction to prevent duplicates)
POST   /api/room/rate              - Rate partner and update reputation metrics

```

### Friendships (`/api/friends`)

```
POST   /api/friends/request        - Send friend request by ID or Tag
GET    /api/friends/requests       - List pending received requests
POST   /api/friends/accept         - Accept or reject a friend request
GET    /api/friends/list           - List all accepted friends
DELETE /api/friends/:friendId      - Remove friend and related direct messages

```

### Direct Messages (`/api/messages`)

```
POST   /api/messages/send          - Send a direct message to a user
GET    /api/messages/:recipientId  - Fetch cursor-paginated chat history

```

### User Profile (`/api/user`)

```
GET    /api/user/me                - Get authenticated user data and feedbacks
DELETE /api/user/me                - Delete account and all related data
GET    /api/user/:id               - Get public profile data of a specific user
PUT    /api/user/profile           - Update profile settings and details
GET    /api/notifications          - Fetch user notifications

```

## In-Memory Data Structures

### Session & Rate Limiting Maps

```typescript
// Active Socket limits per connection
const socketEventLimits = new Map<string, { count: number; resetTime: number }>();

// Auth caching for pending verifications
const pendingUsers = new Map<string, PendingUserData>();
const verificationCodes = new Map<string, string>();

// Match feedback temporary storage
const matchFeedback = new Map<string, Map<string, 'positive' | 'negative' | 'skip'>>();

// Audit tracing for reports
const reports = new Map<string, { reporterId: string; reason: string; timestamp: Date }[]>();

```

## Frontend Component Architecture

### Core Providers

* **SocketProvider**: Singleton instance ensuring a single WebSocket connection across all views.
* **ToastProvider**: Global notification context.
* **ErrorBoundary**: Top-level application crash handler.

### Page Components

```
Dashboard.tsx
├── Shows candidates
├── Handles candidate selection via /api/matches

Room.tsx
├── WebRTC video session
├── Timer tracking
├── Media controls (camera/mic)
└── Rating modal trigger (calls /api/room/rate)

```

## State Management

### Frontend

* React hooks for local state.
* Context API for global state (Auth, Socket).
* Singleton WebSocket Client (`src/services/socket`).

### Backend

* Stateless HTTP scaling using JWT cookies.
* Socket.IO synchronized across instances using Redis Adapter.
* In-memory Maps for transient states (OTP verification, rate limiting tracking).

## Security & Observability Architecture

### Security Implementations

* **Rate Limiting**: Granularly enforced per-route (Auth, Messages, Reports, Matchmaking) via `express-rate-limit` using anon IP or User ID.
* **Socket Event Throttling**: Custom map-based rate limiter per Socket ID to prevent event spam.
* **Atomic Transactions**: Prisma `$transaction` used in reporting to prevent race conditions and duplicate penalizations.
* **Schema Hardening**: Use of Enums (`UserLevel`, `FlagStatus`, `ReportStatus`) to prevent string injection.

### Observability Pipeline

* **Request Tracing**: `X-Request-Id` generated/propagated for every incoming HTTP request.
* **Latency Metrics**: Built-in HRTime measurement outputting execution duration in milliseconds.
* **Log Management**: Winston logger implementing IP anonymization, daily log rotation, and max file size limits for combined and error logs.

## Performance Optimizations

### Backend

* Healthcheck endpoint (`/health`) validating active database connection.
* Graceful shutdown handlers (`SIGTERM`, `SIGINT`) properly closing Redis, Prisma, and HTTP connections to prevent orphaned processes.
* Dockerfile optimized using deterministic `npm ci`.

## Testing Architecture

### Unit Tests

* Business logic validation.
* Vitest explicitly configured to ignore E2E/Playwright directories (`e2e/**`, `*.e2e.test.ts`) to prevent suite conflicts.

### E2E Tests

* Handled separately (e.g., Playwright) for user journey validation.

## Deployment Architecture

```
Developer (local)
    ↓
    Push to GitHub
    ↓
    Docker Build (npm ci optimized)
    ↓
    Deploy to Production
    ├── Frontend → CDN/Static Host
    └── Backend → Node.js Server
    ↓
    PostgreSQL Production DB + Redis (Socket Adapter)

```

```

```