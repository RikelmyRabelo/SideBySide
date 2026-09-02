import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import rateLimit from 'express-rate-limit';

const app = express();
app.use(express.json());

const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 2,
  standardHeaders: true,
  legacyHeaders: false,
});

app.post('/api/messages/test-send', messageLimiter, (req, res) => {
  res.status(201).json({ success: true });
});

describe('Message Rate Limiter', () => {
  it('deve bloquear após exceder o limite de mensagens', async () => {
    await request(app).post('/api/messages/test-send').expect(201);
    await request(app).post('/api/messages/test-send').expect(201);
    const response = await request(app).post('/api/messages/test-send');
    expect(response.status).toBe(429);
  });
});