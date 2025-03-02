import axiosClient from "./axiosClient";

const API_URL = "/Payment";

// Xử lý thanh toán (ví dụ: thanh toán online)
export const processPayment = async (paymentData) => {
  // paymentData có thể chứa: orderId, paymentMethod, amount, v.v.
  const response = await axiosClient.post(API_URL, paymentData);
  return response.data;
};

// Lấy trạng thái thanh toán
export const getPaymentStatus = async (paymentId) => {
  const response = await axiosClient.get(`${API_URL}/${paymentId}`);
  return response.data;
};
