import axios from "axios";

const API_URL = "https://localhost:7290/api"; 

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/Authentication/register`, userData, {
      headers: { "Content-Type": "application/json" }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/Authentication/login`, credentials, {
      headers: { "Content-Type": "application/json" }
    });
    localStorage.setItem("token", response.data.token);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const logoutUser = () => {
  localStorage.removeItem("token");
};
