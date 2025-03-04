import axiosClient from "./axiosClient";

export const registerUser = async (userData) => {
  try {
    const response = await axiosClient.post("/Authentication/register", userData);
    return response.data;
  } catch (error) {
    console.error("Register error:", error);
    throw error.response ? error.response.data : error.message;
  }
};

export const loginUser = async (credentials) => {
  try {
    console.log("Attempting login with:", credentials.email);
    const response = await axiosClient.post("/Authentication/login", credentials);
    
    // Kiểm tra response
    console.log("Login API response:", response);
    
    if (!response.data || !response.data.token) {
      console.error("No token received in login response");
      throw new Error("Invalid login response - no token received");
    }
    
    // Lưu token vào localStorage
    localStorage.setItem("token", response.data.token);
    console.log("Token saved to localStorage");
    
    return response.data;
  } catch (error) {
    console.error("Login API error:", error);
    throw error.response ? error.response.data : error.message;
  }
};

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  console.log("User logged out - token and user data removed");
};

export const checkAuthStatus = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  return {
    isAuthenticated: !!token && !!user,
    user: user ? JSON.parse(user) : null
  };
};
