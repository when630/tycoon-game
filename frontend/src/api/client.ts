import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/', // Use env var in prod, fallback to proxy in dev
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log('API Client initialized with baseURL:', client.defaults.baseURL); // Debug log

// Add a request interceptor to inject the token
client.interceptors.request.use(
  (config: any) => { // Using any temporarily or better strict type if possible, but simplest is any or specific type.
    // Better: import type { InternalAxiosRequestConfig } from 'axios';
    // But I'll stick to 'any' or verify import first.
    // To be safe and since I can't verify import, I will use 'any' or minimal typing.
    // Actually, let's just use 'any' for now to solve the immediate error, or 'InternalAxiosRequestConfig' if I import it.
    // Let's Import it.
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle auth errors
client.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: any) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Token expired or invalid
      console.warn('Authentication error (401/403):', error.response);
      // alert('Auth Error! Check Console. Status: ' + error.response.status);
      // localStorage.removeItem('token'); // Temporarily keep token to debug
      // localStorage.removeItem('nickname');
      // window.location.href = '/'; // Disable redirect for debugging
    }
    return Promise.reject(error);
  }
);

export default client;
