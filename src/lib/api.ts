const API_BASE_URL = 'http://localhost:5133'; // Ajuste conforme a porta da sua API

interface FetchOptions extends RequestInit {
  skipAuthRedirect?: boolean;
}

export const apiFetch = async (endpoint: string, options: FetchOptions = {}): Promise<Response> => {
  const { skipAuthRedirect, ...fetchOptions } = options;

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers || {}),
  };

  const response = await fetch(url, {
    ...fetchOptions,
    headers: defaultHeaders,
    credentials: 'include', // Injecção automática exigida pelo projeto
  });

  // Intercepta falhas de autenticação / sessão expirada (401 ou 403)
  if ((response.status === 401 || response.status === 403) && !skipAuthRedirect) {
    // Evita loop se já estiver na tela de login
    if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/')) {
      console.warn('Sessão expirada ou não autorizada. Redirecionando para o login...');
      window.location.href = '/login';
    }
  }

  return response;
};

// Funções utilitárias opcionais de atalho (GET, POST, PUT, DELETE)
export const api = {
  get: (endpoint: string, options?: FetchOptions) => apiFetch(endpoint, { ...options, method: 'GET' }),
  post: (endpoint: string, body?: any, options?: FetchOptions) => apiFetch(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint: string, body?: any, options?: FetchOptions) => apiFetch(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint: string, options?: FetchOptions) => apiFetch(endpoint, { ...options, method: 'DELETE' }),
};