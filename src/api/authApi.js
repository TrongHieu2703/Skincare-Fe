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
    console.log("🔄 Attempting login with:", credentials.email);

    // Gửi request login
    const response = await axiosClient.post("/Authentication/login", credentials);

    // Kiểm tra response đầy đủ
    console.log("✅ Login API response:", response);

    if (!response.data || !response.data.data || !response.data.data.token) {
      console.error("❌ No token received in login response");
      throw new Error("Invalid login response - no token received");
    }

    // Lấy token từ response
    const token = response.data.data.token;

    // Lưu token vào localStorage (thêm Bearer để đảm bảo chuẩn)
    localStorage.setItem("token", `Bearer ${token}`);
    console.log("✅ Token saved to localStorage:", localStorage.getItem("token"));

    return response.data;
  } catch (error) {
    console.error("❌ Login API error:", error);

    // Xử lý lỗi linh hoạt hơn
    if (error.response) {
      console.error("❌ API Error Response:", error.response.data);
      throw error.response.data;
    } else {
      throw new Error(error.message || "Unknown error occurred");
    }
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