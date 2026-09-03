import { useEffect } from 'react';
import { socket } from '../services/socket';

interface RealtimeSyncOptions {
  onNotification?: (notification: any) => void;
  onFriendRequest?: (request: any) => void;
  onDirectMessage?: (message: any) => void;
}

export function useRealtimeSync(options: RealtimeSyncOptions) {
  useEffect(() => {
    if (!socket) return;

    const handleNotification = (data: any) => {
      options.onNotification?.(data);
    };

    const handleFriendRequest = (data: any) => {
      options.onFriendRequest?.(data);
    };

    const handleDirectMessage = (data: any) => {
      options.onDirectMessage?.(data);
    };

    socket.on('notification_received', handleNotification);
    socket.on('friend_request_received', handleFriendRequest);
    socket.on('direct_message', handleDirectMessage);

    return () => {
      socket.off('notification_received', handleNotification);
      socket.off('friend_request_received', handleFriendRequest);
      socket.off('direct_message', handleDirectMessage);
    };
  }, [options]);
}