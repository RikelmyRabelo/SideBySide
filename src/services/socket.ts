import { io, Socket } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_WS_URL ||
  (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/api\/?$/, '');

console.log('[Socket] URL:', SOCKET_URL);

class SocketClient {
  private static instance: Socket | null = null;

  public static getInstance(): Socket {
    if (!SocketClient.instance) {
      SocketClient.instance = io(SOCKET_URL, {
        // FORÇA WEBSOCKET PURO: Elimina de vez o polling HTTP e o erro "Session ID unknown"
        transports: ['websocket'],
        upgrade: false,
        withCredentials: true,
        autoConnect: true,
        // Envia o token de autenticação atualizado dinamicamente em cada conexão
        auth: (cb) => {
          const token = localStorage.getItem('token');
          cb({ token: token || undefined });
        },
      });

      SocketClient.instance.on('connect', () => {
        console.log('[Socket] Conectado com sucesso via WebSocket:', SocketClient.instance?.id);
      });

      SocketClient.instance.on('connect_error', (error) => {
        console.error('[Socket] Erro de conexão:', error.message);
      });
    }
    return SocketClient.instance;
  }

  public static disconnect(): void {
    if (SocketClient.instance) {
      SocketClient.instance.disconnect();
      SocketClient.instance = null;
    }
  }
}

export const socket = SocketClient.getInstance();