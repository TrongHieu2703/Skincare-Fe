import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ProductHighlight.css";

const ProductHighlight = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetch("http://localhost:7290/api/Product?pageNumber=1&pageSize=4")
            .then((response) => response.json())
            .then((data) => setProducts(data))
            .catch((error) => console.error("Error fetching products:", error));
    }, []);

    return (
        <div className="container product-highlight">
            <h3 className="section-title">SẢN PHẨM NỔI BẬT</h3>
            <div className="row">
                {products.map((product) => (
                    <div key={product.id} className="col-md-6 d-flex product-card">
                        <img src={product.image} alt={product.name} className="product-image" />
                        <div className="product-info">
                            <h5 className="product-name">{product.name}</h5>
                            <p className="product-brand">{product.productBrandName}</p>
                            <p className="product-price">{product.price.toLocaleString()}đ</p>
                            <p className="product-description">{product.description}</p>
                            <p className={`product-stock ${product.isAvailable ? "in-stock" : "out-of-stock"}`}>
                                {product.isAvailable ? "Còn hàng" : "Hết hàng"}
                            </p>
                            <Link to={`/product/${product.id}`} className="btn btn-primary view-detail-btn">
                                Xem chi tiết
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductHighlight;
