import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('kv_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res.data,
  err => Promise.reject(err.response?.data || err)
);

export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

// Stories
export const getStories = (params) => api.get('/stories', { params });
export const getStory = (id) => api.get(`/stories/${id}`);
export const createStory = (data) => api.post('/stories', data);
export const updateStory = (id, data) => api.put(`/stories/${id}`, data);
export const deleteStory = (id) => api.delete(`/stories/${id}`);
export const voteStory = (id) => api.post(`/stories/${id}/vote`);
export const getAuthenticity = (id) => api.get(`/stories/${id}/authenticity`);
export const getGeoStories = () => api.get('/stories/geo/map');
export const saveNodeGraph = (id, nodeGraph) => api.put(`/stories/${id}/nodes`, { nodeGraph });

// Users
export const updatePreferences = (data) => api.put('/users/preferences', data);
export const addKarma = (points) => api.put('/users/karma', { points });
export const submitQuizScore = (data) => api.post('/users/quiz', data);
export const changePassword = (data) => api.put('/users/password', data);
export const deleteAccount = () => api.delete('/users/account');
export const getLeaderboard = () => api.get('/users/leaderboard');

// Gamification
export const getQuizzes = () => api.get('/gamification/quizzes');
export const getQuiz = (id) => api.get(`/gamification/quizzes/${id}`);
export const submitQuiz = (id, answers) => api.post(`/gamification/quizzes/${id}/submit`, { answers });
export const getAllBadges = () => api.get('/gamification/badges');

// Vault
export const getOfflinePacks = () => api.get('/vault/offline-packs');
export const syncOfflineStories = (stories) => api.post('/vault/sync', { offlineStories: stories });
export const getFeaturedStories = () => api.get('/vault/featured');
export const getVaultTags = () => api.get('/vault/tags');

export default api;
