import React, { useEffect, useState } from 'react';
import { getAllProducts } from '../api/productApi';
import { Link } from 'react-router-dom';
import '/src/styles/ProductList.css'; 

const ProductList = () => {
    const [products, setProducts] = useState([]);
  
    useEffect(() => {
      getAllProducts(1, 20)
        .then((res) => setProducts(res.data))
        .catch((err) => console.error(err));
    }, []);
  
    return (
      <div className="product-list-container">
        <h1 className="product-list-title">Danh sách sản phẩm</h1>
        <div className="product-grid-layout">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <img
                src={product.imageUrl || 'https://via.placeholder.com/150'}
                alt={product.name}
                className="product-image"
              />
              <div className="product-details">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-price">Giá: ${product.price}</p>
                <Link to={`/product/${product.id}`} className="product-link">
                  Xem chi tiết
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default ProductList;
