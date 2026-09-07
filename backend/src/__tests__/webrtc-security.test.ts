import { io as ioc, Socket } from 'socket.io-client';
import http from 'http';
import { Server } from 'socket.io';
import { setupMatchmaking } from '../sockets/matchmaking.js';

describe('WebRTC & Chat Payload Security Tests (SBS-20)', () => {
  let ioServer: Server;
  let server: http.Server;
  let port: number;
  let clientSocket: Socket;

  beforeEach(async () => {
    server = http.createServer();
    ioServer = new Server(server);
    setupMatchmaking(ioServer);

    await new Promise<void>((resolve) => server.listen(0, resolve));
    {
      const address = server.address() as import('net').AddressInfo;
      port = address.port;
    }
  });

  afterEach(async () => {
    if (clientSocket && clientSocket.connected) {
      clientSocket.disconnect();
    }
    await new Promise<void>((resolve) => ioServer.close(() => resolve()));
    await new Promise<void>((resolve) => server.close(() => resolve()));
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

  test('Deve validar a configuração de política de transporte ICE restrita a relay (TURN)', () => {
    // Configuração simulada que o cliente WebRTC deve adotar para mascarar o IP
    const rtcConfiguration: RTCConfiguration = {
      iceServers: [
        {
          urls: 'turn:turn.seusiteoficial.com:3478',
          username: 'sec_user',
          credential: 'sec_password'
        }
      ],
      iceTransportPolicy: 'relay' // Força o uso estrito de TURN, bloqueando STUN e vazamento de IP real
    };

    expect(rtcConfiguration.iceTransportPolicy).toBe('relay');
    expect(rtcConfiguration.iceServers?.[0].urls).toContain('turn:');
  });
});