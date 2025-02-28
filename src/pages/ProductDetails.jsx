import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProductById } from '../api/productApi';

import '/src/styles/ProductDetails.css';


const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    getProductById(id)
      .then((res) => setProduct(res.data))
      .catch((err) => console.error(err));
  }, [id]);

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
            <img src={product.mainImage || 'https://via.placeholder.com/300'} alt={product.name} />
          </div>
        </div>

        <div className="product-info">
          <h1>{product.name}</h1>
          <p><strong>Brand:</strong> {product.brand}</p>
          <p><strong>Availability:</strong> {product.stock > 0 ? `only in ${product.stock} stocks` : 'Out of stock'}</p>
          <p className="product-price">${product.price}</p>
          <div className="product-rating">
            {'★'.repeat(product.rating)}{'☆'.repeat(5 - product.rating)}
          </div>
          <button className="add-to-cart">Add to Cart</button>
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
