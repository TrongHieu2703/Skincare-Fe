// src/api/orderApi.js
import axios from 'axios';

const BASE_URL = 'https://localhost:7290/api/Order'; 

// 📋 Lấy tất cả đơn hàng
export const getAllOrders = async () => {
  try {
    const response = await axios.get(`${BASE_URL}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// 🔎 Lấy đơn hàng theo ID
export const getOrderById = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order with ID ${id}:`, error);
    throw error;
  }
};

// ➕ Tạo đơn hàng mới
export const createOrder = async (orderData) => {
  try {
    const response = await axios.post(`${BASE_URL}`, orderData);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// ✏️ Cập nhật đơn hàng
export const updateOrder = async (id, orderData) => {
  try {
    const response = await axios.put(`${BASE_URL}/${id}`, orderData);
    return response.data;
  } catch (error) {
    console.error(`Error updating order with ID ${id}:`, error);
    throw error;
  }
};

// 🗑️ Xóa đơn hàng
export const deleteOrder = async (id) => {
  try {
    await axios.delete(`${BASE_URL}/${id}`);
  } catch (error) {
    console.error(`Error deleting order with ID ${id}:`, error);
    throw error;
  }
};
