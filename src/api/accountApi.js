import axiosClient from './axiosClient';

export const getAllAccounts = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Chưa đăng nhập");

    const res = await axiosClient.get('/Account', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách tài khoản:", error);
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }
    throw error.response ? error.response.data : error.message;
  }
};

export const deleteAccount = async (id) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Chưa đăng nhập");

    const res = await axiosClient.delete(`/Account/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  } catch (error) {
    console.error("Lỗi khi xóa tài khoản:", error);
    throw error.response ? error.response.data : error.message;
  }
};
export const getAccountInfo = async () => {
  try {
    const response = await axios.get("/api/Account/user-profile", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}` // hoặc thay bằng token bạn đang dùng
      }
    });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi khi lấy thông tin tài khoản");
  }
};
export const updateAccountInfo = async (updatedData) => {
  try {
    const response = await axios.put("/api/Account/update-profile", updatedData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, // hoặc token bạn đang dùng
        "Content-Type": "application/json"
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi khi cập nhật thông tin");
  }
};

