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
  
  if (token) {
    // Tránh lặp "Bearer Bearer ..."
    const finalToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    config.headers.Authorization = finalToken;
  }
  
  return config;
}, (error) => {
  console.error('Request interceptor error:', error);
  return Promise.reject(error);
});

// Interceptor cho response: Xử lý lỗi chung
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Không redirect tự động để tránh vòng lặp vô hạn
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
