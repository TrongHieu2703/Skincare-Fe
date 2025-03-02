// src/pages/ProductDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductById } from "../api/productApi";
import { addToCart } from "../api/cartApi";
import "/src/styles/ProductDetails.css";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    getProductById(id)
      .then((res) => setProduct(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, quantity);
      alert("✅ Added to cart successfully!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("❌ Failed to add to cart!");
    }
  };

  if (!product) return <div>Loading...</div>;

  return (
    <div className="product-details-container">
      <div className="product-details-main">
        <div className="product-images">
          <div className="thumbnail-list">
            {product.images?.map((img, idx) => (
              <img key={idx} src={img} alt={`Thumbnail ${idx}`} className="thumbnail" />
            ))}
          </div>
          <div className="main-image">
            <img src={product.mainImage || "https://via.placeholder.com/300"} alt={product.name} />
          </div>
        </div>

        <div className="product-info">
          <h1>{product.name}</h1>
          <p>
            <strong>Brand:</strong> {product.brand}
          </p>
          <p>
            <strong>Availability:</strong>{" "}
            {product.stock > 0 ? `only in ${product.stock} stocks` : "Out of stock"}
          </p>
          <p className="product-price">${product.price}</p>
          <div className="product-rating">
            {"★".repeat(product.rating)}
            {"☆".repeat(5 - product.rating)}
          </div>
          <div style={{ margin: "10px 0" }}>
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
            <span style={{ margin: "0 10px" }}>{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)}>+</button>
          </div>
          <button className="add-to-cart" onClick={handleAddToCart}>
            Add to Cart
          </button>
        </div>
      </div>

      <div className="product-tabs">
        <div className="tabs">
          <button className="tab active">Description</button>
          <button className="tab">Specification</button>
          <button className="tab">Reviews</button>
        </div>

        <div className="tab-content">
          <h3>Ưu thế nổi bật:</h3>
          <ul>
            {product.features?.map((feature, idx) => (
              <li key={idx}>{feature}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
