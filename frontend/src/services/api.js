import axios from 'axios';

// ─── Base instance ────────────────────────────────────────────────
const api = axios.create({
  // Changed port from 3001 to 5000 to match your Flask backend
  baseURL: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api',
  // timeout: 10000,
  // headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor — inject JWT on every request ───────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor — handle 401 globally ──────────────────
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    const message = error.response?.data?.error || error.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
);

// ═══════════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════════
export const authAPI = {
  // Remove the extra '/auth' if your Flask routes are directly under the 'api' blueprint
  login:    (data)      => api.post('/login', data),
  register: (data)      => api.post('/register', data),
  me:       ()          => api.get('/me'),
};

// ═══════════════════════════════════════════════════════════════════
// ASSETS
// ═══════════════════════════════════════════════════════════════════
export const assetsAPI = {
  // If your Flask route is @api.route('/inventory'), change this to '/inventory'
  getAll:   (params)    => api.get('/assets', { params }),
  getOne:   (id)        => api.get(`/assets/${id}`),
  create:   (data)      => api.post('/assets', data),
  update:   (id, data)  => api.put(`/assets/${id}`, data),
  delete:   (id)        => api.delete(`/assets/${id}`),
  getQR:    (id)        => `${api.defaults.baseURL}/qr/${id}/qr`,  // returns PNG URL
  getGatePass: (id)     => api.get(`/vouchers/${id}/gate-pass`, { responseType: 'blob' }),
};

// ═══════════════════════════════════════════════════════════════════
// CONSUMABLES
// ═══════════════════════════════════════════════════════════════════
export const consumablesAPI = {
  getAll:   (params)    => api.get('/consumables', { params }),
  getOne:   (id)        => api.get(`/consumables/${id}`),
  create:   (data)      => api.post('/consumables', data),
  update:   (id, data)  => api.put(`/consumables/${id}`, data),
  delete:   (id)        => api.delete(`/consumables/${id}`),
  stockIn:  (id, data)  => api.post(`/consumables/${id}/stock-in`, data),
  issue:    (id, data)  => api.post(`/consumables/${id}/issue`, data),
};

// ═══════════════════════════════════════════════════════════════════
// LOCATIONS
// ═══════════════════════════════════════════════════════════════════
export const locationsAPI = {
  getAll:   ()          => api.get('/locations'),
  create:   (data)      => api.post('/locations', data),
  update:   (id, data)  => api.put(`/locations/${id}`, data),
  delete:   (id)        => api.delete(`/locations/${id}`),
};

// ═══════════════════════════════════════════════════════════════════
// CATEGORIES
// ═══════════════════════════════════════════════════════════════════
export const categoriesAPI = {
  getAll:   ()          => api.get('/categories'),
  create:   (data)      => api.post('/categories', data),
  update:   (id, data)  => api.put(`/categories/${id}`, data),
  delete:   (id)        => api.delete(`/categories/${id}`),
};

// ═══════════════════════════════════════════════════════════════════
// AUDIT LOGS
// ═══════════════════════════════════════════════════════════════════
export const logsAPI = {
  getAll:   (params)    => api.get('/logs', { params }),
  exportCSV: (params)   => api.get('/logs/export', { params, responseType: 'blob' }),
};

// ═══════════════════════════════════════════════════════════════════
// DASHBOARD / ALERTS
// ═══════════════════════════════════════════════════════════════════
export const dashboardAPI = {
  getStats:  ()         => api.get('/dashboard/stats'),
  getAlerts: ()         => api.get('/dashboard/alerts'),
};

// ═══════════════════════════════════════════════════════════════════
// USERS  (admin only)
// ═══════════════════════════════════════════════════════════════════
export const usersAPI = {
  getAll:   ()          => api.get('/users'),
  create:   (data)      => api.post('/users', data),
  update:   (id, data)  => api.put(`/users/${id}`, data),
  delete:   (id)        => api.delete(`/users/${id}`),
};

export default api;