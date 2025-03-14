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
    return response.data;
  } catch (error) {
    console.error("Login API error:", error);
    throw error.response ? error.response.data : error.message;
  }
};

// Đăng xuất
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
