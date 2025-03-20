import React, { useState, useEffect } from 'react';
import './StaffProduct.css';
import { getAllProducts } from '/src/api/productApi';
import StaffSidebar from './StaffSidebar';

const StaffProduct = () => {
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

    const handleEdit = (productId) => {
        // Implement edit functionality
        console.log('Edit product:', productId);
    };

    const handleDelete = (productId) => {
        // Implement delete functionality
        console.log('Delete product:', productId);
    };

    const handleAddProduct = () => {
        // Implement add product functionality
        console.log('Add new product');
    };

    return (
        <div className="dashboard-container">
            <StaffSidebar />

            <main className="dashboard-content">
                <div className="product-header">
                    <h1 className="title">Quản lý sản phẩm</h1>
                    <button className="add-product-btn" onClick={handleAddProduct}>
                        Thêm sản phẩm mới
                    </button>
                </div>

                {loading ? (
                    <p>Đang tải sản phẩm...</p>
                ) : (
                    <table className="product-table">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Hình ảnh</th>
                                <th>Tên</th>
                                <th>Mô tả</th>
                                <th>Giá</th>
                                <th>Thương hiệu</th>
                                <th>Loại</th>
                                <th>Thao tác</th>
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
                                            className="product-image"
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
                                    <td className="action-buttons">
                                        <button
                                            className="edit-btn"
                                            onClick={() => handleEdit(product.id)}
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDelete(product.id)}
                                        >
                                            Xóa
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

export default StaffProduct;