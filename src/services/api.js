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

// Redirect to the correct login page when a token expires or is rejected
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {

      // FIX: read the role from the existing token before removing it so we
      // can send the user to the right login page. The old code always sent
      // everyone to /auth which is a redirect alias to /auth/citizen — meaning
      // an official whose session expired would land on the citizen login page
      // (phone + PIN) with no way to reach the official email + password login.
      const token = localStorage.getItem('civicpulse_token');
      let role = 'citizen'; // safe default

      if (token) {
        try {
          // JWT structure is header.payload.signature — all base64 encoded.
          // The payload (middle segment) contains userId, role, email etc.
          // This is safe to read client-side: JWTs are signed, not encrypted.
          const payload = JSON.parse(atob(token.split('.')[1]));
          role = payload.role || 'citizen';
        } catch {
          // Token was malformed — default to citizen login
          role = 'citizen';
        }
      }

      // Clear the expired or invalid token
      localStorage.removeItem('civicpulse_token');

      // Send to the correct login page based on the user's role
      window.location.href = role === 'official'
        ? '/auth/official'
        : '/auth/citizen';
    }

    return Promise.reject(error);
  }
);

export default api;