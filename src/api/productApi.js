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
        _t: now, // Use timestamp to prevent caching
        _random: Math.random() // Add an additional random parameter to force refresh
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

    // Format image URLs with timestamp to prevent caching
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

// Get products with sorting and filtering
export const getProductsWithFilters = async (pageNumber = 1, pageSize = 10, filters = {}, sortOption = '') => {
  try {
    const now = Date.now();
    if (now - lastRequestTime < DEBOUNCE_DELAY) {
      console.log('Request debounced');
      return null;
    }
    lastRequestTime = now;

    console.log(`Fetching products with filters: page ${pageNumber}, size ${pageSize}, filters:`, filters, 'sort:', sortOption);
    
    // Prepare query parameters
    const params = { 
      pageNumber, 
      pageSize,
      _t: now,
      _random: Math.random()
    };

    // Add filters to params
    if (filters.skinTypeId) params.skinTypeId = filters.skinTypeId;
    if (filters.productTypeId) params.productTypeId = filters.productTypeId;
    if (filters.branchId) params.branchId = filters.branchId;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.minRating) params.minRating = filters.minRating;
    if (filters.maxRating) params.maxRating = filters.maxRating;
    
    // Add sort option
    if (sortOption) params.sortBy = sortOption;

    const response = await axiosClient.get(API_URL, {
      params,
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

    // Format image URLs with timestamp to prevent caching
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

    return {
      products: formattedProducts,
      pagination: paginationData
    };
  } catch (error) {
    console.error("Error in getProductsWithFilters:", error);
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
export const getProductsByType = async (productTypeId, pageNumber = 1, pageSize = 10) => {
  try {
    const response = await axiosClient.get(`${API_URL}/product-type/${productTypeId}`, {
      params: {
        pageNumber,
        pageSize,
        _t: new Date().getTime()
      }
    });

    if (!response.data || !response.data.data) {
      console.error('Invalid API response format:', response.data);
      throw new Error('Invalid API response format');
    }

    // Format image URLs
    const formattedProducts = response.data.data.map(product => ({
      ...product,
      image: formatProductImageUrl(product.image + "?t=" + new Date().getTime())
    }));

    return {
      products: formattedProducts,
      pagination: response.data.pagination || {
        currentPage: pageNumber,
        pageSize: pageSize,
        totalPages: 1,
        totalItems: formattedProducts.length
      }
    };
  } catch (error) {
    console.error(`Error fetching products by type ${productTypeId}:`, error);
    throw error;
  }
};

/**
 * Lấy sản phẩm theo thương hiệu (Branch)
 */
export const getProductsByBranch = async (branchId, pageNumber = 1, pageSize = 10) => {
  try {
    const response = await axiosClient.get(`${API_URL}/branch/${branchId}`, {
      params: {
        pageNumber,
        pageSize,
        _t: new Date().getTime()
      }
    });

    if (!response.data || !response.data.data) {
      console.error('Invalid API response format:', response.data);
      throw new Error('Invalid API response format');
    }

    // Format image URLs
    const formattedProducts = response.data.data.map(product => ({
      ...product,
      image: formatProductImageUrl(product.image + "?t=" + new Date().getTime())
    }));

    return {
      products: formattedProducts,
      pagination: response.data.pagination || {
        currentPage: pageNumber,
        pageSize: pageSize,
        totalPages: 1,
        totalItems: formattedProducts.length
      }
    };
  } catch (error) {
    console.error(`Error fetching products by branch ${branchId}:`, error);
    throw error;
  }
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

    console.log("Original product data received:", productData);

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
    
    // Extract data based on whether we're getting it from FormData or direct object
    const name = productData.get ? productData.get("Name") : productData.name;
    const description = productData.get ? productData.get("Description") : productData.description;
    const price = productData.get ? productData.get("Price") : productData.price;
    const isAvailable = productData.get ? productData.get("IsAvailable") : productData.isAvailable;
    const productTypeId = productData.get ? productData.get("ProductTypeId") : productData.productTypeId;
    const productBrandId = productData.get ? productData.get("ProductBrandId") : productData.productBrandId;
    const quantity = productData.get ? productData.get("Quantity") : productData.quantity;
    const stock = productData.get ? productData.get("Stock") : productData.stock;
    const branchId = productData.get ? productData.get("BranchId") : productData.branchId;
    
    // Get skin type IDs - handle differently based on data type
    let skinTypeIds = [];
    if (productData instanceof FormData) {
      // For FormData, we need to extract all entries with the same name
      for (let [key, value] of productData.entries()) {
        if (key === "SkinTypeIds") {
          skinTypeIds.push(parseInt(value, 10));
        }
      }
    } else if (Array.isArray(productData.skinTypeIds)) {
      skinTypeIds = productData.skinTypeIds.map(id => parseInt(id, 10));
    }

    // Ensure stock is 0 or greater (not null or undefined)
    const parsedStock = stock !== null && stock !== undefined ? parseInt(stock, 10) : 0;
    
    // If stock is 0, automatically set isAvailable to false
    // If stock is greater than 0, automatically set isAvailable to true
    let finalIsAvailable; 
    if (parsedStock <= 0) {
      finalIsAvailable = false;
      console.log(`Stock is ${parsedStock}, automatically setting isAvailable to false`);
    } else {
      // When stock > 0, always set isAvailable to true regardless of passed value
      finalIsAvailable = true;
      console.log(`Stock is ${parsedStock} > 0, automatically setting isAvailable to true`);
    }
    
    // Tạo đúng cấu trúc dữ liệu theo UpdateProductDto
    const updateData = {
      name: name,
      description: description,
      price: price ? parseFloat(price) : null,
      // Chỉ gán imageUrl nếu upload thành công, nếu không giữ nguyên giá trị cũ (có thể null hoặc undefined)
      image: imageUrl || undefined, // Use undefined to prevent sending null and keep old image
      // Đảm bảo isAvailable là boolean và phù hợp với stock
      isAvailable: finalIsAvailable,
      productTypeId: productTypeId ? parseInt(productTypeId, 10) : null,
      productBrandId: productBrandId ? parseInt(productBrandId, 10) : null,
      quantity: quantity ? parseInt(quantity, 10) : 0,
      stock: parsedStock,
      branchId: branchId ? parseInt(branchId, 10) : null,
      // Xử lý skinTypeIds nếu có
      skinTypeIds: skinTypeIds.length > 0 ? skinTypeIds : null
    };
    
    // Remove image property if no new image is provided to avoid overwriting
    if (!imageUrl) {
      delete updateData.image;
    }
    
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
    console.log(`Searching for products with keyword: "${keyword}"`);
    
    // Use the keyword directly - axios will handle encoding properly
    const response = await axiosClient.get(`/Product/search`, { 
      params: { keyword },
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json; charset=utf-8'
      }
    });
    
    console.log('Search response status:', response.status);
    console.log('Search response data:', response.data);
    
    // Process images to ensure they have correct URLs
    const processedResults = response.data && response.data.data
      ? response.data.data.map(product => ({
          ...product,
          image: formatProductImageUrl(product.image)
        }))
      : [];
      
    return { data: processedResults };
  } catch (error) {
    console.error('Error fetching search results:', error);
    console.error('Error details:', error.response?.data || error.message);
    return { data: [] };
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
 * So sánh sản phẩm
 */
export const compareProducts = async (productIds) => {
  try {
    console.log(`Comparing products with IDs: ${productIds.join(', ')}`);
    
    const response = await axiosClient.post(`${API_URL}/compare`, {
      productIds: productIds
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
    
    console.log('Compare API response:', response.data);
    
    if (!response.data || !response.data.data) {
      console.error('Invalid API response format:', response.data);
      throw new Error('Invalid API response format');
    }
    
    // Format image URLs and process data
    const formattedProducts = response.data.data.map(product => ({
      ...product,
      image: formatProductImageUrl(product.image),
      productBrand: {
        name: product.productBrandName
      },
      productType: {
        name: product.productTypeName
      }
      // Không chuyển đổi skinTypes để giữ nguyên dạng mảng chuỗi
    }));
    
    console.log('Formatted products:', formattedProducts);
    return formattedProducts;
  } catch (error) {
    console.error("Error comparing products:", error);
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
 * Get all branches
 */
export const getAllBranches = async () => {
  try {
    const response = await axiosClient.get('/Branch');
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching branches:', error);
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
