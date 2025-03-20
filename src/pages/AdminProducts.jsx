import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllProducts, deleteProduct } from "../api/productApi";
import { FiPlus, FiEdit, FiTrash2, FiLoader, FiSearch } from "react-icons/fi";
import "../styles/AdminProducts.css";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getAllProducts(1, 100); // Get more products for admin view
      
      const productArray = Array.isArray(response)
        ? response
        : Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
            ? response.data.data
            : [];
            
      setProducts(productArray);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const confirmDelete = (product) => {
    setDeleteConfirm(product);
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const handleDelete = async (id) => {
    try {
      setDeleting(true);
      await deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to delete product:", err);
      alert("Xóa sản phẩm thất bại. Vui lòng thử lại sau.");
    } finally {
      setDeleting(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <FiLoader className="spin" />
        <p>Đang tải danh sách sản phẩm...</p>
      </div>
    );
  }

  return (
    <div className="admin-products-container">
      <div className="admin-header">
        <h1>Quản lý sản phẩm</h1>
        <button 
          className="add-product-btn" 
          onClick={() => navigate("/admin/products/new")}
        >
          <FiPlus />
          Thêm sản phẩm
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="search-bar">
        <FiSearch />
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      <div className="product-table-container">
        <table className="product-table">
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Giá</th>
              <th>Loại</th>
              <th>Thương hiệu</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <tr key={product.id}>
                  <td className="product-image">
                    <img 
                      src={product.image || "/placeholder-product.png"} 
                      alt={product.name}
                    />
                  </td>
                  <td>{product.name}</td>
                  <td>{formatPrice(product.price)}</td>
                  <td>{product.productTypeName || "-"}</td>
                  <td>{product.productBrandName || "-"}</td>
                  <td>
                    <span className={`status-badge ${product.isAvailable ? 'available' : 'unavailable'}`}>
                      {product.isAvailable ? "Còn hàng" : "Hết hàng"}
                    </span>
                  </td>
                  <td className="actions">
                    <button 
                      className="edit-btn"
                      onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                      title="Chỉnh sửa"
                    >
                      <FiEdit />
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => confirmDelete(product)}
                      title="Xóa"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-products">
                  {searchTerm ? "Không tìm thấy sản phẩm nào" : "Chưa có sản phẩm nào"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {deleteConfirm && (
        <div className="delete-modal">
          <div className="delete-modal-content">
            <h3>Xác nhận xóa sản phẩm</h3>
            <p>Bạn có chắc chắn muốn xóa sản phẩm <strong>{deleteConfirm.name}</strong>?</p>
            <p className="warning">Hành động này không thể hoàn tác!</p>
            
            <div className="delete-modal-actions">
              <button 
                className="cancel-delete-btn"
                onClick={cancelDelete}
                disabled={deleting}
              >
                Hủy
              </button>
              <button 
                className="confirm-delete-btn"
                onClick={() => handleDelete(deleteConfirm.id)}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <FiLoader className="spin" />
                    Đang xóa...
                  </>
                ) : "Xác nhận xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts; 