import { Server, Socket } from 'socket.io';
import { prisma } from '../lib/prisma.js';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'seu-segredo-super-seguro';

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

const findMatchSchema = z.object({ 
  topicId: z.string().nullable().optional() 
}).optional();

const webrtcSdpSchema = z.object({ roomId: z.string(), sdp: z.any() });
const webrtcIceSchema = z.object({ roomId: z.string(), candidate: z.any() });
const chatSchema = z.object({ roomId: z.string(), text: z.string().min(1) });
const directMessageSchema = z.object({ recipientId: z.string(), text: z.string().min(1) });

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
          return next(new Error('Sessão JWT inválida ou expirada.'));
        }
        (socket as any).user = decoded;
        next();
      });
    } catch (error) {
      next(new Error('Erro interno de autenticação WebSocket.'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    console.log(`🔌 Novo usuário conectado: ${user?.email || socket.id}`);

    socketRateLimits.set(socket.id, { count: 0, lastReset: Date.now() });

    socket.use(([event, ...args], next) => {
      const tracker = socketRateLimits.get(socket.id);
      const now = Date.now();

      if (tracker) {
        if (now - tracker.lastReset > RATE_LIMIT_WINDOW_MS) {
          tracker.count = 1;
          tracker.lastReset = now;
        } else {
          tracker.count += 1;
          if (tracker.count > MAX_EVENTS_PER_WINDOW) {
            socket.emit('rate_limit_exceeded', {
              message: 'Você está enviando requisições rápido demais. Aguarde um instante.'
            });
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
        const topicId = (parsedData?.topicId && parsedData.topicId.trim() !== '') ? parsedData.topicId : 'general';
        
        if (!queues[topicId]) queues[topicId] = [];
        
        for (const key in queues) {
          queues[key] = queues[key].filter(s => s.id !== socket.id);
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

            let u1Data = { name: 'Estudante', avatar: null as string | null };
            let u2Data = { name: 'Estudante', avatar: null as string | null };

            try {
              if (user1?.id) {
                const dbU1 = await prisma.user.findUnique({ where: { id: user1.id } });
                if (dbU1) { u1Data.name = dbU1.name; u1Data.avatar = dbU1.avatar; }
              }
              if (user2?.id) {
                const dbU2 = await prisma.user.findUnique({ where: { id: user2.id } });
                if (dbU2) { u2Data.name = dbU2.name; u2Data.avatar = dbU2.avatar; }
              }
            } catch (err) {}

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

    const handlePartnerLeave = () => {
      const roomId = socketRoomMap.get(socket.id);
      if (roomId) {
        socket.to(roomId).emit('partner_left');
        const room = activeRooms.get(roomId);
        if (room) {
          room.delete(socket.id);
          if (room.size === 0) activeRooms.delete(roomId);
        }
        socketRoomMap.delete(socket.id);
        socket.leave(roomId);
      }
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