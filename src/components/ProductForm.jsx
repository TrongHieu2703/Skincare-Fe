import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductById, createProductWithImage, updateProductWithImage } from "../api/productApi";
import { FiUpload, FiLoader } from "react-icons/fi";
import "../styles/ProductForm.css";

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    isAvailable: true,
    productTypeId: "",
    productBrandId: ""
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Fetch product types and brands (you would implement this)
  const [productTypes, setProductTypes] = useState([
    { id: 1, name: "Chăm Sóc Da Mặt" },
    { id: 2, name: "Chăm Sóc Cơ Thể" },
    { id: 3, name: "Chăm Sóc Tóc" },
    { id: 4, name: "Mỹ Phẩm Trang Điểm" }
  ]);
  
  const [productBrands, setProductBrands] = useState([
    { id: 1, name: "L'Oréal" },
    { id: 2, name: "Vichy" },
    { id: 3, name: "Cetaphil" },
    { id: 4, name: "La Roche-Posay" }
  ]);

  // Load product data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchProduct = async () => {
        try {
          setLoading(true);
          const response = await getProductById(id);
          const productData = response.data;
          
          setFormData({
            name: productData.name || "",
            description: productData.description || "",
            price: productData.price || "",
            isAvailable: productData.isAvailable !== undefined ? productData.isAvailable : true,
            productTypeId: productData.productTypeId || "",
            productBrandId: productData.productBrandId || ""
          });
          
          if (productData.image) {
            setImagePreview(productData.image);
          }
          
          setError(null);
        } catch (err) {
          console.error("Failed to load product data:", err);
          setError("Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.");
        } finally {
          setLoading(false);
        }
      };
      
      fetchProduct();
    }
  }, [id, isEditMode]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError("Chỉ chấp nhận file ảnh định dạng JPG, PNG hoặc GIF");
      return;
    }
    
    // Check file size (8MB max)
    if (file.size > 8 * 1024 * 1024) {
      setError("Kích thước file không được vượt quá 8MB");
      return;
    }
    
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.description || !formData.price) {
      setError("Vui lòng điền đầy đủ thông tin sản phẩm");
      return;
    }
    
    if (!isEditMode && !imageFile) {
      setError("Vui lòng chọn ảnh sản phẩm");
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Convert price to number
      const productData = {
        ...formData,
        price: parseFloat(formData.price)
      };
      
      let response;
      if (isEditMode) {
        response = await updateProductWithImage(id, productData, imageFile);
      } else {
        response = await createProductWithImage(productData, imageFile);
      }
      
      console.log("Product saved:", response);
      setSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        navigate("/admin/products");
      }, 2000);
      
    } catch (err) {
      console.error("Error saving product:", err);
      setError(err.response?.data?.message || "Lỗi khi lưu sản phẩm. Vui lòng thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="product-form-loading">
        <FiLoader className="spin" />
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="product-form-container">
      <h2>{isEditMode ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h2>
      
      {error && <div className="form-error">{error}</div>}
      {success && <div className="form-success">Lưu sản phẩm thành công!</div>}
      
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-group">
          <label htmlFor="name">Tên sản phẩm*</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            placeholder="Nhập tên sản phẩm"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Mô tả*</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            placeholder="Nhập mô tả sản phẩm"
            rows={5}
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Giá*</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
              placeholder="Nhập giá sản phẩm"
              min="0"
              step="1000"
            />
          </div>
          
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleInputChange}
              />
              Còn hàng
            </label>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="productTypeId">Loại sản phẩm*</label>
            <select
              id="productTypeId"
              name="productTypeId"
              value={formData.productTypeId}
              onChange={handleInputChange}
              required
            >
              <option value="">-- Chọn loại sản phẩm --</option>
              {productTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="productBrandId">Thương hiệu*</label>
            <select
              id="productBrandId"
              name="productBrandId"
              value={formData.productBrandId}
              onChange={handleInputChange}
              required
            >
              <option value="">-- Chọn thương hiệu --</option>
              {productBrands.map(brand => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="form-group image-upload">
          <label>Ảnh sản phẩm*</label>
          
          <div className="image-upload-container">
            {imagePreview ? (
              <div className="image-preview">
                <img src={imagePreview} alt="Product preview" />
                <button 
                  type="button" 
                  className="remove-image"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="upload-placeholder">
                <FiUpload size={24} />
                <span>Chọn ảnh</span>
              </div>
            )}
            
            <input
              type="file"
              id="productImage"
              accept="image/*"
              onChange={handleImageChange}
              className={imagePreview ? "has-image" : ""}
            />
          </div>
          
          <p className="image-help">Chấp nhận file JPG, PNG, GIF. Tối đa 8MB.</p>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-btn"
            onClick={() => navigate("/admin/products")}
            disabled={submitting}
          >
            Hủy
          </button>
          
          <button 
            type="submit" 
            className="submit-btn"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <FiLoader className="spin" />
                {isEditMode ? "Đang cập nhật..." : "Đang tạo..."}
              </>
            ) : (
              isEditMode ? "Cập nhật sản phẩm" : "Tạo sản phẩm"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm; 