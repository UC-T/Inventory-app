import axios from 'axios';

// ─── Base Configuration ───────────────────────────────────────────
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://inventory-app-flame-delta.vercel.app/api' // REPLACE with your actual Vercel URL
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ──────────────────────────────────────────
// This automatically attaches the JWT to every single call
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    // Check if token exists AND isn't the string "null" or "undefined"
    if (token && token !== 'null' && token !== 'undefined') {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // If no valid token, we don't send the header at all
      // This forces a 401 Unauthorized instead of a messy 422
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────
// This handles 401s (expired sessions) and unwraps the data
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      // Only redirect if we aren't already on the login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    const message = error.response?.data?.error || error.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
);

// ═══════════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════════
export const authAPI = {
  login:    (data) => api.post('/login', data),
  register: (data) => api.post('/register', data),
  me:       ()     => api.get('/me'),
};

// ═══════════════════════════════════════════════════════════════════
// ASSETS
// ═══════════════════════════════════════════════════════════════════
export const assetsAPI = {
  // We use the 'api' instance here now, NOT 'axios' directly
  getAll: (params)     => api.get('/assets', { params }),
  getOne: (id)         => api.get(`/assets/${id}`),
  create: (data)       => api.post('/assets', data),
  update: (id, data)   => api.put(`/assets/${id}`, data),
  delete: (id)         => api.delete(`/assets/${id}`),
  
  // Helpers for special files
  getQR: (id)          => `${API_BASE_URL}/qr/${id}/qr`, 
  getGatePass: (id)    => api.get(`/vouchers/${id}/gate-pass`, { responseType: 'blob' }),
};

// ═══════════════════════════════════════════════════════════════════
// CONSUMABLES
// ═══════════════════════════════════════════════════════════════════
export const consumablesAPI = {
  getAll:   (params) => api.get('/consumables', { params }),
  create:   (data)   => api.post('/consumables', data),
  update:   (id, data)=> api.put(`/consumables/${id}`, data),
  delete:   (id)     => api.delete(`/consumables/${id}`),
};

// ═══════════════════════════════════════════════════════════════════
// LOCATIONS & CATEGORIES
// ═══════════════════════════════════════════════════════════════════
export const locationsAPI = {
  getAll: ()       => api.get('/locations'),
  create: (data)   => api.post('/locations', data),
  delete: (id)     => api.delete(`/locations/${id}`),
};

export const categoriesAPI = {
  getAll: ()       => api.get('/categories'),
  create: (data)   => api.post('/categories', data),
  update: (id, data)=> api.put(`/categories/${id}`, data),
  delete: (id)     => api.delete(`/categories/${id}`),
};

// ═══════════════════════════════════════════════════════════════════
// DASHBOARD & LOGS
// ═══════════════════════════════════════════════════════════════════
export const logsAPI = {
  getAll: (params) => api.get('/logs', { params }),
};

export const dashboardAPI = {
  getStats:  () => api.get('/dashboard/stats'),
  getAlerts: () => api.get('/dashboard/alerts'),
};

export default api;