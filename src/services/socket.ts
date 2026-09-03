import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class SocketClient {
  private static instance: Socket | null = null;

  public static getInstance(): Socket {
    if (!SocketClient.instance) {
      SocketClient.instance = io(SOCKET_URL, {
        withCredentials: true,
        autoConnect: true,
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