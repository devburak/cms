import axios from 'axios';
import config from '../config';

export const getNewAccessToken = async (refreshToken) => {
  try {
    const response = await axios.post(config.baseURL + 'api/users/refresh-token', {
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

export const login= async (email, password) => {
    try {
        const response = await axios.post(`${config.baseURL}api/users/login`, {
        email,
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

export const getProfile = async (token)=>{
    try {
        // Eğer token değeri undefined veya null ise localStorage'dan al
        token = token || localStorage.getItem('accessToken');
        const response = await axios.get(`${config.baseURL}api/users/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.data && response.data.user) {
            return response.data.user;
        }
        return new Error("Can't get user data")
        
    } catch (error) {
        console.error("Get Profile error:", error);
        throw error;
    }

}