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
