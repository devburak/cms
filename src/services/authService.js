import axios from 'axios';
import config from '../config';

export const getNewAccessToken = async (refreshToken) => {
  try {
    const response = await axios.post(config.baseURL + 'api/user/refresh', {
      refreshToken
    });
    return response.data.accessToken;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return null;
  }
};

export const isLoggedIn = () => {
    const token = localStorage.getItem('token');
    return !!token; // Eğer token varsa true, yoksa false döner.
  };
  
  export const setToken = (token) => {
    localStorage.setItem('token', token);
  };
  
  export const removeToken = () => {
    localStorage.removeItem('token');
  };