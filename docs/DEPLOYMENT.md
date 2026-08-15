# Deployment & Next Steps Guide

## Pre-Deployment Checklist

### ✅ Completed Validation
- [x] Backend tests: 21/21 passing
- [x] Frontend tests: 45/45 passing  
- [x] Frontend build: Success
- [x] TypeScript compilation: No errors
- [x] All three product layers implemented
- [x] Safety escalation working
- [x] Quality metrics tracking
- [x] Admin moderation interface ready

### 🔧 Environment Setup

#### Backend Configuration
```bash
cd backend

# Create .env file
cat > .env << EOF
DATABASE_URL=postgresql://user:password@localhost:5432/sidebyside
JWT_SECRET=your-secret-key
PORT=3000
NODE_ENV=development
EOF

# Run migrations (if needed)
npx prisma migrate deploy

# Start server
npm run dev
```

#### Frontend Configuration
```bash
cd ..

# Create .env file (if needed)
cat > .env << EOF
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
EOF

# Start dev server
npm run dev
```

## Local Development

### Starting Both Servers

```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev

# Terminal 2: Frontend
cd ..
npm install
npm run dev
```

Then open: http://localhost:5173

### Running Tests

```bash
# Backend tests (in backend dir)
npm test
npm run test:watch

# Frontend tests (in root dir)
npm test
npm run test:ui

# Integration tests
bash run-integration-tests.sh
```

## Database Management

### PostgreSQL Setup

```bash
# Install PostgreSQL (if not already installed)
# macOS
brew install postgresql@15

# Linux (Ubuntu/Debian)
sudo apt-get install postgresql

# Start PostgreSQL
pg_ctl -D /usr/local/var/postgres start

# Create database
createdb sidebyside
```

### Prisma Operations

```bash
cd backend

# Push schema to database
npx prisma db push

# Open Prisma Studio (web UI)
npx prisma studio

# Create migration
npx prisma migrate dev --name migration_name

# Reset database (development only)
npx prisma db push --force-reset
```

## Production Deployment

### 1. Environment Variables

Set in `.env.production`:
```
DATABASE_URL=postgresql://user:password@host:5432/sidebyside
JWT_SECRET=secure-random-secret-min-32-chars
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://yourdomain.com
```

### 2. Backend Deployment (Node.js)

```bash
cd backend

# Build
npm run build

# Run production
npm run start
```

### 3. Frontend Deployment

```bash
cd ..

# Build
npm run build

# Deploy dist/ folder to:
# - Vercel
# - Netlify
# - AWS S3 + CloudFront
# - Any static host
```

### 4. Database Deployment

```bash
# Use managed PostgreSQL service:
# - AWS RDS
# - Railway.app
# - Supabase
# - Heroku Postgres
# - DigitalOcean Managed Databases

# After creating database, run:
npx prisma migrate deploy
```

### 5. SSL/HTTPS

```bash
# Use Let's Encrypt for free SSL
# Configure through your hosting provider
# Ensure CORS_ORIGIN uses https://
```

## Monitoring & Logging

### Backend Logging
```bash
# Install logging package
npm install winston

# Add to src/index.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});
```

### Error Tracking
```bash
# Install Sentry
npm install @sentry/node

# Add to src/index.ts
import * as Sentry from "@sentry/node";
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

### Performance Monitoring
```bash
# Install monitoring
npm install @datadog/browser-rum

# Track API response times
# Monitor WebRTC connection quality
# Alert on threshold breaches
```

## Security Checklist

- [ ] Change all default passwords
- [ ] Enable HTTPS/SSL everywhere
- [ ] Set secure JWT secret (min 32 chars)
- [ ] Configure CORS properly (specific origins)
- [ ] Enable rate limiting on API endpoints
- [ ] Implement CSRF protection
- [ ] Add Content Security Policy headers
- [ ] Keep dependencies updated
- [ ] Run security audit: `npm audit`
- [ ] Add WAF (Web Application Firewall)
- [ ] Enable API key rotation
- [ ] Implement request signing

## Scaling Considerations

### Database
- [ ] Add read replicas for scaling
- [ ] Implement connection pooling
- [ ] Add caching layer (Redis)
- [ ] Index frequently queried fields
- [ ] Archive old reports (>90 days)

### Backend
- [ ] Horizontal scaling with load balancer
- [ ] Environment-specific configurations
- [ ] Health check endpoints
- [ ] Graceful shutdown handling
- [ ] Request queuing for heavy operations

### Frontend
- [ ] CDN for static assets
- [ ] Service Worker for offline support
- [ ] Code splitting for faster loads
- [ ] Image optimization
- [ ] Compression (gzip/brotli)

## Testing in Production

### Smoke Tests
```bash
# Check critical endpoints
curl https://api.yourdomain.com/health
curl https://yourdomain.com/

# Verify database connection
curl https://api.yourdomain.com/api/admin/reports -H "Authorization: Bearer TOKEN"
```

### User Journey Tests
1. Sign up new account
2. Complete onboarding (set level, interests)
3. Get matched with partner
4. Start video session
5. Rate and provide feedback
6. Check match quality update
7. Report user (test moderation)
8. Check admin panel

## Rollback Procedure

```bash
# Keep previous version deployed
# Database migrations are backward compatible
# Revert frontend deployment:
# - Previous build in CDN
# - Or git rollback + rebuild

# Emergency shutdown:
systemctl stop sidebyside-backend
systemctl stop sidebyside-frontend
```

## Backup Strategy

```bash
# Daily database backups
pg_dump sidebyside > sidebyside-$(date +%Y%m%d).sql
gzip sidebyside-*.sql

# Store on S3/backup service
# Keep 30-day retention
# Test restore monthly
```

## Post-Launch

### First Week
- Monitor error logs daily
- Check user feedback
- Track performance metrics
- Adjust rate limits if needed
- Verify moderation workflow

### First Month
- Analyze match quality metrics
- Review user retention
- Optimize slow queries
- Fix any reported issues
- Plan feature releases

### Ongoing
- Weekly security updates
- Monthly performance review
- Quarterly code audit
- Continuous deployment improvements
- User feedback integration

## Support Resources

### Documentation
- [API Documentation](../API_DOCS.md)
- [Testing Guide](./TESTING.md)
- [Architecture](../ARCHITECTURE.md)

### Tools
- Prisma Studio: `npx prisma studio`
- Database Admin: pgAdmin or similar
- API Testing: Postman/Insomnia
- Monitoring: DataDog/New Relic

### Contact
- Security issues: security@yourdomain.com
- Technical support: support@yourdomain.com
- Emergency: oncall@yourdomain.com

---

**Deployment Date**: [Add your date]
**Version**: 1.0.0-MVP
**Status**: Ready for Launch ✅
