import axios from 'axios';

const API_URL = 'https://localhost:7290/api/Product';

/**
 * Lấy tất cả sản phẩm với phân trang
 * @param {number} pageNumber - Số trang
 * @param {number} pageSize - Số sản phẩm trên mỗi trang
 */
export const getAllProducts = (pageNumber = 1, pageSize = 10) => {
  return axios.get(`${API_URL}`, {
    params: { pageNumber, pageSize },
  });
};

/**
 * Lấy chi tiết sản phẩm theo ID
 * @param {number} productId - ID sản phẩm
 */
export const getProductById = (productId) => {
  return axios.get(`${API_URL}/${productId}`);
};

/**
 * Lấy sản phẩm theo loại (Product Type)
 * @param {number} productTypeId - ID loại sản phẩm
 */
export const getProductsByType = (productTypeId) => {
  return axios.get(`${API_URL}/by-type/${productTypeId}`);
};

/**
 * Thêm sản phẩm mới (Chỉ dành cho Admin)
 * @param {Object} productData - Thông tin sản phẩm mới
 * @param {string} token - JWT Token để xác thực
 */
export const createProduct = (productData, token) => {
  return axios.post(`${API_URL}`, productData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

/**
 * Cập nhật sản phẩm (Chỉ dành cho Admin)
 * @param {number} productId - ID sản phẩm
 * @param {Object} updatedData - Dữ liệu sản phẩm cập nhật
 * @param {string} token - JWT Token để xác thực
 */
export const updateProduct = (productId, updatedData, token) => {
  return axios.put(`${API_URL}/${productId}`, updatedData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

/**
 * Xóa sản phẩm (Chỉ dành cho Admin)
 * @param {number} productId - ID sản phẩm cần xóa
 * @param {string} token - JWT Token để xác thực
 */
export const deleteProduct = (productId, token) => {
  return axios.delete(`${API_URL}/${productId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
