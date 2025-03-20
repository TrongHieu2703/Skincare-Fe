import React, { useState, useEffect } from "react";
import styles from "./ProductManager.module.css";
import Sidebar from "./Sidebar";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import axios from "axios";
import { formatProductImageUrl } from "../../../src/utils/imageUtils";


// Các hàm API cho Product
import {
  getAllProducts,
  createProduct,
  updateProduct,
  updateProductWithImage,
  deleteProduct,
} from "/src/api/productApi";

// Giả lập hàm API cho brand & product type
// Thực tế bạn tạo file brandApi.js, productTypeApi.js
async function getAllBrands() {
  // return axiosClient.get("/Brand"); ...
  return [
    { id: 1, name: "Brand A" },
    { id: 2, name: "Brand B" },
  ];
}
async function getAllProductTypes() {
  // return axiosClient.get("/ProductType"); ...
  return [
    { id: 10, name: "Type X" },
    { id: 20, name: "Type Y" },
  ];
}

const axiosClient = axios.create({
  baseURL: 'https://localhost:7290/api'
});

// Add this function to handle direct API calls with better error handling
const API_BASE_URL = 'https://localhost:7290/api';

const apiCall = async (url, method, data) => {
  try {
    // Ensure URL has the correct base
    if (!url.startsWith('http')) {
      url = `${API_BASE_URL}${url.startsWith('/') ? url : '/' + url}`;
    }

    const token = localStorage.getItem('token');
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    if (data) {
      if (data instanceof FormData) {
        options.body = data;
      } else {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(data);
      }
    }

    console.log(`Making ${method} request to ${url}`);
    const response = await fetch(url, options);

    // Log response status
    console.log(`Response status: ${response.status}`);

    // Try to parse response body
    let responseBody;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseBody = await response.json();
    } else {
      responseBody = await response.text();
    }

    console.log('Response body:', responseBody);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} - ${JSON.stringify(responseBody)}`);
    }

    return responseBody;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Add this function to debug API errors
const debugApiError = async (error) => {
  console.error("API Error Details:", error);

  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error("Response data:", error.response.data);
    console.error("Response status:", error.response.status);
    console.error("Response headers:", error.response.headers);
  } else if (error.request) {
    // The request was made but no response was received
    console.error("Request sent but no response:", error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error("Error message:", error.message);
  }
};

// Add this function to compress images before upload
const compressImage = async (file, maxSizeMB = 1) => {
  // Import the library dynamically to avoid bundling it unnecessarily
  const imageCompression = await import('browser-image-compression');

  const options = {
    maxSizeMB: maxSizeMB,
    maxWidthOrHeight: 1200, // Limit width/height while maintaining aspect ratio
    useWebWorker: true,  // Use web worker for better performance
  };

  try {
    const compressedFile = await imageCompression.default(file, options);
    console.log(`Original size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Compressed size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
    return compressedFile;
  } catch (error) {
    console.error("Error compressing image:", error);
    return file; // Return original file if compression fails
  }
};

// Add this at the top with your other utility functions
const testImageUrl = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

// Replace getImageUrl function with:
const formatProductImageUr = (imagePath) => {
  if (!imagePath) return '/placeholder.png'; // Ảnh mặc định nếu không có ảnh

  // Nếu đường dẫn ảnh đã là URL đầy đủ (đã có http hoặc https), thì giữ nguyên
  if (imagePath.startsWith('http')) return imagePath;

  // Nếu đường dẫn ảnh bị thiếu dấu `/` ở đầu, thêm vào
  if (!imagePath.startsWith('/')) {
    imagePath = '/' + imagePath;
  }

  // Trả về đường dẫn đầy đủ với API_BASE_URL
  return `${API_BASE_URL}${imagePath}`;
};


