import "dotenv/config";
import http from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import winston from 'winston';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { setupMatchmaking } from './matchmaking.js';

const PORT = process.env.WS_PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be configured with at least 32 characters.');
}
const signingSecret = JWT_SECRET;

const allowedOrigins = (process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production'
  ? 'https://seusiteoficial.com'
  : 'http://localhost:5173,https://localhost:5173,http://localhost:4173'))
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

const server = http.createServer((req, res) => {
  if (req.url === '/health/ready') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ready' }));
  }
});

const io = new SocketIOServer(server, { cors: corsOptions });

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const pubClient = createClient({ url: redisUrl });
const subClient = pubClient.duplicate();

if (process.env.NODE_ENV !== 'test') {
  Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
    io.adapter(createAdapter(pubClient, subClient));
    logger.info(`📡 Redis Adapter conectado com sucesso em ${redisUrl} (WebSocket)`);
  }).catch(err => {
    logger.error('❌ Erro ao conectar o Redis Adapter:', err);
  });
}

io.use((socket: Socket, next: (err?: Error) => void) => {
  try {
    const cookies = cookie.parse(socket.request.headers.cookie || '');
    const token = cookies.token;

    if (!token) return next(new Error('Autenticação não encontrada no handshake.'));

    jwt.verify(token, signingSecret, (err, decoded: any) => {
      if (err) return next(new Error('Sessão JWT inválida ou expirada.'));
       
      (socket as any).user = decoded;
      socket.join(`user_${decoded.id}`);
      next();
    });
  } catch (error: unknown) {
    logger.error('[WebSocket Handshake Error] Erro interno de autenticação WebSocket:', error);
    next(new Error('Erro interno de autenticação WebSocket.'));
  }
});

const socketEventLimits = new Map<string, { count: number; resetTime: number }>();
const checkSocketRateLimit = (socketId: string, eventName: string, limit: number = 20, windowMs: number = 60000): boolean => {
  const key = `${socketId}_${eventName}`;
  const now = Date.now();
  const record = socketEventLimits.get(key);

  if (!record || now > record.resetTime) {
    socketEventLimits.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
};

io.on('connection', (socket: Socket) => {
  socket.onAny((eventName, ..._args) => {
    if (!checkSocketRateLimit(socket.id, eventName, 30, 60000)) {
      socket.emit('error', { message: 'Limite de eventos excedido. Por favor, diminua o ritmo.' });
      logger.warn(`[Socket Rate Limit] Socket ${socket.id} bloqueado por excesso de eventos no canal ${eventName}`);
    }
  });
});

setupMatchmaking(io);

const gracefulShutdown = async (signal: string) => {
  logger.info(`Recebido sinal ${signal}. Iniciando encerramento gracioso...`);
  server.close(async () => {
    logger.info('Servidor WebSocket encerrado.');
    try {
      await pubClient.quit();
      await subClient.quit();
      process.exit(0);
    } catch (err) {
      logger.error('Erro ao desconectar serviços durante o shutdown:', err);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    logger.info(`Servidor WebSocket rodando na porta ${PORT}`);
  });
}

export { server, io };  