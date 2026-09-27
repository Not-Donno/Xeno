const API_BASE = '/api';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      data?.message || data?.error || `Request failed with status ${res.status}`;
    throw new ApiError(
      Array.isArray(message) ? message.join(', ') : message,
      res.status
    );
  }

  // Unwrap the { success, data } envelope
  if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
    return data.data;
  }
  return data as T;
}

export const api = {
  get: <T>(endpoint: string, token?: string | null) =>
    request<T>(endpoint, { method: 'GET' }, token),

  post: <T>(endpoint: string, body?: any, token?: string | null) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }, token),

  patch: <T>(endpoint: string, body?: any, token?: string | null) =>
    request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }, token),

  delete: <T>(endpoint: string, token?: string | null) =>
    request<T>(endpoint, { method: 'DELETE' }, token),
};
