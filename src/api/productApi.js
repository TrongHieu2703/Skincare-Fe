import axiosClient from "./axiosClient";

const API_URL = "/Product";

/**
 * Lấy tất cả sản phẩm với phân trang
 */
import { formatProductImageUrl } from "../utils/imageUtils";

// Add debounce utility
let lastRequestTime = 0;
const DEBOUNCE_DELAY = 300; // 300ms delay

export const getAllProducts = async (pageNumber = 1, pageSize = 10) => {
  try {
    // Implement debounce
    const now = Date.now();
    if (now - lastRequestTime < DEBOUNCE_DELAY) {
      console.log('Request debounced');
      return null;
    }
    lastRequestTime = now;

    console.log(`Fetching products: page ${pageNumber}, size ${pageSize}`);
    
    const response = await axiosClient.get(API_URL, {
      params: { 
        pageNumber, 
        pageSize,
        _t: now // Use the same timestamp
      },
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });

    console.log('API Response:', response.data);

    if (!response.data || !response.data.data) {
      console.error('Invalid API response format:', response.data);
      throw new Error('Invalid API response format');
    }

    // Format image URLs
    const formattedProducts = response.data.data.map(product => ({
      ...product,
      image: formatProductImageUrl(product.image + "?t=" + now)
    }));

    // Use pagination info from API response
    const paginationData = response.data.pagination || {
      currentPage: pageNumber,
      pageSize: pageSize,
      totalPages: 1,
      totalItems: formattedProducts.length
    };

    console.log('Pagination data received from API:', response.data.pagination);
    console.log('Final pagination data used:', paginationData);

    return {
      products: formattedProducts,
      pagination: paginationData
    };
  } catch (error) {
    console.error("Error in getAllProducts:", error);
    // Return empty data with pagination info in case of error
    return {
      products: [],
      pagination: {
        currentPage: pageNumber,
        pageSize: pageSize,
        totalPages: 0,
        totalItems: 0
      }
    };
  }
};


/**
 * Lấy chi tiết sản phẩm theo ID
 */

export const getProductById = async (id) => {
  try {
    const response = await axiosClient.get(`${API_URL}/${id}`, {
      params: {
        _t: new Date().getTime()
      },
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
    console.log("Raw API response:", response);

    if (response.data && response.data.data) {
      // ✅ Định dạng lại đường dẫn ảnh trước khi trả về
      response.data.data.image = formatProductImageUrl(response.data.data.image + "?t=" + new Date().getTime());
    }

    return response.data;
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
export const createProduct = async (productData, imageFile) => {
  const formData = new FormData();

  // Add product data fields to FormData
  formData.append('name', productData.name);
  formData.append('description', productData.description);
  formData.append('price', productData.price);
  formData.append('isAvailable', productData.isAvailable || true);
  formData.append('productTypeId', productData.productTypeId);
  formData.append('productBrandId', productData.productBrandId);

  // Add image file if provided
  if (imageFile) {
    formData.append('image', imageFile);
  }

  return axiosClient.post(API_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * Cập nhật sản phẩm (Admin)
 */
export const updateProduct = async (id, productData) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Chưa đăng nhập");

    const formData = new FormData();
    
    // Append all product data
    if (productData.name) formData.append("name", productData.name);
    if (productData.description) formData.append("description", productData.description);
    if (productData.price) formData.append("price", productData.price);
    if (productData.isAvailable !== undefined) formData.append("isAvailable", productData.isAvailable);
    if (productData.productTypeId) formData.append("productTypeId", productData.productTypeId);
    if (productData.productBrandId) formData.append("productBrandId", productData.productBrandId);
    
    // Append image file if exists
    if (productData.imageFile) {
      console.log("Appending image file to request:", productData.imageFile.name);
      formData.append("image", productData.imageFile);
    }

    formData.append("_t", new Date().getTime());

    // Log FormData contents for debugging
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    const res = await axiosClient.put(`/Product/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

    console.log("Update response:", res);
    return res.data;
  } catch (error) {
    console.error("Error updating product:", error);
    throw new Error(error.response?.data?.message || "Lỗi khi cập nhật sản phẩm");
  }
};


export const updateProductWithImage = async (imageFile) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Chưa đăng nhập");

    const formData = new FormData();
    formData.append('image', imageFile);

    const res = await axiosClient.post("/Product/upload-product-image", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    return res.data.imageUrl; // Trả về đường dẫn ảnh
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi khi upload ảnh sản phẩm");
  }
};


/**
 * Xóa sản phẩm (Admin)
 */
export const deleteProduct = async (productId) => {
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

/**
 * Tạo sản phẩm mới với ảnh (Admin)
 */
export const createProductWithImage = (productData, imageFile) => {
  const formData = new FormData();

  // Add product data fields to FormData
  formData.append('name', productData.name);
  formData.append('description', productData.description);
  formData.append('price', productData.price);
  formData.append('isAvailable', productData.isAvailable || true);
  formData.append('productTypeId', productData.productTypeId);
  formData.append('productBrandId', productData.productBrandId);

  // Add image file
  if (imageFile) {
    formData.append('image', imageFile);
  }

  return axiosClient.post(`${API_URL}/with-image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * Cập nhật sản phẩm với hình ảnh (Admin)
 */



/**
 * Lấy sản phẩm theo loại da
 */
export const getProductsBySkinType = async (skinTypeId) => {
  try {
    const response = await axiosClient.get(`${API_URL}/skin-type/${skinTypeId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching products for skin type ${skinTypeId}:`, error);
    throw error;
  }
};
