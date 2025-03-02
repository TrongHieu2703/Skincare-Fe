// src/api/axiosClient.js
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'https://localhost:7290/api', // Chỉ đến /api
  headers: {
    'Content-Type': 'application/json'
  }
});

// Cấu hình interceptor để gắn JWT token nếu có
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Lưu token khi login
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosClient;
