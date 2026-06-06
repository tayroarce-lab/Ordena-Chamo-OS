import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '@/utils/constants';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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

let retryCount = 0;
const MAX_RETRIES = 2;

apiClient.interceptors.response.use(
  (response) => {
    retryCount = 0;
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('chamos-auth-token');
      localStorage.removeItem('chamos-auth-storage');

      const isLoginPage = window.location.pathname === '/login';
      if (!isLoginPage) {
        window.location.href = '/login';
      }
    }

    const isNetworkError = !error.response;
    const isServerError = error.response?.status && error.response.status >= 500;

    if ((isNetworkError || isServerError) && retryCount < MAX_RETRIES) {
      retryCount += 1;
      const delayMs = 1000 * Math.pow(2, retryCount - 1);
      
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(apiClient(error.config as InternalAxiosRequestConfig));
        }, delayMs);
      });
    }

    return Promise.reject(error);
  },
);
