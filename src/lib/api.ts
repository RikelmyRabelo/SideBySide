const API_BASE_URL = 'http://localhost:3000';

interface FetchOptions extends RequestInit {
  skipAuthRedirect?: boolean;
}

let csrfTokenCache: string | null = null;
let csrfTokenPromise: Promise<string | null> | null = null;

// Função para buscar e armazenar em memória o token CSRF
export const fetchCsrfToken = async (): Promise<string | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/csrf-token`, {
      credentials: 'include',
    });
    if (!res.ok) return null;
    const data = await res.json();
    csrfTokenCache = data.csrfToken || null;
    return csrfTokenCache;
  } catch (error) {
    console.error('Falha ao obter token CSRF:', error);
    return null;
  } finally {
    csrfTokenPromise = null;
  }
};

export const apiFetch = async (endpoint: string, options: FetchOptions = {}): Promise<Response> => {
  const { skipAuthRedirect, ...fetchOptions } = options;
  const method = (fetchOptions.method || 'GET').toUpperCase();

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Se for POST, PUT, DELETE, PATCH, precisamos garantir que temos o token CSRF
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    if (!csrfTokenCache) {
      if (!csrfTokenPromise) {
        csrfTokenPromise = fetchCsrfToken();
      }
      await csrfTokenPromise;
    }

    if (csrfTokenCache) {
      defaultHeaders['x-csrf-token'] = csrfTokenCache;
    }
  }

  const finalHeaders = {
    ...defaultHeaders,
    ...(fetchOptions.headers as Record<string, string> || {}),
  };

  let response = await fetch(url, {
    ...fetchOptions,
    headers: finalHeaders,
    credentials: 'include',
  });

  // Se der erro 403 de CSRF expirado/inválido, tenta renovar o token 1 vez e reenviar
  if (response.status === 403 && !['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const errorData = await response.clone().json().catch(() => ({}));
    if (errorData?.error?.includes('CSRF')) {
      const newToken = await fetchCsrfToken();
      if (newToken) {
        finalHeaders['x-csrf-token'] = newToken;
        response = await fetch(url, {
          ...fetchOptions,
          headers: finalHeaders,
          credentials: 'include',
        });
      }
    }
  }

  if ((response.status === 401 || response.status === 403) && !skipAuthRedirect) {
    const isAuthRoute = window.location.pathname.includes('/login') || window.location.pathname === '/';
    if (!isAuthRoute && response.status === 401) {
      console.warn('Sessão expirada. Redirecionando para o login...');
      window.location.href = '/';
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw { response: { data: errorData }, message: errorData.error || 'Erro na requisição' };
  }

  return response;
};

export const api = {
  get: async (endpoint: string, options?: FetchOptions) => {
    const res = await apiFetch(endpoint, { ...options, method: 'GET' });
    return { data: await res.json().catch(() => ({})) };
  },
   
  post: async (endpoint: string, body?: unknown, options?: FetchOptions) => {
    const res = await apiFetch(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) });
    return { data: await res.json().catch(() => ({})) };
  },
   
  put: async (endpoint: string, body?: unknown, options?: FetchOptions) => {
    const res = await apiFetch(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) });
    return { data: await res.json().catch(() => ({})) };
  },
   
  delete: async (endpoint: string, options?: FetchOptions) => {
    const res = await apiFetch(endpoint, { ...options, method: 'DELETE' });
    return { data: await res.json().catch(() => ({})) };
  },
};

export default api;