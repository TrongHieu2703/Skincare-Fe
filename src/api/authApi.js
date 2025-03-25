// src/api/authApi.js
import axiosClient from "./axiosClient";

// Đăng ký tài khoản
export const registerUser = async (userData) => {
  try {
    const response = await axiosClient.post("/Authentication/register", userData);
    return response.data;
  } catch (error) {
    console.error("Register error:", error);
    throw error.response ? error.response.data : error.message;
  }
};

// Đăng nhập tài khoản
export const loginUser = async (credentials) => {
  try {
    const response = await axiosClient.post("/Authentication/login", credentials);
    console.log("✅ Login API response:", response);

    if (!response.data || !response.data.data || !response.data.data.token) {
      console.error("❌ No token received in login response");
      throw new Error("Invalid login response - no token received");
    }

    const token = response.data.data.token;
    const userData = {
      id: response.data.data.id,
      email: response.data.data.email,
      username: response.data.data.username,
      role: response.data.data.role,
      avatar: response.data.data.avatar,
      phoneNumber: response.data.data.phoneNumber,
      address: response.data.data.address
    };

    // Thêm log để debug
    console.log("Login - Original Avatar URL:", userData.avatar);
    
    // Kiểm tra nếu avatar là URL Google Drive và cảnh báo
    if (userData.avatar && userData.avatar.includes('drive.google.com')) {
      console.warn("Google Drive avatar detected! Will need to be migrated to local storage.");
    }

    // Lưu token và user vào localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));

    // Trả về dữ liệu để component tự gọi login()
    return { userData, token };
  } catch (error) {
    console.error("Login API error:", error);
    throw error.response ? error.response.data : error.message;
  }
};

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// Kiểm tra trạng thái đăng nhập
export const checkAuthStatus = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  return {
    isAuthenticated: !!token && !!user,
    user: user ? JSON.parse(user) : null,
  };
};

// Thêm hàm mới vào authApi.js
export const registerWithAvatar = async (userData, avatarFile) => {
  try {
    // Tạo FormData object để gửi dữ liệu dạng multipart/form-data
    const formData = new FormData();
    formData.append('username', userData.username);
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    formData.append('phoneNumber', userData.phoneNumber || '');
    formData.append('address', userData.address || '');
    
    // Chỉ thêm avatar nếu có file
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };

    console.log("Sending registration with avatar request");
    const response = await axiosClient.post("/Authentication/register-with-avatar", formData, config);
    
    // Ghi log thông tin avatar nếu có
    if (response.data && response.data.data && response.data.data.avatar) {
      console.log("Registration - New avatar URL:", response.data.data.avatar);
    }
    
    return response.data;
  } catch (error) {
    console.error("Register with avatar error:", error);
    throw error.response ? error.response.data : error.message;
  }
};
