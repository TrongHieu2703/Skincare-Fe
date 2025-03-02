import axiosClient from "./axiosClient";

export const getAccountInfo = async () => {
  try {
    console.log("Calling getAccountInfo API"); // Debug log
    
    // Kiểm tra token trước khi gọi API
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("No token available for API call");
      throw new Error("Authentication required");
    }
    
    const response = await axiosClient.get("/Account/user-profile");
    console.log("API response:", response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error("API error:", error); // Debug log
    
    // Xử lý lỗi 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // Xóa token không hợp lệ
      localStorage.removeItem('token');
      throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
    }
    
    throw error.response ? error.response.data : error.message;
  }
};

export const updateAccountInfo = async (data) => {
  try {
    console.log("Updating account info with data:", data); // Debug log
    
    // Kiểm tra token trước khi gọi API
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("No token available for updateAccountInfo API call");
      throw new Error("Authentication required");
    }
    
    // Log để xác nhận rằng chúng ta đang gọi API với token
    console.log("Calling updateAccountInfo with token:", token.substring(0, 20) + '...');
    
    const response = await axiosClient.put("/Account/update-profile", data);
    console.log("Update profile response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Update profile error:", error);
    
    // Xử lý lỗi 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // Xóa token không hợp lệ
      localStorage.removeItem('token');
      throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
    }
    
    // Xử lý lỗi 400 Bad Request
    if (error.response && error.response.status === 400) {
      console.error("Bad request details:", error.response.data);
      // Trả về đối tượng lỗi chi tiết
      throw error.response.data;
    }
    
    throw error.response ? error.response.data : error.message;
  }
};

