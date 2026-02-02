import axios from 'axios';

const client = axios.create({
  baseURL: '/', // Vite proxy will handle /api requests
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
