// src/api/cartApi.js
import axios from 'axios';

const BASE_URL = 'https://localhost:7290/api/Cart'; 

// Lấy cart của user hiện tại
export const getCartByUser = async () => {
  const response = await axiosClient.get('/api/cart/user');
  return response.data; // Mảng cart item
};

// Thêm sản phẩm vào giỏ
export const addToCart = async (productId, quantity) => {
  const response = await axiosClient.post('/api/cart', { productId, quantity });
  return response.data;
};

// Cập nhật giỏ hàng
export const updateCart = async (cartId, productId, quantity) => {
  const response = await axiosClient.put(`/api/cart/${cartId}`, {
    productId,
    quantity,
  });
  return response.data;
};

// Xóa 1 item khỏi giỏ
export const deleteCartItem = async (cartId) => {
  await axiosClient.delete(`/api/cart/${cartId}`);
};
