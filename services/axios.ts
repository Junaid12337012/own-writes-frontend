import axios from 'axios';

const instance = axios.create({
  // Use Vite-style environment variable. Define VITE_API_URL in Netlify dashboard or .env files
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default instance;
