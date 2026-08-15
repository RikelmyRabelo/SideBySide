import { useState, useEffect } from 'react';
export const useRoomStatus = () => {
    const [status, setStatus] = useState(null);
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
            }
            catch (err) {
                console.error("Erro ao verificar status da sala:", err);
            }
            finally {
                setLoading(false);
            }
        };
        checkStatus();
    }, []);
    return { status, loading };
};
