import axios from 'axios';
import config from './config';
import {getNewAccessToken} from './services/authService'

const instance = axios.create({
  baseURL: config.baseURL
});

instance.interceptors.request.use(
    config => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    error => {
      Promise.reject(error);
    }
  );
  

  instance.interceptors.response.use(
    response => {
      return response;
    },
    async error => {
      const originalRequest = error.config;
  
      // Eğer 401 Unauthorized hatası alırsanız ve daha önce bu istek için yeniden deneme yapmadıysanız:
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true; // Bu isteği yeniden denemek için bir bayrak ayarlayın.
        const refreshToken = localStorage.getItem('refreshToken');
  
        if (refreshToken) {
          const newAccessToken = await getNewAccessToken(refreshToken);
  
          if (newAccessToken) {
            localStorage.setItem('accessToken', newAccessToken);
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
  
            // Yeni token ile orijinal isteği tekrar yapın.
            return instance(originalRequest);
          }
          // Eğer yeni bir access token alınamazsa veya başka bir hata alınırsa, kullanıcıyı login sayfasına yönlendirin.
          window.location = '/login';
        }
      }
  
     
      return Promise.reject(error);
    }
  );
  

export default instance;