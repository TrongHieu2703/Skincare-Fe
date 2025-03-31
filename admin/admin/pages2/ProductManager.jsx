import React, { useState, useEffect } from "react";
import styles from "./ProductManager.module.css";
import Sidebar from "./Sidebar";
import { FaEdit, FaTrash, FaPlus, FaBox, FaComment, FaStar, FaStarHalfAlt, FaSearch } from "react-icons/fa";
import axios from "axios";
import { formatProductImageUrl } from "../../../src/utils/imageUtils";
import { message, Button, Form, Input, Select, Checkbox } from "antd";
import ConfirmationModal from "/src/components/ConfirmationModal";

// Các hàm API cho Product
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProductTypes,
  getAllSkinTypes,
  getAllBranches,
  getProductsWithFilters,
  searchProducts
} from "/src/api/productApi";
import { getProductReviewsForAdmin, getProductAverageRating, getReviewsWithRating } from "/src/api/reviewApi";

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

  // Add states for reviews
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [selectedProductForReviews, setSelectedProductForReviews] = useState(null);
  const [productReviews, setProductReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Add these state variables:
  const [productRatings, setProductRatings] = useState({});
  const [loadingRatings, setLoadingRatings] = useState(false);

  // Add filter states
  const [skinTypeFilter, setSkinTypeFilter] = useState("");
  const [productTypeFilter, setProductTypeFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Loading states for filter data
  const [loadingSkinTypes, setLoadingSkinTypes] = useState(false);
  const [loadingProductTypes, setLoadingProductTypes] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);

  // Add state for delete confirmation modal
  const [deleteModal, setDeleteModal] = useState({ 
    isOpen: false, 
    productId: null, 
    productName: '' 
  });

  // Lấy danh sách product + brand + type khi mount
  useEffect(() => {
    // Skip the first render in strict mode
    if (!isMounted.current) {
      isMounted.current = true;
      fetchFilterData();
      fetchAllData(1);
      return;
    }

    // Only fetch data when page changes
    if (pagination.currentPage > 0) {
      fetchAllData(pagination.currentPage);
    }
  }, [pagination.currentPage]);

  // Add this effect to load ratings when products are loaded:
  useEffect(() => {
    if (products.length > 0) {
      fetchProductRatings();
    }
  }, [products]);

  // Add effect to refetch when filters change
  useEffect(() => {
    if (isMounted.current) {
      // Reset to page 1 when any filter changes
      setPagination(prev => ({...prev, currentPage: 1}));
      fetchAllData(1);
    }
  }, [skinTypeFilter, productTypeFilter, branchFilter, priceFilter, ratingFilter, sortOption]);

  // Add effect for debounced search
  useEffect(() => {
    if (!isMounted.current) return;
    
    const timer = setTimeout(() => {
      fetchAllData(1);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchKeyword]);

  // Fetch all filter options data
  const fetchFilterData = async () => {
    try {
      setLoadingSkinTypes(true);
      setLoadingProductTypes(true);
      setLoadingBranches(true);
      
      const [skinTypesResponse, productTypesResponse, branchesResponse] = await Promise.all([
        getAllSkinTypes(),
        getAllProductTypes(),
        getAllBranches()
      ]);
      
      setSkinTypeList(skinTypesResponse);
      setTypeList(productTypesResponse);
      setBrandList(branchesResponse);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu bộ lọc:", error);
    } finally {
      setLoadingSkinTypes(false);
      setLoadingProductTypes(false);
      setLoadingBranches(false);
    }
  };

  const fetchAllData = async (page = 1) => {
    try {
      setLoading(true);
      console.log(`Fetching data for page ${page} with filters at ${new Date().toISOString()}`);

      // If searching, use search API
      if (searchKeyword.trim()) {
        setIsSearching(true);
        const response = await searchProducts(searchKeyword.trim());
        
        if (response && response.data) {
          // Format product images
          const timestamp = new Date().getTime();
          const productArray = response.data.map(product => ({
            ...product,
            mainImage: product.image ? `${product.image}?t=${timestamp}` : product.image
          }));
          
          setProducts(productArray);
          setPagination({
            currentPage: 1,
            pageSize: productArray.length,
            totalPages: 1,
            totalItems: productArray.length
          });
        } else {
          setProducts([]);
          setPagination({
            currentPage: 1,
            pageSize: 10,
            totalPages: 0,
            totalItems: 0
          });
        }
        setLoading(false);
        return;
      }
      
      setIsSearching(false);
      
      // Create filters object for API
      const filters = {};
      if (skinTypeFilter) filters.skinTypeId = skinTypeFilter;
      if (productTypeFilter) filters.productTypeId = productTypeFilter;
      if (branchFilter) filters.branchId = branchFilter;
      
      if (priceFilter) {
        const [min, max] = priceFilter.split("-").map(Number);
        filters.minPrice = min;
        if (max) filters.maxPrice = max;
      }
      
      if (ratingFilter) {
        const [min, max] = ratingFilter.split("-").map(Number);
        filters.minRating = min;
        if (max) filters.maxRating = max;
      }
      
      // Check if there are any filters or sort options
      let response;
      if (Object.keys(filters).length > 0 || sortOption) {
        response = await getProductsWithFilters(page, pagination.pageSize, filters, sortOption);
      } else {
        // No filters, get all products
        response = await getAllProducts(page, pagination.pageSize);
      }
      
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
    } catch (error) {
      console.error("Error fetching data:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
  };

  const handleResetFilters = () => {
    setSkinTypeFilter("");
    setProductTypeFilter("");
    setBranchFilter("");
    setPriceFilter("");
    setRatingFilter("");
    setSortOption("");
    setSearchKeyword("");
    
    // Reset pagination size to default when clearing filters
    setPagination(prev => ({
      ...prev,
      currentPage: 1,
      pageSize: 10
    }));
    
    // Force a fetch with default settings
    setTimeout(() => {
      fetchAllData(1);
    }, 0);
  };

  // Add back the handlePageChange function
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

  // Update the handleDelete function to work with the confirmation modal
  const handleDelete = async (product) => {
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
  };
  
  // Add function to show delete confirmation
  const showDeleteConfirmation = (product) => {
    setDeleteModal({
      isOpen: true,
      productId: product.id,
      productName: product.name
    });
  };
  
  // Add function to close delete modal
  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      productId: null,
      productName: ''
    });
  };
  
  // Add function to handle delete confirmation
  const confirmDeleteProduct = async () => {
    const productToDelete = products.find(p => p.id === deleteModal.productId);
    if (productToDelete) {
      await handleDelete(productToDelete);
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

  // Add function to handle opening reviews modal
  const handleViewReviews = async (product) => {
    try {
      setSelectedProductForReviews(product);
      setLoadingReviews(true);
      setShowReviewsModal(true);
      
      // Use the combined endpoint
      console.log(`Fetching reviews with rating for product ${product.id}...`);
      const response = await getReviewsWithRating(product.id);
      
      if (response && response.data) {
        console.log(`Received reviews with rating for product ${product.id}:`, response.data);
        setProductReviews(response.data.reviews || []);
        
        // Update the rating for this product
        setProductRatings(prev => ({
          ...prev,
          [product.id]: response.data.averageRating || 0
        }));
      } else {
        // Fall back to the separate endpoint if needed
        console.log(`Falling back to separate reviews endpoint for product ${product.id}`);
        const reviewsResponse = await getProductReviewsForAdmin(product.id);
        setProductReviews(reviewsResponse?.data || []);
      }
    } catch (error) {
      console.error("Error fetching product reviews:", error);
      console.error(`Error status: ${error.response?.status}, message: ${error.message}`);
      setProductReviews([]);
      
      // Try to fetch just the reviews as a fallback
      try {
        const reviewsResponse = await getProductReviewsForAdmin(product.id);
        setProductReviews(reviewsResponse?.data || []);
      } catch (reviewError) {
        console.error("Error fetching reviews as fallback:", reviewError);
        setProductReviews([]);
      }
    } finally {
      setLoadingReviews(false);
    }
  };

  // Add function to close reviews modal
  const handleCloseReviewsModal = () => {
    setShowReviewsModal(false);
    setSelectedProductForReviews(null);
    setProductReviews([]);
  };

  // Add function to format date for reviews
  const formatReviewDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Add this function to fetch ratings:
  const fetchProductRatings = async () => {
    try {
      setLoadingRatings(true);
      const ratings = {};
      
      // Fetch ratings for all products
      for (const product of products) {
        try {
          console.log(`Fetching rating for product ${product.id}...`);
          const ratingResponse = await getProductAverageRating(product.id);
          console.log(`Rating response for product ${product.id}:`, ratingResponse);
          
          if (ratingResponse && ratingResponse.data !== undefined) {
            ratings[product.id] = ratingResponse.data;
            console.log(`Set rating for product ${product.id} to ${ratingResponse.data}`);
          }
        } catch (error) {
          console.error(`Error fetching rating for product ${product.id}:`, error);
          console.error(`Error status: ${error.response?.status}, message: ${error.message}`);
          
          // Fall back to calculating average from existing reviews
          try {
            console.log(`Attempting to calculate average from reviews for product ${product.id}`);
            const reviewsResponse = await getProductReviewsForAdmin(product.id);
            
            if (reviewsResponse && reviewsResponse.data && reviewsResponse.data.length > 0) {
              const reviewsWithRating = reviewsResponse.data.filter(r => r.rating);
              
              if (reviewsWithRating.length > 0) {
                const sum = reviewsWithRating.reduce((total, review) => total + review.rating, 0);
                const avg = Math.round((sum / reviewsWithRating.length) * 10) / 10;
                ratings[product.id] = avg;
                console.log(`Calculated rating for product ${product.id} from reviews: ${avg}`);
              } else {
                ratings[product.id] = 0;
              }
            } else {
              ratings[product.id] = 0;
            }
          } catch (reviewError) {
            console.error(`Failed to calculate rating from reviews for product ${product.id}:`, reviewError);
            ratings[product.id] = 0;
          }
        }
      }
      
      setProductRatings(ratings);
    } catch (error) {
      console.error("Error fetching product ratings:", error);
    } finally {
      setLoadingRatings(false);
    }
  };

  // Add a function to render the rating stars:
  const renderRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className={styles.ratingStars}>
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} className={styles.starFilled} />
        ))}
        {hasHalfStar && <FaStarHalfAlt className={styles.starFilled} />}
        {[...Array(emptyStars)].map((_, i) => (
          <FaStar key={`empty-${i}`} className={styles.starEmpty} />
        ))}
        <span className={styles.ratingText}>{rating > 0 ? rating.toFixed(1) : 'Chưa có'}</span>
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
        
        {/* Combined Search & Filter Bar */}
        <div className={styles.filterContainer}>
          {/* Filters Bar (First Row) */}
          <div className={styles.filterBar}>
            {/* Skin Type Filter */}
            <select value={skinTypeFilter} onChange={handleFilterChange(setSkinTypeFilter)} className={styles.filterSelect}>
              <option value="">Tất cả loại da</option>
              {loadingSkinTypes ? (
                <option disabled>Đang tải...</option>
              ) : (
                skinTypeList.map(skinType => (
                  <option key={skinType.id} value={skinType.id}>
                    {skinType.name}
                  </option>
                ))
              )}
            </select>

            {/* Product Type Filter */}
            <select value={productTypeFilter} onChange={handleFilterChange(setProductTypeFilter)} className={styles.filterSelect}>
              <option value="">Tất cả loại sản phẩm</option>
              {loadingProductTypes ? (
                <option disabled>Đang tải...</option>
              ) : (
                typeList.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))
              )}
            </select>

            {/* Brand Filter */}
            <select value={branchFilter} onChange={handleFilterChange(setBranchFilter)} className={styles.filterSelect}>
              <option value="">Tất cả thương hiệu</option>
              {loadingBranches ? (
                <option disabled>Đang tải...</option>
              ) : (
                brandList.map(branch => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))
              )}
            </select>

            {/* Price Filter */}
            <select value={priceFilter} onChange={handleFilterChange(setPriceFilter)} className={styles.filterSelect}>
              <option value="">Tất cả mức giá</option>
              <option value="0-100000">Dưới 100.000đ</option>
              <option value="100000-300000">100.000đ - 300.000đ</option>
              <option value="300000-500000">300.000đ - 500.000đ</option>
              <option value="500000-1000000">500.000đ - 1.000.000đ</option>
              <option value="1000000">Trên 1.000.000đ</option>
            </select>

            {/* Rating Filter */}
            <select value={ratingFilter} onChange={handleFilterChange(setRatingFilter)} className={styles.filterSelect}>
              <option value="">Tất cả đánh giá</option>
              <option value="0-1">Đánh giá 0-1 sao</option>
              <option value="1-2">Đánh giá 1-2 sao</option>
              <option value="2-3">Đánh giá 2-3 sao</option>
              <option value="3-4">Đánh giá 3-4 sao</option>
              <option value="4-5">Đánh giá 4-5 sao</option>
            </select>

            {/* Sort Options */}
            <select value={sortOption} onChange={handleFilterChange(setSortOption)} className={styles.filterSelect}>
              <option value="">Sắp xếp</option>
              <option value="price_asc">Giá: Thấp đến cao</option>
              <option value="price_desc">Giá: Cao đến thấp</option>
              <option value="name_asc">Tên: A-Z</option>
              <option value="name_desc">Tên: Z-A</option>
              <option value="rating_asc">Đánh giá: Thấp đến cao</option>
              <option value="rating_desc">Đánh giá: Cao đến thấp</option>
            </select>
          </div>

          {/* Search Bar (Second Row) */}
          <div className={styles.searchBarRow}>
            {/* Search Input with icon */}
            <div className={styles.searchInputWrapper}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => {
                  setSearchKeyword(e.target.value);
                }}
                placeholder="Tìm kiếm sản phẩm..."
                className={styles.searchInput}
              />
            </div>

            {/* Reset Filters */}
            <button className={styles.resetFilterBtn} onClick={handleResetFilters}>
              Xóa bộ lọc
            </button>
          </div>
        </div>
        
        <div className={styles.actionsRow}>
          <div className={styles.filterInfo}>
            {isSearching && searchKeyword ? (
              <span>Kết quả tìm kiếm cho: "{searchKeyword}" ({products.length} sản phẩm)</span>
            ) : (Object.keys(pagination).length > 0 ? (
              <span>Hiển thị {(pagination.currentPage - 1) * pagination.pageSize + 1} - {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} / {pagination.totalItems} sản phẩm</span>
            ) : null)}
          </div>
          <div className={styles.actions}>
            <button className={styles.addButton} onClick={handleOpenCreateForm}>
              <FaPlus /> Thêm sản phẩm mới
            </button>
          </div>
        </div>

        {loading ? (
          <p>Đang tải sản phẩm...</p>
        ) : products.length === 0 ? (
          <div className={styles.noProducts}>
            <p>Không tìm thấy sản phẩm phù hợp</p>
          </div>
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
                    <th>Đánh giá</th>
                    <th>Thương hiệu</th>
                    <th>Loại</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr key={product.id}>
                      <td>{isSearching ? index + 1 : (pagination.currentPage - 1) * pagination.pageSize + index + 1}</td>
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
                      <td>
                        {renderRatingStars(productRatings[product.id] || 0)}
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
                            className={styles.reviewButton}
                            onClick={() => handleViewReviews(product)}
                            title="Xem đánh giá"
                          >
                            <FaComment />
                          </button>
                          <button
                            className={styles.deleteButton}
                            onClick={() => showDeleteConfirmation(product)}
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
            {!isSearching && <Pagination />}
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
                    onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
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

        {/* Reviews Modal */}
        {showReviewsModal && selectedProductForReviews && (
          <div className={styles.modalOverlay} onClick={(e) => {
            if (e.target.className === styles.modalOverlay) {
              handleCloseReviewsModal();
            }
          }}>
            <div className={`${styles.modalContent} ${styles.reviewModal}`}>
              <h2 className={styles.modalTitle}>
                Đánh giá cho sản phẩm: {selectedProductForReviews.name}
              </h2>
              
              {loadingReviews ? (
                <div className={styles.loadingReviews}>
                  <p>Đang tải đánh giá...</p>
                </div>
              ) : productReviews.length === 0 ? (
                <div className={styles.noReviews}>
                  <p>Chưa có đánh giá nào cho sản phẩm này</p>
                </div>
              ) : (
                <div className={styles.reviewsContainer}>
                  {productReviews.map((review) => (
                    <div key={review.id} className={styles.reviewItem}>
                      <div className={styles.reviewHeader}>
                        <div className={styles.reviewUser}>
                          <strong>{review.customerName || 'Khách hàng'}</strong>
                        </div>
                        <div className={styles.reviewDate}>
                          {formatReviewDate(review.createdAt)}
                        </div>
                      </div>
                      
                      <div className={styles.reviewRating}>
                        {Array.from({ length: 5 }).map((_, index) => (
                          <FaStar 
                            key={index} 
                            className={index < review.rating ? styles.starFilled : styles.starEmpty} 
                          />
                        ))}
                      </div>
                      
                      <div className={styles.reviewComment}>
                        {review.comment}
                      </div>
                      
                      <div className={styles.reviewOrderInfo}>
                        <small>Mã đơn hàng: #{review.orderId || 'N/A'}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className={styles.modalFooter}>
                <button 
                  className={styles.closeButton}
                  onClick={handleCloseReviewsModal}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Add delete confirmation modal */}
        <ConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={confirmDeleteProduct}
          title="Xác nhận xóa sản phẩm"
          message="Bạn có chắc chắn muốn xóa"
          itemName={deleteModal.productName}
          itemType="sản phẩm"
        />
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

