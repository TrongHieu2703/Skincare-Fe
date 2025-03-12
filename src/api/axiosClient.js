import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'https://localhost:7290/api', // Chỉ đến /api
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor cho request: Gắn token nếu có
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Lấy token từ localStorage
  console.log("Token from localStorage:", token); // Debug

  if (token) {
    // Tránh lặp "Bearer Bearer ..."
    const finalToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    config.headers.Authorization = finalToken;

    console.log(`Token found for ${config.url}:`, finalToken.substring(0, 30) + '...');
    console.log("Request with auth header:", config.url, config.headers.Authorization); // Debug
  } else {
    console.log(`No token found for request to ${config.url}`);
  }

  // Log cấu hình đầy đủ của request
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

// Interceptor cho response: Log kết quả
axiosClient.interceptors.response.use(
  (response) => {
    console.log(`✅ Response received for ${response.config.url}:`, {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error(`❌ Response error from ${error.config?.url || 'unknown'}:`, {
      status: error.response?.status,
      message: error.message,
      responseData: error.response?.data
    });
    return Promise.reject(error);
  }
);

export default axiosClient;
