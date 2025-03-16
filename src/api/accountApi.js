import axiosClient from './axiosClient';

// ✅ Lấy danh sách tất cả tài khoản
export const getAllAccounts = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Chưa đăng nhập");

    const res = await axiosClient.get('/Account', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data.data; // Trả về mảng danh sách account
  } catch (error) {
    console.error("Lỗi khi lấy danh sách tài khoản:", error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    } else if (error.response?.status === 403) {
      throw new Error("Bạn không có quyền truy cập tài nguyên này.");
    }
    throw new Error(error.response?.data?.message || "Lỗi không xác định");
  }
};

// ✅ Xoá tài khoản theo ID
export const deleteAccount = async (id) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Chưa đăng nhập");

    const res = await axiosClient.delete(`/Account/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data; // Có thể chứa message: "Account deleted successfully"
  } catch (error) {
    console.error("Lỗi khi xóa tài khoản:", error);
    throw new Error(error.response?.data?.message || "Lỗi không xác định khi xoá tài khoản");
  }
};

// ✅ Lấy thông tin tài khoản hiện tại (user đang đăng nhập)
export const getAccountInfo = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Chưa đăng nhập");

    const res = await axiosClient.get("/Account/user-profile", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data.data; // Trả về object user info
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi khi lấy thông tin tài khoản");
  }
};

// ✅ Cập nhật thông tin tài khoản
export const updateAccountInfo = async (updatedData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Chưa đăng nhập");

    const res = await axiosClient.put("/Account/update-profile", updatedData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    return res.data; // Có thể chứa message: "Cập nhật thành công"
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi khi cập nhật thông tin");
  }
};

// ✅ Tạo tài khoản mới
export const createAccount = async (newAccountData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Chưa đăng nhập");

    const res = await axiosClient.post('/Account', newAccountData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    return res.data; // Có thể chứa message: "Account created successfully"
  } catch (error) {
    console.error("Lỗi khi tạo tài khoản:", error);
    throw new Error(error.response?.data?.message || "Lỗi không xác định khi tạo tài khoản");
  }
};
