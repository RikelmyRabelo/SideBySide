import 'dotenv/config';
import { Server, Socket } from 'socket.io';
import { prisma } from '../lib/prisma.js';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { z } from 'zod';
import { assertCanMessage } from '../utils/authorization.js';
import {
  enqueueMatch,
  dequeueMatchPair,
  removeMatch,
  setActiveSession,
  getActiveSession,
  removeActiveSession,
  setUserSocketMapping,
  removeUserSocketMapping,
} from '../services/sessionRedis.js';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be configured with at least 32 characters.');
}
const signingSecret = JWT_SECRET;

const ALLOWED_TOPICS = ['general', 'business', 'technology', 'travel', 'daily'] as const;

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

const webrtcSdpSchema = z.object({
  roomId: z.string().min(1, 'ID da sala é obrigatório.'),
  sdp: z.object({
    type: z.enum(['offer', 'answer', 'pranswer', 'rollback']),
    sdp: z.string().max(50000, 'Payload SDP excede o limite máximo permitido.')
  })
});

const webrtcIceSchema = z.object({
  roomId: z.string().min(1, 'ID da sala é obrigatório.'),
  candidate: z.object({
    candidate: z.string().max(2000, 'Candidato ICE excede o limite máximo permitido.'),
    sdpMid: z.string().nullable().optional(),
    sdpMLineIndex: z.number().nullable().optional()
  })
});

const cameraStatusSchema = z.object({ roomId: z.string(), camActive: z.boolean() });

const chatSchema = z.object({
  roomId: z.string().min(1, 'ID da sala é obrigatório.'),
  text: z.string().min(1, 'A mensagem não pode estar vazia.').max(1000, 'Mensagem muito longa. O limite é de 1000 caracteres.')
});

