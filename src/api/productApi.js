import axiosClient from "./axiosClient";

const API_URL = "/Product";

/**
 * Lấy tất cả sản phẩm với phân trang
 */
export const getAllProducts = (pageNumber = 1, pageSize = 10) => {
  return axiosClient.get(API_URL, {
    params: { pageNumber, pageSize },
  });
};

/**
 * Lấy chi tiết sản phẩm theo ID
 */
export const getProductById = async (id) => {
  try {
    const response = await axiosClient.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw new Error(error.message || `Error fetching product with ID ${id}`);
  }
};

/**
 * Lấy sản phẩm theo loại (Product Type)
 */
export const getProductsByType = (productTypeId) => {
  return axiosClient.get(`${API_URL}/by-type/${productTypeId}`);
};

/**
 * Tạo sản phẩm mới (Admin)
 */
export const createProduct = (productData) => {
  return axiosClient.post(API_URL, productData);
};

/**
 * Cập nhật sản phẩm (Admin)
 */
export const updateProduct = (productId, updatedData) => {
  return axiosClient.put(`${API_URL}/${productId}`, updatedData);
};

/**
 * Xóa sản phẩm (Admin)
 */
export const deleteProduct = (productId) => {
  return axiosClient.delete(`${API_URL}/${productId}`);
};
