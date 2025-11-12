import axios from 'axios';

const baseURL = `${import.meta.env.VITE_BACKEND_URL || ''}/api/v1`;

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem('xtreme_token', token);
  } else {
    delete apiClient.defaults.headers.common.Authorization;
    localStorage.removeItem('xtreme_token');
  }
};

apiClient.interceptors.request.use((config) => {
  if (!config.headers.Authorization) {
    const persistedToken = localStorage.getItem('xtreme_token');
    if (persistedToken) {
      config.headers.Authorization = `Bearer ${persistedToken}`;
    }
  }
  return config;
});

export default apiClient;
