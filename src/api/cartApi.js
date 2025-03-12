import axiosClient from "./axiosClient";

// Lấy cart của user hiện tại với phân trang (server dựa vào token)
export const getCartByUser = async (pageNumber = 1, pageSize = 10) => {
  const response = await axiosClient.get("/cart/user", {
    params: { pageNumber, pageSize }
  });
  return response.data; // Mảng cart item
};

// Thêm sản phẩm vào giỏ
export const addToCart = async (productId, quantity) => {
  const response = await axiosClient.post("/cart", { productId, quantity });
  return response.data;
};

// Cập nhật cart item
export const updateCart = async (cartId, productId, quantity) => {
  const response = await axiosClient.put(`/cart/${cartId}`, { productId, quantity });
  return response.data;
};

// Xóa 1 item khỏi giỏ
export const deleteCartItem = async (cartId) => {
  await axiosClient.delete(`/cart/${cartId}`);
};
