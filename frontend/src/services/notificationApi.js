import axios from 'axios';

const getApiBase = () => {
  if (process.env.REACT_APP_API_URL) {
    const raw = process.env.REACT_APP_API_URL.trim().replace(/\/+$/, '');
    return raw.endsWith('/api') ? raw : `${raw}/api`;
  }
  if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
    return 'https://kathavani-backend.onrender.com/api';
  }
  return 'http://localhost:5000/api';
};

const API_BASE = getApiBase();

const getHeaders = (isAdmin = false) => {
  const token = isAdmin
    ? (localStorage.getItem('kv_admin_token') || localStorage.getItem('kv_token'))
    : (localStorage.getItem('kv_token') || localStorage.getItem('kv_admin_token'));
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchNotifications = async ({ filter = 'all', limit = 50, isAdmin = false } = {}) => {
  const res = await axios.get(`${API_BASE}/notifications`, {
    params: { filter, limit },
    headers: getHeaders(isAdmin)
  });
  return res.data;
};

export const markNotificationRead = async (id, isAdmin = false) => {
  const res = await axios.put(`${API_BASE}/notifications/${id}/read`, {}, {
    headers: getHeaders(isAdmin)
  });
  return res.data;
};

export const markAllNotificationsRead = async (isAdmin = false) => {
  const res = await axios.put(`${API_BASE}/notifications/read-all`, {}, {
    headers: getHeaders(isAdmin)
  });
  return res.data;
};

export const deleteNotification = async (id, isAdmin = false) => {
  const res = await axios.delete(`${API_BASE}/notifications/${id}`, {
    headers: getHeaders(isAdmin)
  });
  return res.data;
};
