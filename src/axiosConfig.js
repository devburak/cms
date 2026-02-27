import axios from 'axios';
import config from './config';
import { getNewAccessToken, removeTokens, setTokens } from './services/authService';
import { notifyError, notifyWarning } from './services/notificationBus';

const instance = axios.create({
  baseURL: config.baseURL
});

const AUTH_ENDPOINTS = [
  '/api/users/login',
  '/api/users/refresh-token',
  '/api/users/request-password-reset'
];

const isPublicAuthRoute = (url = '') => {
  if (!url) return false;
  if (AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint))) return true;
  return url.includes('/api/users/reset-password/') || url.includes('/api/users/reset/');
};

const extractErrorMessage = (error) => {
  const data = error?.response?.data;
  if (typeof data === 'string') return data;
  if (data?.message) return data.message;
  if (data?.error) return data.error;
  return error?.message || 'Beklenmeyen bir hata oluştu.';
};

const isMutatingRequest = (method = '') =>
  ['post', 'put', 'patch', 'delete'].includes((method || '').toLowerCase());

instance.interceptors.request.use(
  (requestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }

    return requestConfig;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const statusCode = error?.response?.status;
    const currentPath = window.location.pathname;
    const isOnAuthPage =
      currentPath === '/login' || currentPath === '/forget-password' || currentPath.startsWith('/reset/');

    if (!statusCode) {
      notifyError('Sunucuya ulaşılamadı. Lütfen bağlantınızı kontrol edin.');
      return Promise.reject(error);
    }

    if (statusCode === 401 && !originalRequest?._retry && !originalRequest?.skipAuthRefresh) {
      if (isPublicAuthRoute(originalRequest?.url || '')) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          const refreshResponse = await getNewAccessToken(refreshToken);
          const newAccessToken = refreshResponse?.accessToken;
          const newRefreshToken = refreshResponse?.refreshToken;

          if (newAccessToken) {
            setTokens(newAccessToken, newRefreshToken || refreshToken);
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

            return instance(originalRequest);
          }

          throw new Error('Yeni erişim anahtarı alınamadı');
        } catch (e) {
          removeTokens();
          if (!isOnAuthPage) {
            notifyWarning('Oturumunuz sona erdi. Lütfen tekrar giriş yapın.');
            window.location.assign('/login');
          }
          return Promise.reject(e);
        }
      } else {
        removeTokens();
        if (!isOnAuthPage) {
          notifyWarning('Devam etmek için giriş yapmanız gerekiyor.');
          window.location.assign('/login');
        }
        return Promise.reject(error);
      }
    }

    if (
      !isPublicAuthRoute(originalRequest?.url || '') &&
      isMutatingRequest(originalRequest?.method) &&
      !originalRequest?.suppressGlobalError
    ) {
      notifyError(extractErrorMessage(error), {
        title: 'İşlem başarısız'
      });
    }

    return Promise.reject(error);
  }
);

export default instance;
