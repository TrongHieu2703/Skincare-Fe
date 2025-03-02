import axiosClient from "./axiosClient";

const BASE_URL = "/Order";

// Lấy tất cả đơn hàng
export const getAllOrders = async () => {
  const response = await axiosClient.get(BASE_URL);
  return response.data;
};

// Lấy đơn hàng theo ID
export const getOrderById = async (id) => {
  const response = await axiosClient.get(`${BASE_URL}/${id}`);
  return response.data;
};

// Tạo đơn hàng mới
export const createOrder = async (orderData) => {
  const response = await axiosClient.post(BASE_URL, orderData);
  return response.data;
};

// Cập nhật đơn hàng
export const updateOrder = async (id, orderData) => {
  const response = await axiosClient.put(`${BASE_URL}/${id}`, orderData);
  return response.data;
};

// Xóa đơn hàng
export const deleteOrder = async (id) => {
  await axiosClient.delete(`${BASE_URL}/${id}`);
};
