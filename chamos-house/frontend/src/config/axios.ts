import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '@/utils/constants';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('chamos-auth-token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('chamos-auth-token');
      localStorage.removeItem('chamos-auth-storage');

      const isLoginPage = window.location.pathname === '/login';
      if (!isLoginPage) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);