const directMessageSchema = z.object({
  recipientId: z.string().min(1, 'ID do destinatário é obrigatório.'),
  text: z.string().min(1, 'A mensagem não pode estar vazia.').max(1000, 'Mensagem muito longa. O limite é de 1000 caracteres.')
});

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
  const isRoomMember = async (roomId: string, userId: string, socketId: string): Promise<boolean> => {
    if (activeRooms.get(roomId)?.has(socketId)) return true;
    const session = await getActiveSession(roomId);
    return Boolean(session && (session.userA === userId || session.userB === userId));
  };

  io.use((socket, next) => {
    try {
      const cookies = cookie.parse(socket.request.headers.cookie || '');
      const token = cookies.token;

      if (!token) {
        return next(new Error('Autenticação não encontrada no handshake.'));
      }

      jwt.verify(token, signingSecret, (err, decoded) => {
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
      void setUserSocketMapping(user.id, socket.id).catch((error: unknown) => {
        console.error(`[Matchmaking Redis Error] Falha ao mapear socket ${socket.id}:`, error);
      });
    }

    socket.on('find_match', (data: unknown) => {
      safeParseEvent(findMatchSchema, data, async (parsedData) => {
        const rawTopic = parsedData?.topicId;
        const topicId = (rawTopic && rawTopic.trim() !== '') ? rawTopic : 'general';
        
        await removeMatch(topicId, user.id, socket.id);
        await enqueueMatch(topicId, user.id, socket.id);
        socketTopicMap.set(socket.id, topicId);

        const pair = await dequeueMatchPair(topicId);
        if (pair.length === 2 && pair[0] && pair[1]) {
          const socket1 = io.sockets.sockets.get(pair[0].socketId);
          const socket2 = io.sockets.sockets.get(pair[1].socketId);
          const user1 = pair[0];
          const user2 = pair[1];

          if (socket1 || socket2) {
             
            const roomId = `room_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            
            void io.in(`user_${user1.userId}`).socketsJoin(roomId);
            void io.in(`user_${user2.userId}`).socketsJoin(roomId);

            activeRooms.set(roomId, new Set([user1.socketId, user2.socketId]));
            if (socket1) socketRoomMap.set(socket1.id, roomId);
            if (socket2) socketRoomMap.set(socket2.id, roomId);
            void setActiveSession(roomId, { userA: user1.userId, userB: user2.userId, topicId });
            
            socketTopicMap.delete(user1.socketId);
            socketTopicMap.delete(user2.socketId);

            const u1Data = { name: 'Estudante', avatar: null as string | null };
            const u2Data = { name: 'Estudante', avatar: null as string | null };

            try {
              if (user1.userId) {
                const dbU1 = await prisma.user.findUnique({ where: { id: user1.userId } });
                if (dbU1) { u1Data.name = dbU1.name; u1Data.avatar = dbU1.avatar; }
              }
              if (user2.userId) {
                const dbU2 = await prisma.user.findUnique({ where: { id: user2.userId } });
                if (dbU2) { u2Data.name = dbU2.name; u2Data.avatar = dbU2.avatar; }
              }
            } catch (err: unknown) {
              console.error(`[Matchmaking DB Error] Falha ao buscar dados de perfil dos usuários na sala ${roomId}:`, err);
            }

            io.to(`user_${user1.userId}`).emit('match_found', { 
              roomId, 
              partnerId: user2.userId, 
              partnerName: u2Data.name, 
              partnerAvatar: u2Data.avatar, 
              initiator: true 
            });
            
            io.to(`user_${user2.userId}`).emit('match_found', { 
              roomId, 
              partnerId: user1.userId, 
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
      if (topicId && user?.id) {
        void removeMatch(topicId, user.id, socket.id);
        socketTopicMap.delete(socket.id);
      }
    });

    const handlePartnerLeave = (data?: unknown) => {
      safeParseEvent(leaveRoomSchema, data, async (parsedData) => {
        const targetRoomId = parsedData?.roomId || socketRoomMap.get(socket.id);
        
        if (targetRoomId && user?.id && await isRoomMember(targetRoomId, user.id, socket.id)) {
          socket.to(targetRoomId).emit('partner_left');
          const room = activeRooms.get(targetRoomId);
          if (room) {
            room.delete(socket.id);
            if (room.size === 0) activeRooms.delete(targetRoomId);
            void removeActiveSession(targetRoomId);
          }
          socket.leave(targetRoomId);
        }
        socketRoomMap.delete(socket.id);
      });
    };

    socket.on('leave_room', handlePartnerLeave);

    socket.on('disconnect', () => {
      const topicId = socketTopicMap.get(socket.id);
      if (topicId && user?.id) void removeMatch(topicId, user.id, socket.id);
      if (user?.id) void removeUserSocketMapping(user.id);
      handlePartnerLeave();
      socketTopicMap.delete(socket.id);
      socketRateLimits.delete(socket.id);
    });

    socket.on('camera_status', (data: unknown) => {
      safeParseEvent(cameraStatusSchema, data, (parsedData) => {
        void isRoomMember(parsedData.roomId, user?.id, socket.id).then((isMember) => {
          if (isMember) socket.to(parsedData.roomId).emit('camera_status', { camActive: parsedData.camActive });
        });
      });
    });

    socket.on('webrtc_offer', (data: unknown) => {
      safeParseEvent(webrtcSdpSchema, data, (parsedData) => {
        void isRoomMember(parsedData.roomId, user?.id, socket.id).then((isMember) => {
          if (isMember) socket.to(parsedData.roomId).emit('webrtc_offer', { sdp: parsedData.sdp });
        });
      });
    });

    socket.on('webrtc_answer', (data: unknown) => {
      safeParseEvent(webrtcSdpSchema, data, (parsedData) => {
        void isRoomMember(parsedData.roomId, user?.id, socket.id).then((isMember) => {
          if (isMember) socket.to(parsedData.roomId).emit('webrtc_answer', { sdp: parsedData.sdp });
        });
      });
    });
    
    socket.on('webrtc_ice_candidate', (data: unknown) => {
      safeParseEvent(webrtcIceSchema, data, (parsedData) => {
        void isRoomMember(parsedData.roomId, user?.id, socket.id).then((isMember) => {
          if (isMember) socket.to(parsedData.roomId).emit('webrtc_ice_candidate', { candidate: parsedData.candidate });
        });
      });
    });
    
    socket.on('chat_message', (data: unknown) => {
      safeParseEvent(chatSchema, data, (parsedData) => {
        void isRoomMember(parsedData.roomId, user?.id, socket.id).then((isMember) => {
          if (isMember) socket.to(parsedData.roomId).emit('chat_message', { text: parsedData.text, id: Date.now() });
        });
      });
    });

    socket.on('direct_message', (data: unknown) => {
      safeParseEvent(directMessageSchema, data, (parsedData) => {
        if (!user?.id) return;
        if (!user?.id) return;
        void assertCanMessage(user.id, parsedData.recipientId)
          .then(async () => {
            const message = await prisma.directMessage.create({
              data: { senderId: user.id, recipientId: parsedData.recipientId, text: parsedData.text }
            });
            io.to(`user_${parsedData.recipientId}`).emit('direct_message', {
              id: message.id,
              senderId: user.id,
              text: message.text,
              timestamp: message.createdAt.getTime()
            });
          })
          .catch(() => socket.emit('error', { message: 'Você não pode enviar mensagens para este usuário.' }));
      });
    });
  });
};