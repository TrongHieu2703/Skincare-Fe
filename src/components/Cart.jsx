import React, { useState, useEffect } from "react";
import { useDispatch } from 'react-redux';
import { addCartItemAsync } from '../store/cartSlice'; // Remove unused import

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { FaShoppingCart, FaMinus, FaPlus } from 'react-icons/fa';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import "/src/styles/Cart.css";
import { useNavigate } from "react-router-dom";

const Cart = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        const fetchCartItems = async () => {
            // Fetch cart items from the API or local storage
            // const items = await getAllCarts(); // Commenting out the unused function
            const items = []; // Placeholder for cart items
            setCartItems(items);
        };

        fetchCartItems();
    }, []);

    const [successMessage, setSuccessMessage] = useState("");

    const handleQuantity = (id, action) => {
        setCartItems(items =>
            items.map(item => {
                if (item.id === id) {
                    const newQuantity = action === 'increase'
                        ? item.quantity + 1
                        : Math.max(1, item.quantity - 1);
                    return { ...item, quantity: newQuantity };
                }
                return item;
            })
        );
    };

    const handleAddToCart = async (item) => {
        await dispatch(addCartItemAsync(item.productId, item.quantity));
        setSuccessMessage("✅ Added to cart successfully!");
        setTimeout(() => setSuccessMessage(""), 2000); // Hide after 2 seconds
    };

    return (
        <div className="cart-page">
            <div className="cart-section">
                <h2 className="member-privileges-title">FEATURED PRODUCTS🔥</h2>
                {successMessage && <div className="success-message">{successMessage}</div>}
                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    spaceBetween={10}
                    slidesPerView={4}
                    autoplay={{ delay: 5000, disableOnInteraction: false }}
                    navigation
                    pagination={{ clickable: true }}
                    className="cart-slider"
                >
                    {cartItems.map(item => (
                        <SwiperSlide key={item.id}>
                            <div className="cart-item">
                                <div className="item-image">
                                    <img src={item.image} alt={item.name} />
                                </div>
                                <div className="item-info">
                                    <h3>{item.name}</h3>
                                    <div className="item-price">
                                        {item.price.toLocaleString()}đ
                                    </div>
                                    <div className="quantity-control">
                                        <label>Quantity:</label>
                                        <div className="quantity-buttons">
                                            <button
                                                onClick={() => handleQuantity(item.id, 'decrease')}
                                                disabled={item.quantity <= 1}
                                            >
                                                <FaMinus />
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button
                                                onClick={() => handleQuantity(item.id, 'increase')}
                                            >
                                                <FaPlus />
                                            </button>
                                        </div>
                                    </div>
                                    <button className="add-cart-btn" onClick={() => handleAddToCart(item)}>
                                        <FaShoppingCart /> Add to Cart
                                    </button>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
            <h2 className="member-privileges-title">MEMBER PRIVILEGES</h2>
            <div className="member-privileges">
                <div className="banner-section">
                    <img
                        src="/src/assets/images/docquyen1.jpg"
                        alt="Giảm đến 49%"
                        className="main-banner"
                    />
                </div>
                <div className="offers-grid">
                    <div className="offer-card">
                        <div className="offer-header">
                            <img
                                src="/src/assets/images/docquyen2.webp"
                                alt="Welcome Offer"
                                className="offer-icon"
                            />
                            <h3>WELCOME OFFER</h3>
                        </div>
                        <div className="offer-content">
                            <div className="code-text">Code WELCOME to get 12% OFF</div>
                            <div className="limit-text">(Up to 200k for first order)</div>
                        </div>
                    </div>
                    <div className="offer-card">
                        <div className="offer-header">
                            <img
                                src="/src/assets/images/docquyen3.jpeg"
                                alt="Special Offer"
                                className="offer-icon"
                            />
                            <h3>SPECIAL OFFER</h3>
                        </div>
                        <div className="offer-content">
                            <div className="code-text">Code WELCOME to get 15% OFF</div>
                            <div className="limit-text">(Up to 300k for orders over 2M)</div>
                        </div>
                    </div>
                </div>
                <div className="auth-section">
                    <p className="password-note">
                        *Note: Your password must contain at least one uppercase letter and one special character: ?!@
                    </p>
                    <div className="auth-buttons">
                        <button className="auth-btn login" onClick={() => navigate("/login")}>LOGIN</button>
                        <button className="auth-btn register" onClick={() => navigate("/register")}>REGISTER</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
