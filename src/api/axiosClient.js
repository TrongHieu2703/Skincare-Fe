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
  console.log("Token from localStorage:", token); // Debug log
  
  if (token) {
    console.log(`Token found for ${config.url}:`, token.substring(0, 20) + '...'); // Log token (một phần) để debug
    config.headers.Authorization = `Bearer ${token}`;
    console.log("Request with auth header:", config.url, config.headers.Authorization); // Debug log
  } else {
    console.log(`No token found for request to ${config.url}`);
  }
  
  // Log đầy đủ config request để debug
  console.log('Full request config:', {
    method: config.method,
    url: config.url,
    baseURL: config.baseURL,
    headers: config.headers,
    data: config.data
  });
  
  return config;
}, (error) => {
  console.error('Request interceptor error:', error);
  return Promise.reject(error);
});

// Thêm interceptor response để debug
axiosClient.interceptors.response.use(
  (response) => {
    console.log(`Response received for ${response.config.url}:`, {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Response error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      responseData: error.response?.data
    });
    return Promise.reject(error);
  }
);

export default axiosClient;
