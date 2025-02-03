import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    console.log('API: Making request to:', config.url);
    const token = localStorage.getItem('kinde_access_token');
    console.log('API: Token status:', token ? 'Token exists' : 'No token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('API: No token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('API: Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('API: Successful response from:', response.config.url);
    return response;
  },
  async (error) => {
    console.error('API: Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });

    if (error.response?.status === 401) {
      console.log('API: Unauthorized error - clearing tokens and redirecting');
      localStorage.removeItem('kinde_access_token');
      localStorage.removeItem('kinde_refresh_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

const logApiCall = async (name, fn) => {
  try {
    console.log(`API: Calling ${name}...`);
    const response = await fn();
    console.log(`API: ${name} successful:`, response.data);
    return response;
  } catch (error) {
    console.error(`API: ${name} failed:`, error);
    throw error;
  }
};

export const userApi = {
  getCurrentUser: () => logApiCall('getCurrentUser', () => api.get('/users/me')),
  updateProfile: (data) => logApiCall('updateProfile', () => api.patch('/users/me', data)),
  getUserOrganizations: () => logApiCall('getUserOrganizations', () => api.get('/users/me/organizations')),
  getUserPermissions: () => logApiCall('getUserPermissions', () => api.get('/users/me/permissions')),
  deleteAccount: () => logApiCall('deleteAccount', () => api.delete('/users/me')),
};

export default api; 