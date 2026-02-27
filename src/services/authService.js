import axios from 'axios';
import config from '../config';

export const getNewAccessToken = async (refreshToken) => {
  const response = await axios.post(`${config.baseURL}api/users/refresh-token`, {
    refreshToken
  });
  return response.data;
};

export const isLoggedIn = () => {
  const token = localStorage.getItem('accessToken');
  return !!token;
};

export const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem('accessToken', accessToken);
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
};

export const removeTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

export const login = async (email, password) => {
  const response = await axios.post(`${config.baseURL}api/users/login`, {
    email,
    password
  });
  if (response.data?.accessToken) {
    setTokens(response.data.accessToken, response.data.refreshToken);
  }
  return response.data;
};

export const getProfile = async (token) => {
  const normalizedToken = token || localStorage.getItem('accessToken');
  const response = await axios.get(`${config.baseURL}api/users/profile`, {
    headers: {
      Authorization: `Bearer ${normalizedToken}`
    }
  });

  return response.data;
};
