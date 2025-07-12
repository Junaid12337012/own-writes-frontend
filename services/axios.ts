import axios from 'axios';

const instance = axios.create({
  // Use Vite-style environment variable. Define VITE_API_URL in Netlify dashboard or .env files
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Store password in memory only
let currentPassword: string | null = null;

// Function to set password
export function setPassword(password: string) {
  currentPassword = password;
}

// Clear password when needed
export function clearPassword() {
  currentPassword = null;
}

instance.interceptors.request.use((config) => {
  if (currentPassword) {
    config.headers = config.headers || {};
    config.headers['X-Auth-Password'] = currentPassword;
  }
  return config;
});

export default instance;
