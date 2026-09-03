import { Server, Socket } from 'socket.io';
import { prisma } from '../lib/prisma.js';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'seu-segredo-super-seguro';

const ALLOWED_TOPICS = ['general', 'business', 'technology', 'travel', 'daily'] as const;
const MAX_QUEUE_SIZE_PER_TOPIC = 100;

const queues: Record<string, Socket[]> = {};
const activeRooms: Map<string, Set<string>> = new Map();
const socketRoomMap: Map<string, string> = new Map();
const socketTopicMap: Map<string, string> = new Map();

interface RateLimitTracker {
  count: number;
  lastReset: number;
}
const socketRateLimits = new Map<string, RateLimitTracker>();

const RATE_LIMIT_WINDOW_MS = 1000;
const MAX_EVENTS_PER_WINDOW = 10;
const MAX_CHAT_EVENTS_PER_WINDOW = 5;

const findMatchSchema = z.object({ 
  topicId: z.enum(ALLOWED_TOPICS, {
    errorMap: () => ({ message: 'Tópico de busca inválido ou não autorizado.' })
  }).nullable().optional() 
}).optional();

const webrtcSdpSchema = z.object({ roomId: z.string(), sdp: z.any() });
const webrtcIceSchema = z.object({ roomId: z.string(), candidate: z.any() });
const cameraStatusSchema = z.object({ roomId: z.string(), camActive: z.boolean() });
const chatSchema = z.object({ roomId: z.string(), text: z.string().min(1) });
const directMessageSchema = z.object({ recipientId: z.string(), text: z.string().min(1) });
const leaveRoomSchema = z.object({ roomId: z.string().optional() }).optional();

const safeParseEvent = <T>(schema: z.ZodType<T>, data: unknown, callback: (parsedData: T) => void) => {
  const result = schema.safeParse(data);
  if (result.success) {
    callback(result.data);
  } else {
    console.error('Payload WebSocket inválido:', result.error.errors);
  }
};

