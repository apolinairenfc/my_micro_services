import axios, { AxiosInstance } from 'axios';
import { clearAuth, getToken } from '../store/auth';
import { toast } from '../lib/toast';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api3';

const createClient = (clientBaseUrl: string): AxiosInstance => {
  const client = axios.create({
    baseURL: clientBaseUrl,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status;
      if (status === 401) {
        clearAuth();
        toast.error('Session expirée. Merci de vous reconnecter.');
        if (window.location.pathname !== '/login') {
          window.location.assign('/login');
        }
      }
      return Promise.reject(error);
    }
  );

  return client;
};

export const http = createClient(baseURL);
export const api1Http = createClient('/api1');
export const api2Http = createClient('/api2');
