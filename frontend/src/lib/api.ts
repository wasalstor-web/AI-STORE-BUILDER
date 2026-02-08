import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// ── Interceptor: أضف التوكن لكل طلب ──
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Interceptor: إذا 401، أمسح التوكن ──
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;

// ══════ Auth API ══════
export const authApi = {
  register: (data: { email: string; password: string; full_name: string; tenant_name: string }) =>
    api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  me: () => api.get('/auth/me'),

  refresh: (refresh_token: string) =>
    api.post('/auth/refresh', { refresh_token }),
};

// ══════ Stores API ══════
export const storesApi = {
  list: (skip = 0, limit = 20) =>
    api.get(`/stores/?skip=${skip}&limit=${limit}`),

  get: (id: string) =>
    api.get(`/stores/${id}`),

  generate: (data: {
    name: string;
    store_type: string;
    language?: string;
    branding?: Record<string, unknown>;
    payment?: Record<string, unknown>;
    shipping?: Record<string, unknown>;
    features?: string[];
  }) => api.post('/stores/generate', data),

  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/stores/${id}`, data),

  delete: (id: string) =>
    api.delete(`/stores/${id}`),
};

// ══════ Jobs API ══════
export const jobsApi = {
  get: (id: string) => api.get(`/jobs/${id}`),
  list: (skip = 0, limit = 20, status?: string) => {
    let url = `/jobs/?skip=${skip}&limit=${limit}`;
    if (status) url += `&status_filter=${status}`;
    return api.get(url);
  },
};

// ══════ Tenants API ══════
export const tenantsApi = {
  current: () => api.get('/tenants/current'),
  update: (data: Record<string, unknown>) => api.patch('/tenants/current', data),
};

// ══════ AI Chat API ══════
export const aiChatApi = {
  send: (data: {
    message: string;
    current_html: string;
    store_name?: string;
    store_type?: string;
  }) => api.post('/ai/chat', data),
};
