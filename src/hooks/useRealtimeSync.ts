import { useEffect } from 'react';
import { socket } from '../services/socket';
import { invalidateCache } from './useFetchCache';

interface RealtimeSyncOptions {
  onNotification?: (notification: any) => void;
  onFriendRequest?: (request: any) => void;
  onDirectMessage?: (message: any) => void;
  invalidateUrlsOnEvent?: string[];
}

export function useRealtimeSync(options: RealtimeSyncOptions) {
  useEffect(() => {
    if (!socket) return;

    const handleEventTrigger = () => {
      if (options.invalidateUrlsOnEvent) {
        options.invalidateUrlsOnEvent.forEach((url) => invalidateCache(url));
      }
    };

    const handleNotification = (data: any) => {
      handleEventTrigger();
      options.onNotification?.(data);
    };

    const handleFriendRequest = (data: any) => {
      handleEventTrigger();
      options.onFriendRequest?.(data);
    };

    const handleDirectMessage = (data: any) => {
      handleEventTrigger();
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