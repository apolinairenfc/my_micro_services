import axios from 'axios';
import { clearAuth, getToken } from '../store/auth';
import { toast } from '../lib/toast';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const http = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      clearAuth();
      toast.error('Session expired. Please login again.');
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);
