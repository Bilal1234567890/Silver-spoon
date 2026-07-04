import axios from 'axios';

// Determine the base URL based on the environment
const baseURL = import.meta.env.DEV
  ? 'http://localhost:5000/api'  // Local development
  : 'https://silver-spoon-production.up.railway.app/api'; // Production (Railway)

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;