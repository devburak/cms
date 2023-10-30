import instance from './axiosConfig';

export const postSystemVariable = async (data) => {
    try {
      const response = await instance.post('/systemVariable', data);
      return response.data;
    } catch (error) {
      console.error('Error posting system variable:', error);
      throw error;
    }
  };
  
  export const getSystemVariable = async (key) => {
    try {
      const response = await instance.get(`/api/system/${key}`);
      return response.data;
    } catch (error) {
      console.error('Error getting system variable:', error);
      throw error;
    }
  };

  export const getStorageVariables = async () => {
    try {
      const response = await instance.get('/api/system/storage');
      return response.data;
    } catch (error) {
      console.error('Error getting storage variables:', error);
      throw error;
    }
};