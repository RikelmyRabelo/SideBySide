import { useState, useEffect, useCallback } from 'react';
const globalCache = {};
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos de cache
export function useFetchCache(url, options, ttl = DEFAULT_TTL) {
    const [data, setData] = useState(globalCache[url]?.data || null);
    const [isLoading, setIsLoading] = useState(!globalCache[url]);
    const [error, setError] = useState(null);
    const fetchData = useCallback(async (force = false) => {
        const cached = globalCache[url];
        const isFresh = cached && (Date.now() - cached.timestamp < ttl);
        if (isFresh && !force) {
            setData(cached.data);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    ...(options?.headers || {}),
                },
            });
            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status}`);
            }
            const result = await response.json();
            globalCache[url] = {
                data: result,
                timestamp: Date.now(),
            };
            setData(result);
            setError(null);
        }
        catch (err) {
            setError(err);
        }
        finally {
            setIsLoading(false);
        }
    }, [url, options, ttl]);
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    return { data, isLoading, error, refetch: () => fetchData(true) };
}
