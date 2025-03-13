import axiosClient from "./axiosClient";

const API_URL = "/Product";

/**
 * Lấy tất cả sản phẩm với phân trang
 */
export const getAllProducts = (pageNumber = 1, pageSize = 28) => {
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
    return response;
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    throw error;
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

// Search products
export const searchProducts = async (keyword) => {
  try {
    console.log(`Searching for products with keyword: ${keyword}`); // Log the search keyword
    const response = await axiosClient.get(`/Product/search`, { // Adjust the endpoint if necessary
      params: { keyword: encodeURIComponent(keyword) }
    });
    console.log('Search response:', response.data); // Log the response data
    return response.data;
  } catch (error) {
    console.error('Error fetching search results:', error);
    return [];
  }
};
