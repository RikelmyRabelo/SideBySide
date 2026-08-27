import { Server, Socket } from 'socket.io';

const queues: Record<string, Socket[]> = {};
const activeRooms: Map<string, Set<string>> = new Map();
const socketRoomMap: Map<string, string> = new Map();
const socketTopicMap: Map<string, string> = new Map();

export const setupMatchmaking = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Novo usuário conectado: ${socket.id}`);

    socket.on('find_match', (data?: { topicId?: string }) => {
      // Se não houver tópico, vai para a fila geral (bate-papo livre)
      const topicId = data?.topicId || 'general';
      console.log(`🔍 ${socket.id} entrou na fila: ${topicId}`);
      
      if (!queues[topicId]) queues[topicId] = [];
      
      // Remove de outras filas de segurança para evitar duplicatas
      for (const key in queues) {
        queues[key] = queues[key].filter(s => s.id !== socket.id);
      }
      
      queues[topicId].push(socket);
      socketTopicMap.set(socket.id, topicId);

      // Algoritmo de Pareamento Restrito à Fila do Tópico
      if (queues[topicId].length >= 2) {
        const user1 = queues[topicId].shift();
        const user2 = queues[topicId].shift();

        if (user1 && user2) {
          const roomId = `room_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
          
          user1.join(roomId);
          user2.join(roomId);

          activeRooms.set(roomId, new Set([user1.id, user2.id]));
          socketRoomMap.set(user1.id, roomId);
          socketRoomMap.set(user2.id, roomId);
          
          socketTopicMap.delete(user1.id);
          socketTopicMap.delete(user2.id);

          console.log(`🤝 MATCH ENCONTRADO na fila [${topicId}]: ${user1.id} <> ${user2.id} (${roomId})`);

          // Initiator = true define quem inicia a oferta WebRTC
          user1.emit('match_found', { roomId, partnerId: user2.id, partnerName: 'Estudante', initiator: true });
          user2.emit('match_found', { roomId, partnerId: user1.id, partnerName: 'Estudante', initiator: false });
        }
      }
    });

    socket.on('cancel_match', () => {
      const topicId = socketTopicMap.get(socket.id);
      if (topicId && queues[topicId]) {
        queues[topicId] = queues[topicId].filter(s => s.id !== socket.id);
        socketTopicMap.delete(socket.id);
        console.log(`❌ ${socket.id} cancelou a busca na fila: ${topicId}`);
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
        console.log(`🚪 ${socket.id} saiu da sala ${roomId}`);
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
      console.log(`🔌 Usuário desconectado: ${socket.id}`);
    });

    socket.on('webrtc_offer', (data) => socket.to(data.roomId).emit('webrtc_offer', { sdp: data.sdp }));
    socket.on('webrtc_answer', (data) => socket.to(data.roomId).emit('webrtc_answer', { sdp: data.sdp }));
    socket.on('webrtc_ice_candidate', (data) => socket.to(data.roomId).emit('webrtc_ice_candidate', { candidate: data.candidate }));
    socket.on('chat_message', (data) => socket.to(data.roomId).emit('chat_message', { text: data.text, id: Date.now() }));
  });
};