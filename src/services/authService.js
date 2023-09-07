import axios from 'axios';
import config from '../config';

export const getNewAccessToken = async (refreshToken) => {
  try {
    const response = await axios.post(config.baseURL + 'api/user/refresh-token', {
      refreshToken
    });
    return response.data.accessToken;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return error;
  }
};

export const isLoggedIn = () => {
    const token = localStorage.getItem('accessToken');
    return !!token; // Eğer token varsa true, yoksa false döner.
};
  
  export const setTokens = (accessToken,refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  };
  
  export const removeTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

export const login= async (identifier, password) => {
    try {
        const response = await axios.post(`${config.baseURL}api/user/login`, {
        identifier,
          password
        });
        if (response.data && response.data.accessToken && response.data.refreshToken) {
            setTokens(response.data.accessToken, response.data.refreshToken);
        }
        return response.data;
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      }
}