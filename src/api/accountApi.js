import axios from "axios";

const API_URL = "https://localhost:7290/api"; 

export const getAccountInfo = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Chưa đăng nhập");

  try {
    const response = await axios.get(`${API_URL}/Account`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};
