import instance from './axiosConfig';
import axios from 'axios';

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

export const uploadFiles = async (files, onUploadProgress) => {
  try {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file); // 'files[]' yerine 'files' olarak gönderiyoruz
    });

    const response = await instance.post('/api/files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: onUploadProgress
    });

    return response.data;
  } catch (error) {
    console.error('Error uploading files:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const uploadFilesPresigned = async (files, onUploadProgress) => {
  try {
    const meta = files.map((f) => ({ fileName: f.name, fileType: f.type }));
    const { data: presigned } = await instance.post('/api/files/presign', { files: meta });

    for (let i = 0; i < files.length; i++) {
      const url = presigned[i]?.url;
      if (!url) continue;
      await axios.put(url, files[i], {
        headers: { 'Content-Type': files[i].type },
        onUploadProgress,
      });
    }

    const response = await instance.post('/api/files/confirm', { meta });
    return response.data;
  } catch (error) {
    console.error('Error uploading files via presigned URLs:', error.response ? error.response.data : error.message);
    throw error;
  }
};


export const getFiles = async (searchTerm = '', page = 1, pageSize = 20, excludeIds = [], fileType = '') => {
  try {
    // Sorgu parametrelerini oluştur
    let query = `?page=${page}&limit=${pageSize}`;

    if (searchTerm) {
      query += `&s=${encodeURIComponent(searchTerm)}`;
    }

    if (fileType) {
      query += `&fileType=${encodeURIComponent(fileType)}`;
    }

    if (excludeIds.length > 0) {
      // excludeIds dizisini virgülle ayrılmış bir string'e dönüştür
      const excludeIdsParam = excludeIds.join(',');
      query += `&excludeIds=${encodeURIComponent(excludeIdsParam)}`;
    }

    // API isteğini yap
    const response = await instance.get(`/api/files${query}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching files:', error);
    throw error;
  }
};


export const renameFile = async (oldFilePath ,oldFileName, newFilePath,newFileName, fileId) => {
  try {
    const response = await instance.post('/api/files/rename', {
      oldFilePath,
      oldFileName,
      newFilePath,
      newFileName,
      fileId
    });
    return response.data; // ya da başka bir işlem, örneğin state güncelleme
  } catch (error) {
    console.error('Error renaming file:', error);
    throw error; // ya da bir hata işleme mekanizması
  }
};

export const deleteFile = async (fileId) => {
  try {
    console.log(fileId)
    // DELETE isteği ile dosyayı silmek için API'ye istek gönderin
    const response = await instance.delete(`/api/files/${fileId}`);
    return response.data; // Başarılı yanıtı döndür
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error; // Hata işlemesi
  }
};

// Slug kontrolü için yeni bir fonksiyon ekleyin
export const checkSlugAvailability = async (slug) => {
  try {
    const response = await instance.get(`/api/contents/checkSlug?slug=${encodeURIComponent(slug)}`);
    return response.data; // Sunucunun cevabını döndür
  } catch (error) {
    console.error('Error checking slug availability:', error);
    throw error; // Hata yönetimini çağıran fonksiyona bırak
  }
};


export const updateCategory = async (id, data) => {
  try {
    const response = await instance.put(`/api/category/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};


export const createCategory = async (data) => {
  try {
    const response = await instance.post('/api/category', data);
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

export const getCategoryById = async (id) => {
  try {
    const response = await instance.get(`/api/category/byid/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching category by ID:', error);
    throw error;
  }
};

export const getCategories = async (search = '') => {
  try {
    const response = await instance.get(`/api/category/filter?name=${encodeURIComponent(search)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const getCategoriesWithNoParams = async () => {
  try {
    const response = await instance.get('/api/category/withnop');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories with no params:', error);
    throw error;
  }
};

export const getAllCategories = async () => {
  try {
    const response = await instance.get('/api/category');
    return response.data;
  } catch (error) {
    console.error('Error fetching all categories:', error);
    throw error;
  }
};

// Period CRUD operasyonları için API servisleri

// export const getPeriods = async () => {
//   try {
//     const response = await instance.get(`/api/period`);
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching periods:', error);
//     throw error;
//   }
// };

// export const createPeriod = async (periodData) => {
//   try {
//     const response = await instance.post('/api/period', periodData);
//     return response.data;
//   } catch (error) {
//     console.error('Error creating a new period:', error);
//     throw error;
//   }
// };

// export const updatePeriod = async (id, periodData) => {
//   try {
//     const response = await instance.put(`/api/period/${id}`, periodData);
//     return response.data;
//   } catch (error) {
//     console.error('Error updating the period:', error);
//     throw error;
//   }
// };

// export const deletePeriod = async (id) => {
//   try {
//     const response = await instance.delete(`/api/period/${id}`);
//     return response.data;  // Not: 204 No Content yanıtı dönerse, response.data boş olabilir.
//   } catch (error) {
//     console.error('Error deleting the period:', error);
//     throw error;
//   }
// };

////
export const getAllPeriods = async (page = 1, pageSize = 100) => {
  const response = await instance.get(`/api/periods?page=${page}&pageSize=${pageSize}`);
  return response.data;
};

export const createPeriod = async (data) => {
  const response = await instance.post('/api/periods', data);
  return response.data;
};

export const updatePeriod = async (id, data) => {
  const response = await instance.put(`/api/periods/${id}`, data);
  return response.data;
};

export const deletePeriod = async (id) => {
  const response = await instance.delete(`/api/periods/${id}`);
  return response.data;
};


//Content 

// Content ekleme
export const createContent = async (contentData) => {
  try {
      const response = await instance.post('/api/contents', contentData);
      return response.data;
  } catch (error) {
      console.error('Error creating content:', error);
      throw error;
  }
};

// Kategori adına göre contentleri getirme
export const getContentsByCategoryName = async (categoryName) => {
  try {
      const response = await instance.get(`/api/contents/byCategoryName/${categoryName}`);
      return response.data;
  } catch (error) {
      console.error('Error fetching contents by category name:', error);
      throw error;
  }
};

// Kategori ID'sine göre contentleri getirme
export const getContentsByCategoryId = async (categoryId) => {
  try {
      const response = await instance.get(`/api/contents/byCategoryId/${categoryId}`);
      return response.data;
  } catch (error) {
      console.error('Error fetching contents by category ID:', error);
      throw error;
  }
};

// Tüm contentleri getirme (Filtreleme ile)
export const getAllContents = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  try {
      const response = await instance.get(`/api/contents?${query}`);
      return response.data;
  } catch (error) {
      console.error('Error fetching all contents:', error);
      throw error;
  }
};

// İçerik silme
export const deleteContent = async (id) => {
  try {
    const response = await instance.delete(`/api/contents/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting content:', error);
    throw error;
  }
};

// İçerik güncelleme
export const updateContent = async (id, contentData) => {
  try {
    const response = await instance.put(`/api/contents/${id}`, contentData);
    return response.data;
  } catch (error) {
    console.error('Error updating content:', error);
    throw error;
  }
};

// ID ile içerik getirme
export const getContentById = async (id) => {
  try {
    const response = await instance.get(`/api/contents/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching content by ID:', error);
    throw error;
  }
};



///tag için endpointler

export const searchTags = async (query) => {
  try {
    const response = await instance.get(`/api/tags/search?query=${query}`);
   
    return response.data;
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
};

export const createTag = async (name) => {
  try {
    const response = await instance.post('/api/tags', {
      name
    });
    return  response?.data || {}
  } catch (error) {
    console.error('Error creating tag:', error);
    return null;
  }
};


//roles

export const getAllRoles = async () => {
  const response = await instance.get('/api/roles');
  return response.data;
};

export const getRoleById = async (id) => {
  const response = await instance.get(`/api/roles/${id}`);
  return response.data;
};

export const createRole = async (roleData) => {
  const response = await instance.post('/api/roles', roleData);
  return response.data;
};

export const updateRole = async (id, roleData) => {
  const response = await instance.put(`/api/roles/${id}`, roleData);
  return response.data;
};

export const deleteRole = async (id) => {
  const response = await instance.delete(`/api/roles/${id}`);
  return response.data;
};

export const getPermissions = async () => {
  const response = await instance.get('/api/roles/permissions');
  return response.data;
};


///users
//password
export const requestPasswordReset = async (email) => {
  return await instance.post('/api/users/request-password-reset', { email });
};

export const resetPassword = async (token, newPassword) => {
  return await instance.post(`/api/users/reset-password/${token}`, { password:newPassword });
};

// Tüm kullanıcıları getiren fonksiyon
export const getAllUsers = async () => {
  try {
    const response = await instance.get(`/api/users`);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Kullanıcıyı silen fonksiyon
export const deleteUser = async (userId) => {
  try {
    await instance.delete(`api/users/${userId}`);
  } catch (error) {
    console.error(`Error deleting user with id ${userId}:`, error);
    throw error;
  }
};

// Kullanıcıyı oluşturan fonksiyon
export const createUser = async (userData) => {
  try {
    const response = await instance.post(`api/users`, userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Kullanıcıyı güncelleyen fonksiyon
export const updateUser = async (userId, userData) => {
  try {
    const response = await instance.put(`api/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error(`Error updating user with id ${userId}:`, error);
    throw error;
  }
};

// ID'ye göre kullanıcıyı getiren fonksiyon
export const getUserById = async (userId) => {
  try {
    const response = await instance.get(`api/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user with id ${userId}:`, error);
    throw error;
  }
};

//events 

// Tüm etkinlik türlerini getir
export const getAllEventTypes = async () => {
  try {
    const response = await instance.get('/api/events/types');
    return response.data;
  } catch (error) {
    console.error('Error fetching event types:', error);
    throw error;
  }
};

// Yeni etkinlik türü oluştur
export const createEventType = async (eventTypeData) => {
  try {
    const response = await instance.post('/api/events/types', eventTypeData);
    return response.data;
  } catch (error) {
    console.error('Error creating event type:', error);
    throw error;
  }
};

// Etkinlik oluşturma
export const createEvent = async (eventData) => {
  try {
    const response = await instance.post('/api/events', eventData);
    return response.data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// Etkinlik güncelleme
export const updateEvent = async (eventId, eventData) => {
  try {
    const response = await instance.put(`/api/events/${eventId}`, eventData);
    return response.data;
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

// ID'ye göre etkinlik getir
export const getEventById = async (eventId) => {
  try {
    const response = await instance.get(`/api/events/${eventId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching event by ID:', error);
    throw error;
  }
};

// Event List with Pagination, Filtering, and Sorting
export const fetchEvents = async (filter = {}, page = 1, limit = 10) => {
  try {
    const response = await instance.get('/api/events/list', {
      params: {
        page,
        limit,
        ...filter, // filter: { eventType, startDate, endDate, title }
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

// Delete an event
export const deleteEvent = async (eventId) => {
  try {
    const response = await instance.delete(`/api/events/${eventId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};


// apptoken services

// Uygulama Tokenı Oluşturma
export const createAppToken = async (data) => {
  try {
    const response = await instance.post('/api/apptoken/create', data);
    return response.data;
  } catch (error) {
    console.error('Error creating app token:', error);
    throw error;
  }
};

// Uygulama Tokenlarını Listeleme
export const listAppTokens = async () => {
  try {
    const response = await instance.get('/api/apptoken/list');
    return response.data;
  } catch (error) {
    console.error('Error fetching app tokens:', error);
    throw error;
  }
};

// Uygulama Tokenı Silme
export const deleteAppToken = async (tokenId) => {
  try {
    const response = await instance.delete(`/api/apptoken/delete/${tokenId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting app token:', error);
    throw error;
  }
};


// Celebrations

export const createCelebration = async (celebrationData) => {
  try {
    const response = await instance.post('/api/celebrations', celebrationData);
    return response.data;
  } catch (error) {
    console.error('Error creating celebration:', error);
    throw error;
  }
};

export const updateCelebration = async (celebrationId, celebrationData) => {
  try {
    const response = await instance.put(`/api/celebrations/${celebrationId}`, celebrationData);
    return response.data;
  } catch (error) {
    console.error('Error updating celebration:', error);
    throw error;
  }
};

export const getCelebrationById = async (celebrationId) => {
  try {
    const response = await instance.get(`/api/celebrations/${celebrationId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching celebration by ID:', error);
    throw error;
  }
};

export const getAllCelebrations = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  try {
    const response = await instance.get(`/api/celebrations?${query}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all celebrations:', error);
    throw error;
  }
};

export const deleteCelebration = async (celebrationId) => {
  try {
    const response = await instance.delete(`/api/celebrations/${celebrationId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting celebration:', error);
    throw error;
  }
};
// Tüm Dönem Dokümanlarını Getir
export const getPeriodDocuments = async (page = 1, limit = 10) => {
  try {
    const response = await instance.get(`/api/perioddocuments?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching period documents:', error);
    throw error;
  }
};

// ID'ye Göre Dönem Dokümanı Getir
export const getPeriodDocumentById = async (id) => {
  try {
    const response = await instance.get(`/api/perioddocuments/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching period document with ID ${id}:`, error);
    throw error;
  }
};

// Yeni Dönem Dokümanı Oluştur
export const createPeriodDocument = async (data) => {
  try {
    const response = await instance.post('/api/perioddocuments', data);
    return response.data;
  } catch (error) {
    console.error('Error creating period document:', error);
    throw error;
  }
};

// Dönem Dokümanını Güncelle
export const updatePeriodDocument = async (id, data) => {
  try {
    const response = await instance.put(`/api/perioddocuments/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating period document with ID ${id}:`, error);
    throw error;
  }
};

// Dönem Dokümanını Güncelle
export const deletePeriodDocument = async (id, data) => {
  try {
    const response = await instance.delete(`/api/perioddocuments/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error delete period document with ID ${id}:`, error);
    throw error;
  }
};


// Get all celebration publications with pagination and filtering support
export const getAllCelebrationPublications = async ({ limit = 20, page = 1, title = '', period = '', publishDate = '' } = {}) => {
  const queryParams = new URLSearchParams({ limit, page });

  // Optional filtering parameters
  if (title) queryParams.append('title', title);
  if (period) queryParams.append('period', period);
  if (publishDate) queryParams.append('publishDate', publishDate);

  try {
    const response = await instance.get(`/api/celebrationpublications?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching celebration publications:', error);
    throw error;
  }
};


// Get celebration publication by ID
export const getCelebrationPublicationById = async (id) => {
  try {
    const response = await instance.get(`/api/celebrationpublications/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching celebration publication with ID ${id}:`, error);
    throw error;
  }
};

// Create celebration publication
export const createCelebrationPublication = async (data) => {
  try {
    const response = await instance.post('/api/celebrationpublications', data);
    return response.data;
  } catch (error) {
    console.error('Error creating celebration publication:', error);
    throw error;
  }
};

// Update celebration publication
export const updateCelebrationPublication = async (id, data) => {
  try {
    const response = await instance.put(`/api/celebrationpublications/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating celebration publication with ID ${id}:`, error);
    throw error;
  }
};

// Delete celebration publication
export const deleteCelebrationPublication = async (id) => {
  try {
    const response = await instance.delete(`/api/celebrationpublications/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting celebration publication with ID ${id}:`, error);
    throw error;
  }
};

//Campaign services
export const getAllCampaigns = async () => {
  try {
  const response =  await instance.get('/api/campaigns');
   return response.data;
  } catch (error) {
    console.error(`Error fetching:`, error);
    throw error;
  }
};

export const getCampaignById = async (id) => {
  try {
    const response = await instance.get(`/api/campaigns/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching:`, error);
    throw error;
  }
};

export const createCampaign = async (campaignData) => {
  return await instance.post('/api/campaigns', campaignData);
};

export const updateCampaign = async (id, campaignData) => {
  return await instance.put(`/api/campaigns/${id}`, campaignData);
};

export const deleteCampaign = async (id) => {
  return await instance.delete(`/api/campaigns/${id}`);
};


//publications
// Yayınları listele (pagination, search, period filtresi ve kategori ekleyebileceğiz)
export const getPublications = async (params) => {
  try {
    const response = await instance.get(`/api/publication`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching publications:', error);
    throw error;
  }
};

export const createPublication = async (data) => {
  try {
    const response = await instance.post(`/api/publication`, data);
    return response.data;
  } catch (error) {
    console.error('Error creating publication:', error);
    throw error;
  }
};

export const updatePublication = async (id, data) => {
  try {
    const response = await instance.put(`/api/publication/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating publication:', error);
    throw error;
  }
};

export const deletePublication = async (id) => {
  try {
    const response = await instance.delete(`/api/publication/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting publication:', error);
    throw error;
  }
};

// Real getChambers function
export const getChambers = async (params = {}) => {
  try {
    const response = await instance.get('/api/chambers', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching chambers:', error);
    throw error;
  }
};

// Real createChamber function
export const createChamber = async (data) => {
  try {
    const response = await instance.post('/api/chambers', data);
    return response.data;
  } catch (error) {
    console.error('Error creating chamber:', error);
    throw error;
  }
};

// Real updateChamber function
export const updateChamber = async (id, data) => {
  try {
    const response = await instance.put(`/api/chambers/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating chamber with ID: ${id}`, error);
    throw error;
  }
};

// Real deleteChamber function
export const deleteChamber = async (id) => {
  try {
    const response = await instance.delete(`/api/chambers/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting chamber with ID: ${id}`, error);
    throw error;
  }
};

// Real getBoards function
export const getBoards = async (params = {}) => {
  try {
    const response = await instance.get('/api/boards', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching boards:', error);
    throw error;
  }
};

// Real deleteBoard function
export const deleteBoard = async (id) => {
  try {
    const response = await instance.delete(`/api/boards/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting board with ID: ${id}`, error);
    throw error;
  }
};

// Real getAllChambers function
export const getAllChambers = async () => {
  try {
    const response = await instance.get('/api/chambers');
    return response.data;
  } catch (error) {
    console.error('Error fetching all chambers:', error);
    throw error;
  }
};

// Tüm Board Tiplerini Getir
export const getAllBoardTypes = async () => {
  try {
    const response = await instance.get('/api/board-types');
    return response.data;
  } catch (error) {
    console.error('Error fetching board types:', error);
    throw error;
  }
};

// Belirli bir Board Tipini Getir
export const getBoardTypeById = async (id) => {
  try {
    const response = await instance.get(`${'/api/board-types'}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching board type:', error);
    throw error;
  }
};

// Yeni Board Tipi Oluştur
export const createBoardType = async (data) => {
  try {
    const response = await instance.post('/api/board-types', data);
    return response.data;
  } catch (error) {
    console.error('Error creating board type:', error);
    throw error;
  }
};

// Board Tipini Güncelle
export const updateBoardType = async (id, data) => {
  try {
    const response = await instance.put(`/api/board-types/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating board type:', error);
    throw error;
  }
};

// Board Tipini Sil
export const deleteBoardType = async (id) => {
  try {
    const response = await instance.delete(`/api/board-types/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting board type:', error);
    throw error;
  }
};

// Real createBoard function
export const createBoard = async (data) => {
  try {
    const response = await instance.post('/api/boards', data);
    return response.data;
  } catch (error) {
    console.error('Error creating board:', error);
    throw error;
  }
};

// Real updateBoard function
export const updateBoard = async (id, data) => {
  try {
    const response = await instance.put(`/api/boards/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating board:', error);
    throw error;
  }
};


// Yeni bir video oluşturma
export async function createVideo(videoData) {
  try {
    const response = await instance.post('/api/videos', videoData);
    return response.data;
  } catch (error) {
    console.error('Error creating video:', error);
    throw error;
  }
}

// Tüm videoları getirme (Arama + Sayfalama)
export async function getVideos({ search = '', page = 1, limit = 20 }) {
  try {
    const response = await instance.get('/api/videos', {
      params: { search, page, limit },
    });
    return response.data; // { videos, totalCount, page, limit }
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
}

// Tek bir videoyu ID'ye göre getirme
export async function getVideoById(id) {
  try {
    const response = await instance.get(`/api/videos/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching video by ID:', error);
    throw error;
  }
}

// Bir videoyu güncelleme
export async function updateVideo(id, videoData) {
  try {
    const response = await instance.put(`/api/videos/${id}`, videoData);
    return response.data;
  } catch (error) {
    console.error('Error updating video:', error);
    throw error;
  }
}

// Bir videoyu silme
export async function deleteVideo(id) {
  try {
    await instance.delete(`/api/videos/${id}`);
    return true;
  } catch (error) {
    console.error('Error deleting video:', error);
    throw error;
  }
}

// IKK Listeleme
export const getAllIKKs = async () => {
  try {
    const response = await instance.get('/api/ikk');
    return response.data;
  } catch (error) {
    console.error('Error fetching IKKs:', error);
    throw error;
  }
};

// IKK Oluşturma
export const createIKK = async (data) => {
  try {
    const response = await instance.post('/api/ikk', data);
    return response.data;
  } catch (error) {
    console.error('Error creating IKK:', error);
    throw error;
  }
};

// IKK Güncelleme
export const updateIKK = async (id, data) => {
  try {
    const response = await instance.put(`/api/ikk/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating IKK:', error);
    throw error;
  }
};

// IKK Silme
export const deleteIKK = async (id) => {
  try {
    const response = await instance.delete(`/api/ikk/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting IKK:', error);
    throw error;
  }
};

// Expertise services

// Create new expertise training
export const createExpertise = async (data) => {
  try {
    const response = await instance.post('/api/expertise', data);
    return response.data;
  } catch (error) {
    console.error('Error creating expertise:', error);
    throw error;
  }
};

// Get expertise trainings with filtering and pagination
export const getExpertises = async (params = {}) => {
  try {
    const response = await instance.get('/api/expertise', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching expertises:', error);
    throw error;
  }
};

// Get expertise training by ID
export const getExpertiseById = async (id) => {
  try {
    const response = await instance.get(`/api/expertise/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching expertise with ID ${id}:`, error);
    throw error;
  }
};

// Update expertise training by ID
export const updateExpertise = async (id, data) => {
  try {
    const response = await instance.put(`/api/expertise/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating expertise with ID ${id}:`, error);
    throw error;
  }
};

// Delete expertise training by ID
export const deleteExpertise = async (id) => {
  try {
    const response = await instance.delete(`/api/expertise/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting expertise with ID ${id}:`, error);
    throw error;
  }
};