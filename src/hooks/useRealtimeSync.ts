import { useEffect } from 'react';
import { socket } from '../services/socket';
import { invalidateCache } from './useFetchCache';

export interface RealtimeNotification {
  id: string;
  title: string;
  message: string;
  read?: boolean;
  createdAt?: string;
  [key: string]: unknown;
}

export interface RealtimeFriendRequest {
  requestId: string;
  senderId: string;
  name: string;
  avatar: string;
  tag?: string;
  level?: string;
}

export interface RealtimeDirectMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}

export interface RealtimeSyncOptions {
  onNotification?: (notification: RealtimeNotification) => void;
  onFriendRequest?: (request: RealtimeFriendRequest) => void;
  onDirectMessage?: (message: RealtimeDirectMessage) => void;
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

    const handleNotification = (data: RealtimeNotification) => {
      handleEventTrigger();
      options.onNotification?.(data);
    };

    const handleFriendRequest = (data: RealtimeFriendRequest) => {
      handleEventTrigger();
      options.onFriendRequest?.(data);
    };

    const handleDirectMessage = (data: RealtimeDirectMessage) => {
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