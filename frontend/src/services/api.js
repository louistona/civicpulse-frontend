import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Automatically attach the JWT from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('civicpulse_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login if token expires
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('civicpulse_token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export default api;