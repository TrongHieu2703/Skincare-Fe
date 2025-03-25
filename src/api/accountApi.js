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
    
    // Đảm bảo token vẫn còn sau khi API call
    const currentToken = localStorage.getItem('token');
    if (!currentToken && token) {
      localStorage.setItem('token', token); // Restore token nếu bị mất
    }
    
    // Cập nhật localStorage với thông tin mới
    const userData = res.data.data;
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    
    const updatedUser = {
      ...currentUser,
      username: userData.username,
      email: userData.email,
      avatar: userData.avatar,
      phoneNumber: userData.phoneNumber,
      address: userData.address
    };
    
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    return userData; 
  } catch (error) {
    // Chỉ remove token nếu là lỗi 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }
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

// Thêm hàm mới vào accountApi.js
export const uploadAvatar = async (avatarFile) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Chưa đăng nhập");

    const formData = new FormData();
    formData.append('avatar', avatarFile);

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    };

    const res = await axiosClient.post("/Account/upload-avatar", formData, config);
    return res.data; // Trả về object chứa avatarUrl
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi khi upload ảnh đại diện");
  }
};

// Thêm hàm update profile với avatar
export const updateProfileWithAvatar = async (profileData, avatarFile) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Chưa đăng nhập");

    const formData = new FormData();
    formData.append('username', profileData.username || '');
    formData.append('email', profileData.email || '');
    formData.append('address', profileData.address || '');
    formData.append('phoneNumber', profileData.phoneNumber || '');
    
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    };

    console.log("Sending profile update request", { profileData, hasAvatar: !!avatarFile });
    const res = await axiosClient.put("/Account/update-profile-with-avatar", formData, config);
    
    // Đảm bảo lưu token không bị mất
    const currentToken = localStorage.getItem('token');
    if (!currentToken && token) {
      localStorage.setItem('token', token); // Restore token nếu bị mất
    }
    
    return res.data;
  } catch (error) {
    console.error("Profile update error:", error);
    throw new Error(error.response?.data?.message || "Lỗi khi cập nhật thông tin");
  }
};

// Hàm mới để chuyển đổi ảnh từ Google Drive sang local
export const migrateGoogleDriveAvatar = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Chưa đăng nhập");

    const res = await axiosClient.post("/Account/migrate-my-avatar");
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi khi chuyển đổi ảnh đại diện");
  }
};

// Hàm cưỡng chế chuyển đổi ảnh từ Google Drive sang local
export const forceMigrateGoogleDriveAvatar = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Chưa đăng nhập");

    const res = await axiosClient.post("/Account/force-migrate-avatar");
    
    // Cập nhật localStorage với avatar mới
    if (res.data && res.data.newAvatar) {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        user.avatar = res.data.newAvatar;
        localStorage.setItem('user', JSON.stringify(user));
        // Thông báo cập nhật
        window.dispatchEvent(new CustomEvent('user-profile-updated'));
      }
    }
    
    return res.data;
  } catch (error) {
    console.error("Error force migrating avatar:", error);
    throw new Error(error.response?.data?.message || "Lỗi khi chuyển đổi ảnh đại diện");
  }
};
