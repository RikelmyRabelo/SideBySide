import { useState, useEffect } from 'react';

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
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:3000/api/room/status', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setStatus(data);
        }
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