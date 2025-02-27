// src/api/cartApi.js
import axios from 'axios';

const BASE_URL = 'https://localhost:7290/api/Cart'; 

// 📋 Lấy tất cả giỏ hàng
export const getAllCarts = async (pageNumber = 1, pageSize = 10) => {
  try {
    const response = await axios.get(`${BASE_URL}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching carts:', error);
    throw error;
  }
};

// 🔎 Lấy giỏ hàng theo ID
export const getCartById = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching cart with ID ${id}:`, error);
    throw error;
  }
};

// 📦 Lấy giỏ hàng theo UserID
export const getCartsByUserId = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching cart for user ID ${userId}:`, error);
    throw error;
  }
};

// ➕ Thêm sản phẩm vào giỏ hàng
export const addCart = async (cartData) => {
  try {
    const response = await axios.post(`${BASE_URL}`, cartData);
    return response.data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

// ✏️ Cập nhật giỏ hàng
export const updateCart = async (id, cartData) => {
  try {
    const response = await axios.put(`${BASE_URL}/${id}`, cartData);
    return response.data;
  } catch (error) {
    console.error(`Error updating cart with ID ${id}:`, error);
    throw error;
  }
};

// 🗑️ Xóa giỏ hàng
export const deleteCart = async (id) => {
  try {
    await axios.delete(`${BASE_URL}/${id}`);
  } catch (error) {
    console.error(`Error deleting cart with ID ${id}:`, error);
    throw error;
  }
};
