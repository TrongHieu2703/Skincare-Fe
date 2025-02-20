import axios from "axios";

const API_URL = "https://localhost:7290/api"; 

// Đăng ký người dùng
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/Authentication/register`, userData, {
      headers: {
        "Content-Type": "application/json" 
      }
    });
    return response.data; 
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Đăng nhập người dùng
export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/Authentication/login`, credentials, {
      headers: {
        "Content-Type": "application/json" 
      }
    });
    localStorage.setItem("token", response.data.token);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Lấy thông tin tài khoản (yêu cầu token)
export const getAccountInfo = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Chưa đăng nhập");

  try {
    const response = await axios.get(`${API_URL}/Account`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Đăng xuất
export const logoutUser = () => {
  localStorage.removeItem("token");
};
