import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

const globalCache: Record<string, CacheItem<unknown>> = {};
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos de cache

export function invalidateCache(url?: string) {
  if (url) {
    delete globalCache[url];
  } else {
    Object.keys(globalCache).forEach((key) => delete globalCache[key]);
  }
}

export function updateCacheData<T>(url: string, updater: (oldData: T | null) => T) {
  const cached = globalCache[url];
  const currentData = cached ? (cached.data as T) : null;
  const newData = updater(currentData);
  globalCache[url] = {
    data: newData,
    timestamp: Date.now(),
  };
}

export function useFetchCache<T>(url: string, options?: RequestInit, ttl: number = DEFAULT_TTL) {
  const [data, setData] = useState<T | null>((globalCache[url]?.data as T) || null);
  const [isLoading, setIsLoading] = useState<boolean>(!globalCache[url]);
  const [error, setError] = useState<Error | null>(null);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const fetchData = useCallback(async (force = false) => {
    const cached = globalCache[url];
    const isFresh = cached && (Date.now() - cached.timestamp < ttl);

    if (isFresh && !force) {
      setData(cached.data as T);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        ...optionsRef.current,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...(optionsRef.current?.headers || {}),
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
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error('Erro desconhecido na requisição.'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [url, ttl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: () => fetchData(true) };
}