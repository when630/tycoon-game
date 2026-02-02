import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/', // Use env var in prod, fallback to proxy in dev
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to inject the token
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default client;
