import React, { useState, useEffect } from "react";
import styles from "./ProductManager.module.css";
import Sidebar from "./Sidebar";
import { FaEdit, FaTrash, FaPlus, FaBox } from "react-icons/fa";
import axios from "axios";
import { formatProductImageUrl } from "../../../src/utils/imageUtils";
import { message, Button, Form, Input, Select, Checkbox } from "antd";

// Các hàm API cho Product
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProductTypes,
  getAllSkinTypes
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
  const [skinTypeList, setSkinTypeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    totalItems: 0
  });

  // Add submitting state to track form submission
  const [submitting, setSubmitting] = useState(false);

  // Add showForm state to control form visibility
  const [showForm, setShowForm] = useState(false);
  // Add editMode state to track if we're editing an existing product
  const [editMode, setEditMode] = useState(false);

  // Add success notification state
  const [successMessage, setSuccessMessage] = useState("");
  const [showNotification, setShowNotification] = useState(false);

  // productInForm: state cho form (dùng chung cho cả create & edit)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    productTypeId: "",
    productBrandId: "",
    skinTypeIds: [],
    quantity: "",
    stock: "",
    branchId: "",
    isAvailable: true,
    image: null,
    imageFile: null
  });

  // Track selected skin types
  const [selectedSkinTypes, setSelectedSkinTypes] = useState([]);

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
      console.log(`Fetching data for page ${page} at ${new Date().toISOString()}`);

      // Fetch products with pagination
      const response = await getAllProducts(page);

      if (!response) {
        console.log('Request was debounced, waiting...');
        // Try again after debounce period
        setTimeout(() => fetchAllData(page), 400);
        return;
      }

      const { products: productData, pagination: paginationData } = response;
      console.log(`Received ${productData?.length || 0} products from API`);

      // Update products with timestamp for images
      const timestamp = new Date().getTime();
      const productArray = productData.map(product => {
        console.log(`Product ${product.id}: ${product.name}, Stock: ${product.stock}, Available: ${product.isAvailable}`);
        return {
          ...product,
          mainImage: product.image ? `${product.image}?t=${timestamp}` : product.image
        };
      });

      setProducts(productArray);

      // Only update pagination if the data is different
      if (JSON.stringify(paginationData) !== JSON.stringify(pagination)) {
        setPagination(paginationData);
      }

      // Fetch data only on first load or if lists are empty
      if (page === 1 || typeList.length === 0 || skinTypeList.length === 0) {
        try {
          // Use the real APIs to fetch product types and skin types
          const [types, skinTypes] = await Promise.all([
            getAllProductTypes(),
            getAllSkinTypes()
          ]);

          console.log("Fetched skin types:", skinTypes);
          setTypeList(types);
          setSkinTypeList(skinTypes);

          // For now, keep the mock brand data
          setBrandList([
            { id: 1, name: "Brand A" },
            { id: 2, name: "Brand B" },
          ]);
        } catch (skinTypeError) {
          console.error("Error fetching skin types:", skinTypeError);
          // Set default skin types if API call fails
          setSkinTypeList([
            { id: 1, name: "Da khô" },
            { id: 2, name: "Da dầu" },
            { id: 3, name: "Da nhạy cảm" },
            { id: 4, name: "Da hỗn hợp" }
          ]);
        }
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
    setFormData({
      id: null,
      name: "",
      description: "",
      price: 0,
      isAvailable: true,
      productTypeId: 0,
      productBrandId: 0,
      imageFile: null,
      quantity: 0,
      stock: 0,
      branchId: 1, // Default branch ID
      skinTypeIds: [] // Initialize empty array for skin type IDs
    });
    setSelectedSkinTypes([]);
    setEditMode(false);
    setShowForm(true);
  };

  // Mở form edit
  const handleOpenEditForm = (product) => {
    console.log("Opening edit form with product data:", product);

    // Convert skinTypeIds to numbers if they're strings
    let skinIds = [];
    if (product.skinTypeIds && Array.isArray(product.skinTypeIds)) {
      skinIds = product.skinTypeIds.map(id => typeof id === 'string' ? parseInt(id, 10) : id);
    }

    // Ensure stock and quantity are initialized correctly even when they're 0
    const stock = product.stock !== undefined && product.stock !== null ? product.stock : 0;
    const quantity = product.quantity !== undefined && product.quantity !== null ? product.quantity : 0;

    setFormData({
      id: product.id,
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      productTypeId: product.productTypeId || "",
      productBrandId: product.productBrandId || "",
      skinTypeIds: skinIds,
      quantity: quantity,
      stock: stock,
      branchId: product.branchId || "",
      isAvailable: product.isAvailable !== undefined ? product.isAvailable : true,
      image: product.image || "",
      imageUrl: formatProductImageUrl(product.image) || ""
    });

    console.log(`Edit form data initialized with - Stock: ${stock}, Quantity: ${quantity}, isAvailable: ${product.isAvailable}`);

    setEditMode(true);
    setShowForm(true);
  };

  // Xử lý khi thay đổi input
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // For checkboxes
    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: checked
      });
      return;
    }

    // Handle stock field specially to update isAvailable
    if (name === "stock") {
      const stockValue = parseInt(value, 10) || 0;
      const numericValue = value.replace(/[^\d.]/g, "");

      setFormData({
        ...formData,
        [name]: numericValue,
        // Automatically update isAvailable based on stock value
        // If stock becomes positive, set isAvailable to true
        // If stock becomes zero or negative, keep the current value or false
        isAvailable: stockValue > 0 ? true : false
      });
      return;
    }

    // For price field and other numeric fields - convert to number
    if (name === "price" || name === "quantity") {
      const numericValue = value.replace(/[^\d.]/g, "");
      setFormData({
        ...formData,
        [name]: numericValue
      });
      return;
    }

    // Handle skin type IDs
    if (name === "skinTypeIds") {
      if (checked) {
        // Add to selected skin types
        setFormData({
          ...formData,
          skinTypeIds: [...formData.skinTypeIds, Number(value)]
        });
      } else {
        // Remove from selected skin types
        setFormData({
          ...formData,
          skinTypeIds: formData.skinTypeIds.filter(id => id !== Number(value))
        });
      }
      return;
    }

    // For other fields
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle skin type selection/deselection
  const handleSkinTypeChange = (skinTypeId, isChecked) => {
    const currentSkinTypeIds = [...formData.skinTypeIds];

    if (isChecked) {
      // Add the skin type ID if it's not already in the array
      if (!currentSkinTypeIds.includes(skinTypeId)) {
        currentSkinTypeIds.push(skinTypeId);
      }
    } else {
      // Remove the skin type ID
      const index = currentSkinTypeIds.indexOf(skinTypeId);
      if (index !== -1) {
        currentSkinTypeIds.splice(index, 1);
      }
    }

    setFormData({
      ...formData,
      skinTypeIds: currentSkinTypeIds
    });
  };

  // Update the handleFileChange function to include image preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file); // Create a preview URL
      setFormData((prev) => ({
        ...prev,
        imageFile: file, // Store the selected file
        imagePreview: imageUrl // Store the preview URL
      }));
    }
  };

  // Function to show success notification
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setShowNotification(true);
    // Auto hide after 3 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const handleSave = async () => {
    try {
      // Validation
      if (!formData.name.trim()) {
        alert("Tên sản phẩm là bắt buộc!");
        return;
      }

      if (!formData.price || formData.price <= 0) {
        alert("Giá phải lớn hơn 0!");
        return;
      }

      // Required fields for new products
      if (!editMode && !formData.imageFile) {
        alert("Vui lòng chọn hình ảnh cho sản phẩm mới!");
        return;
      }

      // Ensure quantity and stock are parsed as integers
      const quantity = formData.quantity ? parseInt(formData.quantity, 10) : 0;
      const stock = formData.stock ? parseInt(formData.stock, 10) : 0;

      // Validate that stock cannot be greater than quantity
      if (stock > quantity) {
        alert("Số lượng tồn kho (Stock) không thể lớn hơn số lượng sản phẩm (Quantity)!");
        return;
      }

      setSubmitting(true);

      // Prepare data for API
      let productData;

      // Automatically set isAvailable to false if stock is 0
      const isAvailable = stock > 0 ? formData.isAvailable : false;

      if (editMode) {
        // For update, prepare a plain object with the correctly typed values
        productData = {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          productBrandId: parseInt(formData.productBrandId, 10),
          productTypeId: parseInt(formData.productTypeId, 10),
          isAvailable: isAvailable,
          image: formData.image, // Current image URL
          imageFile: formData.imageFile, // New image file if any
          quantity: quantity,
          stock: stock,
          branchId: formData.branchId ? parseInt(formData.branchId, 10) : null,
          skinTypeIds: formData.skinTypeIds.map(id => parseInt(id, 10)),
          id: formData.id // Include the ID
        };
      } else {
        // For create, use FormData
        productData = new FormData();

        // Append normal fields
        productData.append("Name", formData.name);
        productData.append("Description", formData.description);
        productData.append("Price", formData.price);
        productData.append("ProductBrandId", formData.productBrandId);
        productData.append("ProductTypeId", formData.productTypeId);
        productData.append("IsAvailable", isAvailable);

        // Append quantity and stock fields
        productData.append("Quantity", quantity);
        productData.append("Stock", stock);
        if (formData.branchId) productData.append("BranchId", formData.branchId);

        // Append all selected skin type IDs
        formData.skinTypeIds.forEach(id => {
          productData.append("SkinTypeIds", id);
        });

        // Append image file if selected
        if (formData.imageFile) {
          productData.append("Image", formData.imageFile);
        }
      }

      console.log('Saving product data:', productData);

      let response;

      if (editMode) {
        // Update existing product
        response = await updateProduct(formData.id, productData);
        if (response) {
          // Show success notification
          showSuccess("Cập nhật sản phẩm thành công!");

          // Force reload data after a short delay to allow backend to process
          setTimeout(() => {
            fetchAllData(pagination.currentPage);
          }, 500);
        }
      } else {
        // Create new product
        response = await createProduct(productData);
        if (response) {
          // Show success notification
          showSuccess("Tạo sản phẩm mới thành công!");

          // Load first page after creating new product
          setTimeout(() => {
            fetchAllData(1);
          }, 500);
        }
      }

      // Close form after successful save
      if (response) {
        setShowForm(false);
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert(`Lỗi: ${error.message || "Không thể lưu sản phẩm"}`);
    } finally {
      setSubmitting(false);
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
    // Reset all form state
    setFormData({
      name: "",
      description: "",
      price: "",
      productTypeId: "",
      productBrandId: "",
      skinTypeIds: [],
      quantity: "",
      stock: "",
      branchId: "",
      isAvailable: true,
      image: null,
      imageFile: null
    });
    setSelectedSkinTypes([]);
    setShowForm(false);
    setEditMode(false);
  };

  // Xóa
  const handleDelete = async (product) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`)) {
      try {
        setLoading(true);
        await deleteProduct(product.id);
        // Show success notification
        showSuccess("Đã xóa sản phẩm thành công!");
        // Refetch the current page data
        fetchAllData(pagination.currentPage);
      } catch (error) {
        console.error("Error deleting product:", error);
        alert(`Lỗi: ${error.message || "Không thể xóa sản phẩm"}`);
      } finally {
        setLoading(false);
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
    const maxVisiblePages = window.innerWidth < 768 ? 3 : 5; // Fewer pages on smaller screens
    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

    // Adjust startPage if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

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
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <h1>Quản lý sản phẩm</h1>

        {/* Success notification banner */}
        {showNotification && (
          <div className={styles.successNotification}>
            <span>{successMessage}</span>
            <button onClick={() => setShowNotification(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '16px' }}>×</button>
          </div>
        )}

        <div className={styles.actions}>
          <button className={styles.addButton} onClick={handleOpenCreateForm}>
            <FaPlus /> Thêm sản phẩm mới
          </button>
        </div>

        {loading ? (
          <p>Đang tải sản phẩm...</p>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.productTable}>
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Ảnh</th>
                    <th>Tên SP</th>
                    <th>Mô tả</th>
                    <th>Giá</th>
                    <th>SL</th>
                    <th>Tồn</th>
                    <th>Thương hiệu</th>
                    <th>Loại</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
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
                          className={styles.productImage}
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "../src/assets/images/aboutus.jpg";
                          }}
                        />
                      </td>
                      <td>
                        <span className={styles.truncate} title={product.name}>{product.name}</span>
                      </td>
                      <td>
                        <span className={styles.description} title={product.description}>{product.description}</span>
                      </td>
                      <td>
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(product.price)}
                      </td>
                      <td>{product.quantity || 0}</td>
                      <td>
                        <div className={`${styles.stockCell} ${product.stock <= 0 ? styles.outOfStock : ''}`}>
                          {product.stock <= 0 ? (
                            <span title="Hết hàng">0 ⚠️</span>
                          ) : (
                            product.stock
                          )}
                        </div>
                      </td>
                      <td>{product.productBrandName || product.productBrandId}</td>
                      <td>{product.productTypeName || product.productTypeId}</td>
                      <td>
                        {product.isAvailable ? (
                          <span className={styles.availableStatus}>✔</span>
                        ) : (
                          <span
                            className={styles.unavailableStatus}
                            title={product.stock <= 0 ? "Sản phẩm không có sẵn vì hết hàng" : "Sản phẩm không có sẵn"}
                          >
                            ✖
                          </span>
                        )}
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button
                            className={styles.editButton}
                            onClick={() => handleOpenEditForm(product)}
                            title="Cập nhật"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className={styles.deleteButton}
                            onClick={() => handleDelete(product)}
                            title="Xóa"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination />
            <div className={styles.paginationInfo}>
              Hiển thị {(pagination.currentPage - 1) * pagination.pageSize + 1} - {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} / {pagination.totalItems} sản phẩm
            </div>
          </>
        )}

        {/* Form (Create/Edit) */}
        {showForm && (
          <div className={styles.modalOverlay} onClick={(e) => {
            if (e.target.className === styles.modalOverlay) {
              handleCloseForm();
            }
          }}>
            <div className={styles.modalContent}>
              <h2 className={styles.modalTitle}>{editMode ? "Cập nhật sản phẩm" : "Tạo sản phẩm mới"}</h2>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Tên</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={styles.textInput}
                  placeholder="Nhập tên sản phẩm"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Mô tả</label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className={styles.textInput}
                  placeholder="Nhập mô tả sản phẩm"
                  required
                  style={{ resize: "vertical", minHeight: "100px" }}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Giá</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={styles.textInput}
                  placeholder="Nhập giá sản phẩm"
                  min="0"
                  required
                />
              </div>

              {/* Inventory Information */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Số lượng</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className={styles.textInput}
                  placeholder="Nhập số lượng tồn kho"
                  min="0"
                />
              </div>

              {/* Stock input with warning for zero stock */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Tồn kho</label>
                <div className={styles.inputWithWarning}>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className={`${styles.textInput} ${parseInt(formData.stock, 10) <= 0 ? styles.zeroStockInput : ''}`}
                    placeholder="Nhập số lượng tồn kho"
                    min="0"
                  />
                  {parseInt(formData.stock, 10) <= 0 && (
                    <div className={styles.stockWarning}>
                      <span>⚠️ Hết hàng - Sản phẩm sẽ được đánh dấu là không có sẵn</span>
                    </div>
                  )}
                  {parseInt(formData.stock, 10) > 0 &&
                    parseInt(formData.stock, 10) > parseInt(formData.quantity || 0, 10) && (
                      <div className={styles.stockError}>
                        <span>⚠️ Số lượng tồn kho không thể vượt quá tổng số lượng</span>
                      </div>
                    )}
                </div>
              </div>

              {/* Checkbox for availability status */}
              <div className={styles.formGroup} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div className={styles.availabilityContainer}>
                  <input
                    type="checkbox"
                    id="isAvailable"
                    name="isAvailable"
                    checked={parseInt(formData.stock, 10) > 0 ? formData.isAvailable : false}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    style={{ width: "auto", margin: 0 }}
                    disabled={parseInt(formData.stock, 10) <= 0}
                  />
                  <label htmlFor="isAvailable" style={{ margin: 0 }}>
                    Còn hàng?
                    {parseInt(formData.stock, 10) <= 0 ? (
                      <span style={{ marginLeft: '8px', color: '#ff4d4f', fontSize: '12px' }}>
                        (Tự động đặt là hết hàng khi stock = 0)
                      </span>
                    ) : (
                      <span style={{ marginLeft: '8px', color: '#52c41a', fontSize: '12px' }}>
                        (Tự động đặt là còn hàng khi stock {'>'} 0)
                      </span>
                    )}
                  </label>
                </div>
              </div>

              {/* Improved image upload section */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Hình ảnh {!editMode && <span style={{ color: "red" }}>*</span>}</label>
                <div className={styles.imageInputContainer}>
                  <div className={styles.fileUploadContainer}>
                    <label className={styles.fileInputLabel}>
                      <span className={styles.uploadIcon}>📷</span>
                      Chọn file ảnh
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className={styles.hiddenFileInput}
                        required={!editMode}
                      />
                    </label>
                    {formData.imageFile && (
                      <span style={{ marginLeft: "10px", fontSize: "14px", color: "#666" }}>
                        Đã chọn: {formData.imageFile.name}
                      </span>
                    )}
                  </div>

                  {/* Image preview section with consistent styling */}
                  {(formData.imagePreview || formData.image) && (
                    <div className={styles.imagePreviewContainer}>
                      <div className={styles.previewBox}>
                        <p className={styles.previewLabel}>
                          {formData.imagePreview ? "Ảnh đã chọn:" : "Ảnh hiện tại:"}
                        </p>
                        <img
                          src={formData.imagePreview || formatProductImageUrl(formData.image)}
                          alt="Product preview"
                          className={styles.previewImage}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Thương hiệu</label>
                <select
                  name="productBrandId"
                  value={formData.productBrandId}
                  onChange={handleInputChange}
                  className={styles.textInput}
                >
                  <option value={0}>-- Chọn thương hiệu --</option>
                  {brandList.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Loại sản phẩm</label>
                <select
                  name="productTypeId"
                  value={formData.productTypeId}
                  onChange={handleInputChange}
                  className={styles.textInput}
                >
                  <option value={0}>-- Chọn loại --</option>
                  {typeList.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Skin Types Section */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Loại da phù hợp</label>
                <div className={styles.checkboxGroup}>
                  {skinTypeList && skinTypeList.length > 0 ? (
                    skinTypeList.map((skinType) => (
                      <div key={skinType.id} className={styles.checkboxItem}>
                        <input
                          type="checkbox"
                          id={`skinType-${skinType.id}`}
                          checked={formData.skinTypeIds.includes(skinType.id)}
                          onChange={(e) => handleSkinTypeChange(skinType.id, e.target.checked)}
                          className={styles.checkbox}
                        />
                        <label htmlFor={`skinType-${skinType.id}`}>{skinType.name}</label>
                      </div>
                    ))
                  ) : (
                    <div>Loading skin types...</div>
                  )}
                </div>
              </div>

              {/* Upload progress indicator with improved styling */}
              {uploadProgress > 0 && (
                <div className={styles.progressContainer}>
                  <div
                    className={styles.progressBar}
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                  <div className={styles.progressText}>
                    {uploadProgress}% Uploaded
                  </div>
                </div>
              )}

              <div className={styles.modalFooter}>
                <button
                  className={styles.cancelButton}
                  onClick={handleCloseForm}
                  type="button"
                >
                  Hủy
                </button>
                <button
                  className={`${styles.saveButton} ${submitting ? styles.loading : ''}`}
                  onClick={handleSave}
                  disabled={submitting}
                  type="button"
                >
                  {editMode ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
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

