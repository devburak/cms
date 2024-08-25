import axios from 'axios';
import config from './config';
import { getNewAccessToken } from './services/authService';

const instance = axios.create({
  baseURL: config.baseURL
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
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

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          const newAccessToken = await getNewAccessToken(refreshToken);

          if (newAccessToken) {
            localStorage.setItem('accessToken', newAccessToken);
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

            // Yeni token ile orijinal isteği tekrar yapın.
            return instance(originalRequest);
          } else {
            // Yeni token alınamıyorsa logout işlemi
            alert('Your session has expired. Please log in again.');
            window.location = '/login';
          }
        } catch (e) {
          console.error('Token yenileme hatası:', e);
          alert('An error occurred while refreshing your session. Please log in again.');
          window.location = '/login';
        }
      } else {
        // Eğer refresh token yoksa, kullanıcıyı doğrudan login sayfasına yönlendirin.
        alert('You need to log in to continue.');
        window.location = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
