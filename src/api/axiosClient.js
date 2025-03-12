import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'https://localhost:7290/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor cho request: Gắn token nếu có
axiosClient.interceptors.request.use((config) => {
  let token = localStorage.getItem('token');

  if (!token) {
    console.warn("⚠️ No token found in localStorage!");
  } else {
    console.log("✅ Token from localStorage:", token);
    
    // Đảm bảo đúng format "Bearer ..."
    if (!token.startsWith("Bearer ")) {
      token = `Bearer ${token}`;
      localStorage.setItem('token', token);
    }

    config.headers.Authorization = token;
    console.log(`📡 Request with token -> ${config.url}:`, config.headers.Authorization);
  }

  return config;
}, (error) => {
  console.error('❌ Request interceptor error:', error);
  return Promise.reject(error);
});

// Interceptor cho response
axiosClient.interceptors.response.use(
  (response) => {
    console.log(`✅ Response from ${response.config.url}:`, response);
    return response;
  },
  (error) => {
    console.error(`❌ Error response from ${error.config?.url || 'unknown'}:`, error);
    return Promise.reject(error);
  }
);

export default axiosClient;