export const setupMatchmaking = (io: Server) => {
  io.use((socket, next) => {
    try {
      const cookies = cookie.parse(socket.request.headers.cookie || '');
      const token = cookies.token;

      if (!token) {
        return next(new Error('Autenticação não encontrada no handshake.'));
      }

      jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
          console.error(`[WebSocket Auth Error] Falha ao verificar token JWT para socket ID ${socket.id}:`, err);
          return next(new Error('Sessão JWT inválida ou expirada.'));
        }
         
        (socket as any).user = decoded;
        next();
      });
    } catch (error: unknown) {
      console.error(`[WebSocket Handshake Error] Erro crítico durante autenticação de socket ID ${socket.id}:`, error);
      next(new Error('Erro interno de autenticação WebSocket.'));
    }
  });

  io.on('connection', (socket: Socket) => {
     
    const user = (socket as any).user;
    console.log(`🔌 Novo usuário conectado: ${user?.email || socket.id}`);

    socketRateLimits.set(socket.id, { count: 0, lastReset: Date.now() });

     
    socket.use(([event, ..._args]: [string, ...any[]], next: (err?: Error) => void) => {
      const tracker = socketRateLimits.get(socket.id);
      const now = Date.now();

      if (tracker) {
        if (now - tracker.lastReset > RATE_LIMIT_WINDOW_MS) {
          tracker.count = 1;
          tracker.lastReset = now;
        } else {
          tracker.count += 1;
          const threshold = (event === 'chat_message' || event === 'direct_message') ? MAX_CHAT_EVENTS_PER_WINDOW : MAX_EVENTS_PER_WINDOW;
          
          if (tracker.count > threshold) {
            socket.emit('rate_limit_exceeded', {
              message: 'Você está enviando eventos rápido demais. Aguarde um instante.'
            });
            console.warn(`[Rate Limit Exceeded] Socket ID ${socket.id} excedeu o limite de requisições no evento: ${event}`);
            return next(new Error('Taxa de requisições excedida'));
          }
        }
      }
      next();
    });

    if (user?.id) {
      socket.join(`user_${user.id}`);
    }

    socket.on('find_match', (data: unknown) => {
      safeParseEvent(findMatchSchema, data, async (parsedData) => {
        const rawTopic = parsedData?.topicId;
        const topicId = (rawTopic && rawTopic.trim() !== '') ? rawTopic : 'general';
        
        if (!queues[topicId]) queues[topicId] = [];
        
        for (const key in queues) {
          queues[key] = queues[key].filter(s => s.id !== socket.id);
        }
        
        if (queues[topicId].length >= MAX_QUEUE_SIZE_PER_TOPIC) {
          socket.emit('queue_full', { message: 'A fila para este tópico atingiu a capacidade máxima. Tente novamente mais tarde.' });
          console.warn(`[Queue Overflow Warning] Tópico '${topicId}' atingiu o limite de ${MAX_QUEUE_SIZE_PER_TOPIC} conexões.`);
          return;
        }

        queues[topicId].push(socket);
        socketTopicMap.set(socket.id, topicId);

        if (queues[topicId].length >= 2) {
          const socket1 = queues[topicId].shift();
          const socket2 = queues[topicId].shift();

          if (socket1 && socket2) {
             
            const user1 = (socket1 as any).user;
             
            const user2 = (socket2 as any).user;
            const roomId = `room_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            
            socket1.join(roomId);
            socket2.join(roomId);

            activeRooms.set(roomId, new Set([socket1.id, socket2.id]));
            socketRoomMap.set(socket1.id, roomId);
            socketRoomMap.set(socket2.id, roomId);
            
            socketTopicMap.delete(socket1.id);
            socketTopicMap.delete(socket2.id);

            const u1Data = { name: 'Estudante', avatar: null as string | null };
            const u2Data = { name: 'Estudante', avatar: null as string | null };

            try {
              if (user1?.id) {
                const dbU1 = await prisma.user.findUnique({ where: { id: user1.id } });
                if (dbU1) { u1Data.name = dbU1.name; u1Data.avatar = dbU1.avatar; }
              }
              if (user2?.id) {
                const dbU2 = await prisma.user.findUnique({ where: { id: user2.id } });
                if (dbU2) { u2Data.name = dbU2.name; u2Data.avatar = dbU2.avatar; }
              }
            } catch (err: unknown) {
              console.error(`[Matchmaking DB Error] Falha ao buscar dados de perfil dos usuários na sala ${roomId}:`, err);
            }

            socket1.emit('match_found', { 
              roomId, 
              partnerId: user2?.id || socket2.id, 
              partnerName: u2Data.name, 
              partnerAvatar: u2Data.avatar, 
              initiator: true 
            });
            
            socket2.emit('match_found', { 
              roomId, 
              partnerId: user1?.id || socket1.id, 
              partnerName: u1Data.name, 
              partnerAvatar: u1Data.avatar, 
              initiator: false 
            });
          }
        }
      });
    });

    socket.on('cancel_match', () => {
      const topicId = socketTopicMap.get(socket.id);
      if (topicId && queues[topicId]) {
        queues[topicId] = queues[topicId].filter(s => s.id !== socket.id);
        socketTopicMap.delete(socket.id);
      }
    });

    const handlePartnerLeave = (data?: unknown) => {
      safeParseEvent(leaveRoomSchema, data, (parsedData) => {
        const targetRoomId = parsedData?.roomId || socketRoomMap.get(socket.id);
        
        if (targetRoomId) {
          socket.to(targetRoomId).emit('partner_left');
          const room = activeRooms.get(targetRoomId);
          if (room) {
            room.delete(socket.id);
            if (room.size === 0) activeRooms.delete(targetRoomId);
          }
          socket.leave(targetRoomId);
        }
        socketRoomMap.delete(socket.id);
      });
    };

    socket.on('leave_room', handlePartnerLeave);

    socket.on('disconnect', () => {
      const topicId = socketTopicMap.get(socket.id);
      if (topicId && queues[topicId]) {
        queues[topicId] = queues[topicId].filter(s => s.id !== socket.id);
      }
      handlePartnerLeave();
      socketTopicMap.delete(socket.id);
      socketRateLimits.delete(socket.id);
    });

    socket.on('camera_status', (data: unknown) => {
      safeParseEvent(cameraStatusSchema, data, (parsedData) => {
        socket.to(parsedData.roomId).emit('camera_status', { camActive: parsedData.camActive });
      });
    });

    socket.on('webrtc_offer', (data: unknown) => {
      safeParseEvent(webrtcSdpSchema, data, (parsedData) => {
        socket.to(parsedData.roomId).emit('webrtc_offer', { sdp: parsedData.sdp });
      });
    });

    socket.on('webrtc_answer', (data: unknown) => {
      safeParseEvent(webrtcSdpSchema, data, (parsedData) => {
        socket.to(parsedData.roomId).emit('webrtc_answer', { sdp: parsedData.sdp });
      });
    });
    
    socket.on('webrtc_ice_candidate', (data: unknown) => {
      safeParseEvent(webrtcIceSchema, data, (parsedData) => {
        socket.to(parsedData.roomId).emit('webrtc_ice_candidate', { candidate: parsedData.candidate });
      });
    });
    
    socket.on('chat_message', (data: unknown) => {
      safeParseEvent(chatSchema, data, (parsedData) => {
        socket.to(parsedData.roomId).emit('chat_message', { text: parsedData.text, id: Date.now() });
      });
    });

    socket.on('direct_message', (data: unknown) => {
      safeParseEvent(directMessageSchema, data, (parsedData) => {
        io.to(`user_${parsedData.recipientId}`).emit('direct_message', {
          senderId: user?.id,
          text: parsedData.text,
          timestamp: Date.now()
        });
      });
    });
  });
};