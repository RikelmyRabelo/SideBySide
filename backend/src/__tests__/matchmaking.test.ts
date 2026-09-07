import { io as ioc, Socket } from 'socket.io-client';
import http from 'http';
import { Server } from 'socket.io';
import { setupMatchmaking } from '../sockets/matchmaking.js';

describe('Matchmaking Security & Validation Tests (SBS-19)', () => {
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

  test('Deve rejeitar tópico inválido via Zod enum e manter estabilidade', (done: (err?: any) => void) => {
    clientSocket = ioc(`http://localhost:${port}`, {
      extraHeaders: { cookie: 'token=valid_mock_jwt' }
    });

    clientSocket.on('connect', () => {
      clientSocket.emit('find_match', { topicId: 'topico_invalido_malicioso' });
      
      setTimeout(() => {
        expect(clientSocket.connected).toBe(true);
        done();
      }, 200);
    });
  });

  test('Deve disparar evento queue_full ao exceder o limite máximo da fila', (done: (err?: any) => void) => {
    const sockets: Socket[] = [];
    const totalClients = 102; 
    let fullEventsReceived = 0;

    for (let i = 0; i < totalClients; i++) {
      const s = ioc(`http://localhost:${port}`, {
        extraHeaders: { cookie: 'token=valid_mock_jwt' }
      });
      sockets.push(s);

      s.on('connect', () => {
        s.emit('find_match', { topicId: 'technology' });
      });

      s.on('queue_full', () => {
        fullEventsReceived++;
        if (fullEventsReceived > 0) {
          sockets.forEach((sock) => sock.disconnect());
          done();
        }
      });
    }
  });
});