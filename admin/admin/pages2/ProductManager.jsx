import React, { useState, useEffect } from 'react';
import styles from '/admin/admin/pages2/Dashboard.module.css';
import { getAllProducts } from '/src/api/productApi';
import { FaEdit, FaTrash } from 'react-icons/fa'; // Import icon
import Sidebar from './Sidebar';

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await getAllProducts();
      if (Array.isArray(response.data.data)) {
        setProducts(response.data.data);
      } else {
        console.error('Unexpected API structure:', response.data);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (product) => {
    alert(`Bạn nhấn cập nhật sản phẩm: ${product.name}`);
  };

  const handleDelete = (product) => {
    alert(`Bạn nhấn xóa sản phẩm: ${product.name}`);
  };

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar />

      <main className={styles.dashboardContent}>
        <h1 className={styles.title}>Product Manager</h1>
        <p>Manage your products here!</p>

        {loading ? (
          <p>Đang tải sản phẩm...</p>
        ) : (
          <table className={styles.productTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Hình ảnh</th>
                <th>Tên</th>
                <th>Mô tả</th>
                <th>Giá</th>
                <th>Thương hiệu</th>
                <th>Loại</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>
                    <img
                      src={product.image}
                      alt={product.name}
                      width="60"
                      height="60"
                      className={styles.productImage}
                    />
                  </td>
                  <td>{product.name}</td>
                  <td>{product.description}</td>
                  <td>
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(product.price)}
                  </td>
                  <td>{product.productBrandName}</td>
                  <td>{product.productTypeName}</td>
                  <td>
                    <button
                      className={`${styles.iconButton} ${styles.editIcon}`}
                      onClick={() => handleUpdate(product)}
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
        )}
      </main>
    </div>
  );
};

export default ProductManager;
