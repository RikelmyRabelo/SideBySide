import { useState, useEffect } from 'react';
import { api } from '../services/api';

export interface RoomStatus {
  hasActiveSession: boolean;
  sessionId?: string;
  topicId?: string;
}

export const useRoomStatus = () => {
  const [status, setStatus] = useState<RoomStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await api.get('/api/room/status');
        setStatus(response.data);
      } catch (_err) {
        // Silenciado para evitar warning de unused var
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, []);

  return { status, loading };
};