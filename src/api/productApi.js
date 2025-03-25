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
export const createProduct = async (productData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Chưa đăng nhập");

    console.log("Creating product...");
    
    // If productData is already a FormData object, use it directly
    let formData;
    if (productData instanceof FormData) {
      formData = productData;
      // Log formData entries for debugging
      console.log("Using provided FormData object");
      for (let [key, value] of formData.entries()) {
        console.log(`FormData: ${key} = ${value instanceof File ? value.name : value}`);
      }
    } else {
      // Otherwise create a new FormData object
      formData = new FormData();
      
      // Add product data fields to FormData
      formData.append('name', productData.name);
      formData.append('description', productData.description || '');
      formData.append('price', productData.price);
      formData.append('isAvailable', productData.isAvailable || true);
      
      if (productData.productTypeId) {
        formData.append('productTypeId', productData.productTypeId);
      }
      
      if (productData.productBrandId) {
        formData.append('productBrandId', productData.productBrandId);
      }
      
      // Add quantity and stock if provided
      if (productData.quantity !== undefined) {
        formData.append('quantity', productData.quantity);
      }
      
      if (productData.stock !== undefined) {
        formData.append('stock', productData.stock);
      }
      
      if (productData.branchId) {
        formData.append('branchId', productData.branchId);
      }
      
      // Add skin types if any
      if (productData.skinTypeIds && productData.skinTypeIds.length > 0) {
        productData.skinTypeIds.forEach((id, index) => {
          formData.append(`skinTypeIds[${index}]`, id);
        });
      }

      // Add image file if provided
      if (productData.imageFile) {
        console.log("Including image file:", productData.imageFile.name);
        formData.append('image', productData.imageFile);
      }
    }

    const response = await axiosClient.post(API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error creating product:", error);
    
    // Enhanced error logging
    if (error.response) {
      console.error("API Error Response:", error.response.data);
      console.error("Status Code:", error.response.status);
      
      // Extract validation errors if available
      const validationErrors = error.response.data?.errors;
      if (validationErrors) {
        console.error("Validation Errors:", validationErrors);
        
        // Format validation errors into a readable message
        const errorMessages = Object.entries(validationErrors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('\n');
        
        throw new Error(`Validation errors:\n${errorMessages}`);
      }
    }
    
    throw new Error(error.response?.data?.message || "Lỗi khi tạo sản phẩm");
  }
};

/**
 * Cập nhật sản phẩm (Admin)
 */
export const updateProduct = async (id, productData) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Chưa đăng nhập");

    // Kiểm tra xem có file ảnh để upload riêng không
    let imageUrl = null;
    if (productData.imageFile instanceof File && productData.imageFile.size > 0) {
      const imgFormData = new FormData();
      imgFormData.append('image', productData.imageFile);
      
      console.log("Uploading image first:", productData.imageFile.name);
      
      const uploadResponse = await axiosClient.post("/Product/upload-product-image", imgFormData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      
      console.log("Image upload response:", uploadResponse);
      imageUrl = uploadResponse.data.imageUrl;
    }
    
    // Tạo đúng cấu trúc dữ liệu theo UpdateProductDto
    const updateData = {
      name: productData.name,
      description: productData.description,
      price: productData.price ? parseFloat(productData.price) : null,
      // Chỉ gán imageUrl nếu upload thành công, nếu không giữ giá trị cũ
      image: imageUrl || productData.image,
      // Đảm bảo isAvailable là boolean
      isAvailable: productData.isAvailable === true || productData.isAvailable === 'true',
      productTypeId: productData.productTypeId ? parseInt(productData.productTypeId, 10) : null,
      productBrandId: productData.productBrandId ? parseInt(productData.productBrandId, 10) : null,
      quantity: productData.quantity ? parseInt(productData.quantity, 10) : null,
      stock: productData.stock ? parseInt(productData.stock, 10) : null,
      branchId: productData.branchId ? parseInt(productData.branchId, 10) : null,
      // Xử lý skinTypeIds nếu có
      skinTypeIds: Array.isArray(productData.skinTypeIds) 
        ? productData.skinTypeIds.map(id => parseInt(id, 10)) 
        : null
    };
    
    console.log("Sending update request with data:", updateData);
    
    // Gửi request với JSON data
    const res = await axiosClient.put(`/Product/${id}`, updateData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    console.log("Update response:", res);
    return res.data;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error.response?.data || error;
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

/**
 * Get all product types
 */
export const getAllProductTypes = async () => {
  try {
    const response = await axiosClient.get('/ProductType');
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching product types:', error);
    return [];
  }
};

/**
 * Get all skin types
 */
export const getAllSkinTypes = async () => {
  try {
    // First try the regular endpoint
    const response = await axiosClient.get('/SkinType');
    console.log('SkinType API response:', response);
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    // If response format is unexpected, try the test endpoint
    try {
      const testResponse = await axiosClient.get('/SkinType/test');
      console.log('SkinType test endpoint response:', testResponse);
      
      // Return default skin types since test endpoint worked but doesn't return data
      return [
        { id: 1, name: "Da khô" },
        { id: 2, name: "Da dầu" },
        { id: 3, name: "Da nhạy cảm" },
        { id: 4, name: "Da hỗn hợp" }
      ];
    } catch (testError) {
      console.error('Error with test endpoint:', testError);
      throw testError;
    }
  } catch (error) {
    console.error('Error fetching skin types:', error);
    
    // Return default skin types as fallback
    console.log('Returning default skin types due to API error');
    return [
      { id: 1, name: "Da khô" },
      { id: 2, name: "Da dầu" },
      { id: 3, name: "Da nhạy cảm" },
      { id: 4, name: "Da hỗn hợp" }
    ];
  }
};
