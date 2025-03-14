import axios from 'axios';
import axiosClient from './axiosClient';

const API_URL = 'https://localhost:7290/api/Order';

// Fetch all orders
export const getAllOrders = async () => {
  const response = await axiosClient.get('/Order');
  return response.data;
};

// Fetch order details by ID
export const getOrderDetail = async (orderId) => {
  const response = await axiosClient.get(`/Order/${orderId}`);
  return response.data;
};

// Create a new order
export const createOrder = async (orderData) => {
  const response = await axiosClient.post('/Order', orderData);
  return response.data;
};

// Update an existing order
export const updateOrder = async (orderId, orderData) => {
  const response = await axiosClient.put(`/Order/${orderId}`, orderData);
  return response.data;
};

// Delete an order
export const deleteOrder = async (orderId) => {
  const response = await axiosClient.delete(`/Order/${orderId}`);
  return response.data;
};

// Update order status
export const updateOrderStatus = async (orderId, status) => {
  const response = await axios.patch(`${API_URL}/${orderId}/status`, { status });
  return response.data;
};
