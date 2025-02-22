import React, { useState } from "react";
import "./styles/Cart.css";
import { FaShoppingCart, FaMinus, FaPlus, FaTimes } from 'react-icons/fa';

const Cart = () => {
    const [notification, setNotification] = useState(false);
    const [cartItems, setCartItems] = useState([
        {
            id: 1,
            name: "Product 1",
            price: 450000,
            image: "/src/images/sanpham1.jpg",
            quantity: 1
        },
        {
            id: 2,
            name: "Product 2",
            price: 450000,
            image: "/src/images/sanpham2.jpg",
            quantity: 1
        },
        {
            id: 3,
            name: "Product 3",
            price: 450000,
            image: "/src/images/sanpham3.jpg",
            quantity: 1
        },
        {
            id: 4,
            name: "Product 4",
            price: 450000,
            image: "/src/images/sanpham4.jpg",
            quantity: 1
        },
        {
            id: 5,
            name: "Product 5",
            price: 450000,
            image: "/src/images/sanpham5.jpg",
            quantity: 1
        },
        {
            id: 6,
            name: "Product 6",
            price: 450000,
            image: "/src/images/sanpham6.jpeg",
            quantity: 1
        },
        {
            id: 7,
            name: "Product 7",
            price: 450000,
            image: "/src/images/sanpham7.jpg",
            quantity: 1
        },
        {
            id: 8,
            name: "Product 8",
            price: 450000,
            image: "/src/images/sanpham8.jpg",
            quantity: 1
        },
    ]);

    const handleQuantity = (id, action) => {
        setCartItems(items =>
            items.map(item => {
                if (item.id === id) {
                    const newQuantity = action === 'increase'
                        ? item.quantity + 1
                        : Math.max(1, item.quantity - 1);
                    return {
                        ...item,
                        quantity: newQuantity
                    };
                }
                return item;
            })
        );
    };

    const handleAddToCart = () => {
        setNotification(true);
        setTimeout(() => setNotification(false), 3000);
    };

    return (
        <div className="cart-container">
            <h2 className="cart-title">Shopping Cart</h2>

            <div className="cart-grid">
                {cartItems.map(item => (
                    <div key={item.id} className="cart-item">
                        <div className="item-image">
                            <img src={item.image} alt={item.name} />
                            <button className="remove-btn">
                                <FaTimes />
                            </button>
                        </div>

                        <div className="item-details">
                            <h3 className="item-name">{item.name}</h3>
                            <p className="item-price">{item.price}</p>

                            <div className="quantity-control">
                                <span>Quantity:</span>
                                <div className="quantity-buttons">
                                    <button
                                        className="qty-btn minus"
                                        onClick={() => handleQuantity(item.id, 'decrease')}
                                        disabled={item.quantity <= 1}
                                    >
                                        <span className="qty-symbol">−</span>
                                    </button>
                                    <span className="qty-value">{item.quantity}</span>
                                    <button
                                        className="qty-btn plus"
                                        onClick={() => handleQuantity(item.id, 'increase')}
                                    >
                                        <span className="qty-symbol">+</span>
                                    </button>
                                </div>
                            </div>

                            <button
                                className="add-to-cart-btn"
                                onClick={handleAddToCart}
                            >
                                <FaShoppingCart /> Add to Cart
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Notification */}
            <div className={`cart-notification ${notification ? 'show' : ''}`}>
                <FaShoppingCart />
                <p>Product added to cart successfully!</p>
            </div>
        </div>
    );
};

export default Cart;
