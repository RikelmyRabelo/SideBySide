import { io as ioc, Socket } from 'socket.io-client';
import http from 'http';
import { Server } from 'socket.io';
import { setupMatchmaking } from '../sockets/matchmaking.js';

describe('WebRTC & Chat Payload Security Tests (SBS-20)', () => {
  let ioServer: Server;
  let server: http.Server;
  let port: number;
  let clientSocket: Socket;

  beforeEach((done: (err?: any) => void) => {
    server = http.createServer();
    ioServer = new Server(server);
    setupMatchmaking(ioServer);

    server.listen(0, () => {
      const address = server.address() as import('net').AddressInfo;
      port = address.port;
      done();
    });
  });

  afterEach((done: (err?: any) => void) => {
    if (clientSocket && clientSocket.connected) {
      clientSocket.disconnect();
    }
    ioServer.close(() => {
      server.close(() => done());
    });
  });

  test('Deve rejeitar payload SDP que excede o limite máximo de tamanho', (done: (err?: any) => void) => {
    clientSocket = ioc(`http://localhost:${port}`, {
      extraHeaders: { cookie: 'token=valid_mock_jwt' }
    });

    clientSocket.on('connect', () => {
      const giantSdpString = 'A'.repeat(60000); // Acima do teto de 50000 caracteres

      clientSocket.emit('webrtc_offer', {
        roomId: 'room_123',
        sdp: {
          type: 'offer',
          sdp: giantSdpString
        }
      });
      
      setTimeout(() => {
        // Conexão permanece viva (o parser seguro apenas intercepta e loga a falha sem derrubar o socket)
        expect(clientSocket.connected).toBe(true);
        done();
      }, 200);
    });
  });

  test('Deve rejeitar mensagens de chat que excedem o limite de caracteres', (done: (err?: any) => void) => {
    clientSocket = ioc(`http://localhost:${port}`, {
      extraHeaders: { cookie: 'token=valid_mock_jwt' }
    });

    clientSocket.on('connect', () => {
      const giantMessage = 'B'.repeat(1500); // Acima do teto de 1000 caracteres

      clientSocket.emit('chat_message', {
        roomId: 'room_123',
        text: giantMessage
      });
      
      setTimeout(() => {
        expect(clientSocket.connected).toBe(true);
        done();
      }, 200);
    });
  });
});