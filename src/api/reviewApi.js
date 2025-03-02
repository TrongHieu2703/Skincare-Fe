import axiosClient from "./axiosClient";

const API_URL = "/Review";

// Lấy danh sách review của sản phẩm
export const getReviewsByProductId = async (productId) => {
  const response = await axiosClient.get(`${API_URL}/product/${productId}`);
  return response.data;
};

// Lấy review theo ID
export const getReviewById = async (id) => {
  const response = await axiosClient.get(`${API_URL}/${id}`);
  return response.data;
};

// Tạo review mới
export const createReview = async (reviewData) => {
  const response = await axiosClient.post(API_URL, reviewData);
  return response.data;
};

// Cập nhật review
export const updateReview = async (id, reviewData) => {
  const response = await axiosClient.put(`${API_URL}/${id}`, reviewData);
  return response.data;
};

// Xóa review
export const deleteReview = async (id) => {
  await axiosClient.delete(`${API_URL}/${id}`);
};
