import { Server, Socket } from 'socket.io';
import { prisma } from '../lib/prisma';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'seu-segredo-super-seguro';

const queues: Record<string, Socket[]> = {};
const activeRooms: Map<string, Set<string>> = new Map();
const socketRoomMap: Map<string, string> = new Map();
const socketTopicMap: Map<string, string> = new Map();

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

    if (user?.id) {
      socket.join(`user_${user.id}`);
    }

    socket.on('find_match', async (data?: { topicId?: string }) => {
      const topicId = data?.topicId || 'general';
      
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
    });

    socket.on('webrtc_offer', (data) => socket.to(data.roomId).emit('webrtc_offer', { sdp: data.sdp }));
    socket.on('webrtc_answer', (data) => socket.to(data.roomId).emit('webrtc_answer', { sdp: data.sdp }));
    socket.on('webrtc_ice_candidate', (data) => socket.to(data.roomId).emit('webrtc_ice_candidate', { candidate: data.candidate }));
    
    socket.on('chat_message', (data) => {
      socket.to(data.roomId).emit('chat_message', { text: data.text, id: Date.now() });
    });

    socket.on('direct_message', (data: { recipientId: string; text: string }) => {
      io.to(`user_${data.recipientId}`).emit('direct_message', {
        senderId: user?.id,
        text: data.text,
        timestamp: Date.now()
      });
    });
  });
}