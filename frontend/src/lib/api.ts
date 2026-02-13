import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/v1",
  headers: { "Content-Type": "application/json" },
});

// ── Interceptor: أضف التوكن لكل طلب ──
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Interceptor: إذا 401، حاول تجديد التوكن ──
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (token) prom.resolve(token);
    else prom.reject(error);
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    // Skip refresh logic for login/register/refresh endpoints
    const skipPaths = ["/auth/login", "/auth/register", "/auth/refresh"];
    if (
      err.response?.status === 401 &&
      !originalRequest._retry &&
      !skipPaths.some((p) => originalRequest.url?.includes(p))
    ) {
      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        localStorage.removeItem("access_token");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(err);
      }

      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject: (error: unknown) => reject(error),
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await authApi.refresh(refreshToken);
        const newToken = res.data.access_token;
        const newRefresh = res.data.refresh_token;

        localStorage.setItem("access_token", newToken);
        if (newRefresh) localStorage.setItem("refresh_token", newRefresh);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);

        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  },
);

export default api;

// ══════ Auth API ══════
export const authApi = {
  register: (data: {
    email: string;
    password: string;
    full_name: string;
    tenant_name: string;
  }) => api.post("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),

  me: () => api.get("/auth/me"),

  refresh: (refresh_token: string) =>
    api.post("/auth/refresh", { refresh_token }),

  updateProfile: (data: {
    full_name?: string;
    current_password?: string;
    new_password?: string;
  }) => api.patch("/auth/me", data),

  verifyEmail: (data: { email: string; code: string }) =>
    api.post("/auth/verify-email", data),

  resendVerification: (data: { email: string }) =>
    api.post("/auth/resend-verification", data),

  forgotPassword: (data: { email: string }) =>
    api.post("/auth/forgot-password", data),

  resetPassword: (data: { email: string; code: string; new_password: string }) =>
    api.post("/auth/reset-password", data),
};

// ══════ Stores API ══════
export const storesApi = {
  list: (skip = 0, limit = 20) =>
    api.get(`/stores/?skip=${skip}&limit=${limit}`),

  get: (id: string) => api.get(`/stores/${id}`),

  generate: (data: {
    name: string;
    store_type: string;
    language?: string;
    branding?: Record<string, unknown>;
    payment?: Record<string, unknown>;
    shipping?: Record<string, unknown>;
    features?: string[];
  }) => api.post("/stores/generate", data),

  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/stores/${id}`, data),

  delete: (id: string) => api.delete(`/stores/${id}`),
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
  current: () => api.get("/tenants/current"),
  update: (data: Record<string, unknown>) =>
    api.patch("/tenants/current", data),
};

// ══════ AI Chat API ══════
export const aiChatApi = {
  /** Conversational AI — chat without generating HTML */
  converse: (data: {
    message: string;
    conversation_history: Array<{ role: string; content: string }>;
    store_name?: string;
    store_type?: string;
  }) => api.post("/ai/conversation", data),

  /** Generate/modify HTML based on user request */
  send: (data: {
    message: string;
    current_html: string;
    store_name?: string;
    store_type?: string;
  }) => api.post("/ai/chat", data),

  // اختبار Claude بدون مصادقة (للتطوير)
  test: (data: {
    message: string;
    current_html: string;
    store_name?: string;
    store_type?: string;
  }) => api.post("/ai/test", data),
};

// ══════ Products API ══════
export const productsApi = {
  list: (
    storeId: string,
    params?: {
      page?: number;
      page_size?: number;
      category_id?: string;
      search?: string;
      is_active?: boolean;
      is_featured?: boolean;
    },
  ) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.page_size) q.set("page_size", String(params.page_size));
    if (params?.category_id) q.set("category_id", params.category_id);
    if (params?.search) q.set("search", params.search);
    if (params?.is_active !== undefined)
      q.set("is_active", String(params.is_active));
    if (params?.is_featured !== undefined)
      q.set("is_featured", String(params.is_featured));
    return api.get(`/stores/${storeId}/products?${q.toString()}`);
  },

  get: (productId: string) => api.get(`/products/${productId}`),

  create: (storeId: string, data: Record<string, unknown>) =>
    api.post(`/stores/${storeId}/products`, data),

  update: (productId: string, data: Record<string, unknown>) =>
    api.patch(`/products/${productId}`, data),

  delete: (productId: string) => api.delete(`/products/${productId}`),
};

// ══════ Categories API ══════
export const categoriesApi = {
  list: (storeId: string, parentId?: string) => {
    const q = parentId ? `?parent_id=${parentId}` : "";
    return api.get(`/stores/${storeId}/categories${q}`);
  },

  get: (categoryId: string) => api.get(`/categories/${categoryId}`),

  create: (storeId: string, data: Record<string, unknown>) =>
    api.post(`/stores/${storeId}/categories`, data),

  update: (categoryId: string, data: Record<string, unknown>) =>
    api.patch(`/categories/${categoryId}`, data),

  delete: (categoryId: string) => api.delete(`/categories/${categoryId}`),
};

// ══════ Orders API ══════
export const ordersApi = {
  list: (
    storeId: string,
    params?: {
      page?: number;
      page_size?: number;
      status?: string;
      payment_status?: string;
    },
  ) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.page_size) q.set("page_size", String(params.page_size));
    if (params?.status) q.set("status", params.status);
    if (params?.payment_status) q.set("payment_status", params.payment_status);
    return api.get(`/stores/${storeId}/orders?${q.toString()}`);
  },

  get: (orderId: string) => api.get(`/orders/${orderId}`),

  checkout: (storeId: string, data: Record<string, unknown>) =>
    api.post(`/stores/${storeId}/checkout`, data),

  update: (orderId: string, data: Record<string, unknown>) =>
    api.patch(`/orders/${orderId}`, data),

  summary: (storeId: string) => api.get(`/stores/${storeId}/orders/summary`),
};

// ══════ Payments API ══════
export const paymentsApi = {
  createPayment: (orderId: string, gateway: string = "moyasar") =>
    api.post(`/orders/${orderId}/pay?gateway=${gateway}`),
};

// ══════ Uploads API ══════
export const uploadsApi = {
  uploadImage: (file: File, folder: string = "products") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    return api.post("/upload/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deleteImage: (url: string) =>
    api.delete("/upload/image", { params: { url } }),
};

// ══════ Dashboard API ══════
export const dashboardApi = {
  stats: () => api.get("/dashboard/stats"),
};
