import axios from 'axios';

const BASE_URL = 'https://localhost:7290/api/Cart';

// Lấy token từ localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// 🛒 Lấy giỏ hàng của user hiện tại
export const getCartByUser = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/user`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      }
    });
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi lấy giỏ hàng:", error.response?.status, error.response?.data);
    return [];
  }
};

// 🛍️ Thêm sản phẩm vào giỏ hàng
export const addToCart = async (productId, quantity) => {
  try {
    const response = await axios.post(`${BASE_URL}`, { productId, quantity }, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      }
    });
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi thêm vào giỏ hàng:", error.response?.status, error.response?.data);
    return null;
  }
};

// 🔄 Cập nhật giỏ hàng (thay đổi số lượng sản phẩm)
export const updateCart = async (cartId, quantity) => {
  try {
    const response = await axios.put(`${BASE_URL}/${cartId}`, { quantity }, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      }
    });
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật giỏ hàng:", error.response?.status, error.response?.data);
    return null;
  }
};

// ❌ Xóa sản phẩm khỏi giỏ hàng
export const deleteCartItem = async (cartId) => {
  try {
    await axios.delete(`${BASE_URL}/${cartId}`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      }
    });
    console.log(`✅ Xóa sản phẩm ${cartId} thành công.`);
  } catch (error) {
    console.error("❌ Lỗi khi xóa sản phẩm:", error.response?.status, error.response?.data);
  }
};
