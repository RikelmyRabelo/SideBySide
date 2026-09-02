import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import rateLimit from 'express-rate-limit';

const app = express();
app.use(express.json());

const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
});

app.post('/api/room/test-report', reportLimiter, (req, res) => {
  res.status(201).json({ success: true });
});

describe('Report Rate Limiter', () => {
  it('deve bloquear após exceder o limite de denúncias', async () => {
    await request(app).post('/api/room/test-report').expect(201);
    await request(app).post('/api/room/test-report').expect(201);
    await request(app).post('/api/room/test-report').expect(201);
    
    const response = await request(app).post('/api/room/test-report');
    expect(response.status).toBe(429);
  });
});