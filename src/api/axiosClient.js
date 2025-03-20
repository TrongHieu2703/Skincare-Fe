import axios from 'axios';

// Để đảm bảo URL nhất quán trong toàn bộ ứng dụng
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://localhost:7290";

const axiosClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
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
    if (error.response?.status === 403) {
      console.log('Permission denied: Admin role required');
      // You can also redirect to login or show a message
    }
    return Promise.reject(error);
  }
);

// Export thêm API_BASE_URL để sử dụng cho URL tĩnh
export { API_BASE_URL };
export default axiosClient;