const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [brandList, setBrandList] = useState([]);
  const [typeList, setTypeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    totalItems: 0
  });

  // productInForm: state cho form (dùng chung cho cả create & edit)
  const [productInForm, setProductInForm] = useState(null);

  // Xác định form đang ở chế độ "Create" hay "Edit"
  const isEditMode = productInForm?.id != null;

  // Add a state for tracking upload progress
  const [uploadProgress, setUploadProgress] = useState(0);

  // Add a ref to track if the component is mounted
  const isMounted = React.useRef(false);

  // Lấy danh sách product + brand + type khi mount
  useEffect(() => {
    // Skip the first render in strict mode
    if (!isMounted.current) {
      isMounted.current = true;
      fetchAllData(1);
      return;
    }

    // Only fetch data when page changes
    if (pagination.currentPage > 0) {
      fetchAllData(pagination.currentPage);
    }
  }, [pagination.currentPage]);

  const fetchAllData = async (page = 1) => {
    try {
      setLoading(true);
      console.log(`Fetching data for page ${page}`);

      const { products: productData, pagination: paginationData } = await getAllProducts(page);

      // Update products with timestamp for images
      const timestamp = new Date().getTime();
      const productArray = productData.map(product => ({
        ...product,
        mainImage: product.image ? `${product.image}?t=${timestamp}` : product.image
      }));

      setProducts(productArray);

      // Only update pagination if the data is different
      if (JSON.stringify(paginationData) !== JSON.stringify(pagination)) {
        setPagination(paginationData);
      }

      // Fetch brands and types only on first load
      if (page === 1) {
        const [brands, types] = await Promise.all([
          getAllBrands(),
          getAllProductTypes()
        ]);
        setBrandList(brands);
        setTypeList(types);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && newPage !== pagination.currentPage) {
      setPagination(prev => ({
        ...prev,
        currentPage: newPage
      }));
    }
  };

  // Mở form tạo sản phẩm mới
  const handleOpenCreateForm = () => {
    setProductInForm({
      id: null,
      name: "",
      description: "",
      price: 0,
      isAvailable: true,
      productTypeId: 0,
      productBrandId: 0,
      imageFile: null, // Initialize imageFile state
    });
  };

  // Mở form edit
  const handleOpenEditForm = (product) => {
    setProductInForm({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      isAvailable: product.isAvailable,
      productTypeId: product.productTypeId,
      productBrandId: product.productBrandId,
      imageFile: null, // Reset imageFile for edit
    });
  };

  // Xử lý khi thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductInForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Update the handleFileChange function to include image preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file); // Create a preview URL
      setProductInForm((prev) => ({
        ...prev,
        imageFile: file, // Store the selected file
        imagePreview: imageUrl // Store the preview URL
      }));
    }
  };

  const handleSave = async () => {
    try {
      if (!productInForm) return;

      console.log("Saving product with data:", productInForm);

      // Prepare product data
      const updatedProductData = {
        name: productInForm.name,
        description: productInForm.description,
        price: productInForm.price,
        isAvailable: productInForm.isAvailable,
        productTypeId: productInForm.productTypeId > 0 ? productInForm.productTypeId : null,
        productBrandId: productInForm.productBrandId > 0 ? productInForm.productBrandId : null,
      };

      // Add image file if selected
      if (productInForm.imageFile) {
        console.log("Including image file in update:", productInForm.imageFile.name);
        updatedProductData.imageFile = productInForm.imageFile;
      }

      let response;
      if (isEditMode) {
        console.log("Updating product with ID:", productInForm.id);
        response = await updateProduct(productInForm.id, updatedProductData);
        console.log("Update response:", response);
      } else {
        console.log("Creating new product");
        response = await createProduct(updatedProductData);
        console.log("Create response:", response);
      }

      // Close form and show success message
      setProductInForm(null);
      alert(isEditMode ? "Sản phẩm đã được cập nhật thành công!" : "Sản phẩm mới đã được tạo!");

      // Immediately refresh the data
      await fetchAllData();
      console.log("Data refreshed successfully after update");

    } catch (error) {
      console.error("Error saving product:", error);
      alert("Có lỗi khi lưu sản phẩm: " + error.message);
    }
  };

  const processImageUrl = (imageUrl) => {
    if (!imageUrl) return '/placeholder.png';
    if (imageUrl.startsWith('http')) return imageUrl;
    if (!imageUrl.startsWith('/')) imageUrl = '/' + imageUrl;
    return `${API_BASE_URL}${imageUrl}`;
  };




  // Đóng form
  const handleCloseForm = () => {
    setProductInForm(null);
  };

  // Xóa
  const handleDelete = async (product) => {
    if (window.confirm(`Bạn có chắc muốn xóa sản phẩm: ${product.name}?`)) {
      try {
        await deleteProduct(product.id);
        alert("Sản phẩm đã được xóa thành công.");
        fetchAllData();
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Có lỗi khi xóa sản phẩm.");
      }
    }
  };

  // Test upload function
  const testImageUpload = async () => {
    try {
      const fileInput = document.querySelector('input[type="file"]');
      if (!fileInput || !fileInput.files || !fileInput.files.length) {
        alert("Vui lòng chọn file ảnh trước!");
        return;
      }

      const formData = new FormData();
      formData.append('name', 'Test Product');
      formData.append('description', 'Test Description');
      formData.append('price', "100000");
      formData.append('isAvailable', "true");
      formData.append('productTypeId', "1");
      formData.append('productBrandId', "1");
      formData.append('image', fileInput.files[0]);

      // Make direct fetch call with correct base URL
      const response = await fetch(`${API_BASE_URL}/Product/with-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      console.log("Status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("Success:", result);
        alert("Test upload successful!");
      } else {
        const errorText = await response.text();
        console.error("Error:", errorText);
        alert(`Test failed with status ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error("Test upload failed:", error);
      alert(`Test error: ${error.message}`);
    }
  };

  // Add pagination UI component
  const Pagination = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

    // Adjust startPage if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    console.log('Rendering pagination with:', {
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      pageNumbers
    });

    if (pagination.totalPages <= 1) return null;

    return (
      <div className={styles.pagination}>
        <button
          onClick={() => handlePageChange(1)}
          disabled={pagination.currentPage === 1}
          className={styles.paginationButton}
        >
          {"<<"}
        </button>
        <button
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
          className={styles.paginationButton}
        >
          {"<"}
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className={styles.paginationButton}
            >
              1
            </button>
            {startPage > 2 && <span className={styles.paginationEllipsis}>...</span>}
          </>
        )}

        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => handlePageChange(number)}
            className={`${styles.paginationButton} ${number === pagination.currentPage ? styles.paginationActive : ''}`}
          >
            {number}
          </button>
        ))}

        {endPage < pagination.totalPages && (
          <>
            {endPage < pagination.totalPages - 1 && <span className={styles.paginationEllipsis}>...</span>}
            <button
              onClick={() => handlePageChange(pagination.totalPages)}
              className={styles.paginationButton}
            >
              {pagination.totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.totalPages}
          className={styles.paginationButton}
        >
          {">"}
        </button>
        <button
          onClick={() => handlePageChange(pagination.totalPages)}
          disabled={pagination.currentPage === pagination.totalPages}
          className={styles.paginationButton}
        >
          {">>"}
        </button>
      </div>
    );
  };

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar />
      <main className={styles.dashboardContent}>
        <h1 className={styles.title}>Quản lý sản phẩm</h1>
        <div style={{ marginBottom: "1rem" }}>
          <button onClick={handleOpenCreateForm} className={styles.createBtn}>
            <FaPlus /> Tạo sản phẩm
          </button>
        </div>

        {loading ? (
          <p>Đang tải sản phẩm...</p>
        ) : (
          <>
            <table className={styles.productTable}>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Hình ảnh</th>
                  <th>Tên</th>
                  <th>Mô tả</th>
                  <th>Giá</th>
                  <th>Thương hiệu</th>
                  <th>Loại</th>
                  <th>Còn hàng?</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr key={product.id}>
                    <td>{(pagination.currentPage - 1) * pagination.pageSize + index + 1}</td>
                    <td>
                      <img
                        src={formatProductImageUrl(product.image)}
                        alt={product.name}
                        width="60"
                        height="60"
                        className={styles.productImage}
                        loading="lazy"
                        onError={(e) => {
                          console.error('Image load error:', e.target.src);
                          e.target.onerror = null;
                          e.target.src = "../src/assets/images/aboutus.jpg";
                        }}
                      />
                    </td>
                    <td>{product.name}</td>
                    <td>{product.description}</td>
                    <td>
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(product.price)}
                    </td>
                    <td>{product.productBrandName || product.productBrandId}</td>
                    <td>{product.productTypeName || product.productTypeId}</td>
                    <td>{product.isAvailable ? "✔" : "✖"}</td>
                    <td>
                      <button
                        className={`${styles.iconButton} ${styles.editIcon}`}
                        onClick={() => handleOpenEditForm(product)}
                        title="Cập nhật"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className={`${styles.iconButton} ${styles.deleteIcon}`}
                        onClick={() => handleDelete(product)}
                        title="Xóa"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination />
            <div className={styles.paginationInfo}>
              Hiển thị {(pagination.currentPage - 1) * pagination.pageSize + 1} - {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} / {pagination.totalItems} sản phẩm
            </div>
          </>
        )}

        {/* Form (Create/Edit) */}
        {productInForm && (
          <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
              <h2>{isEditMode ? "Cập nhật sản phẩm" : "Tạo sản phẩm mới"}</h2>

              <label>Tên</label>
              <input
                type="text"
                name="name"
                value={productInForm.name}
                onChange={handleInputChange}
              />

              <label>Mô tả</label>
              <textarea
                name="description"
                rows={2}
                value={productInForm.description}
                onChange={handleInputChange}
              />

              <label>Giá</label>
              <input
                type="number"
                name="price"
                value={productInForm.price}
                onChange={handleInputChange}
              />

              {/* Properly structured image upload section */}
              <label>Hình ảnh</label>
              <div>
                <div style={{ marginBottom: "15px" }}>
                  <label
                    style={{
                      display: "inline-block",
                      padding: "8px 15px",
                      background: "#f0f0f0",
                      borderRadius: "4px",
                      cursor: "pointer",
                      border: "1px solid #ddd"
                    }}
                  >
                    Chọn file ảnh
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      id="productImageInput"
                      style={{
                        position: "absolute",
                        width: "1px",
                        height: "1px",
                        padding: 0,
                        margin: "-1px",
                        overflow: "hidden",
                        clip: "rect(0, 0, 0, 0)",
                        border: 0
                      }}
                    />
                  </label>
                </div>

                {/* Image preview */}
                {productInForm.imagePreview && (
                  <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                    <p>Ảnh đã chọn:</p>
                    <img
                      src={productInForm.imagePreview}
                      alt="Preview"
                      style={{ maxWidth: '200px', maxHeight: '200px' }}
                    />
                  </div>
                )}

                {/* Or show existing image */}
                {!productInForm.imagePreview && productInForm.image && (
                  <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                    <p>Ảnh hiện tại:</p>
                    <img
                      src={productInForm.image}
                      alt="Current"
                      style={{ maxWidth: '200px', maxHeight: '200px' }}
                    />
                  </div>
                )}
              </div>

              <label>
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={productInForm.isAvailable}
                  onChange={handleInputChange}
                />
                Còn hàng?
              </label>

              <label>Thương hiệu</label>
              <select
                name="productBrandId"
                value={productInForm.productBrandId}
                onChange={handleInputChange}
              >
                <option value={0}>-- Chọn thương hiệu --</option>
                {brandList.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>

              <label>Loại sản phẩm</label>
              <select
                name="productTypeId"
                value={productInForm.productTypeId}
                onChange={handleInputChange}
              >
                <option value={0}>-- Chọn loại --</option>
                {typeList.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>

              <div style={{ marginTop: "20px" }}>
                <button onClick={handleSave} style={{ marginRight: "10px" }}>
                  {isEditMode ? "Cập nhật" : "Tạo mới"}
                </button>
                <button onClick={handleCloseForm}>Hủy</button>
              </div>

              <button
                type="button"
                onClick={testImageUpload}
                style={{ marginTop: '10px', background: '#f0ad4e', color: 'white' }}
              >
                Test Upload
              </button>

              {/* Upload progress indicator */}
              {uploadProgress > 0 && (
                <div style={{ width: "100%", marginTop: "15px" }}>
                  <div style={{
                    height: "20px",
                    background: "#f0f0f0",
                    borderRadius: "4px",
                    overflow: "hidden",
                    position: "relative"
                  }}>
                    <div style={{
                      width: `${uploadProgress}%`,
                      height: "100%",
                      background: "#4caf50",
                      transition: "width 0.3s"
                    }}></div>
                    <div style={{
                      position: "absolute",
                      top: "0",
                      left: "0",
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#333",
                      fontSize: "12px"
                    }}>
                      {uploadProgress}% Uploaded
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalContentStyle = {
  background: "#fff",
  padding: "20px",
  borderRadius: "4px",
  minWidth: "400px",
  maxWidth: "90%",
  maxHeight: "90vh",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: "15px",
};

export default ProductManager;

