import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useCart } from '../store/CartContext';
import { useAuth } from '../auth/AuthProvider';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { FaShoppingCart, FaMinus, FaPlus } from 'react-icons/fa';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import "/src/styles/Cart.css";

const Cart = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { addItemToCart, formatPrice } = useCart();
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const [addingToCart, setAddingToCart] = useState({});

    useEffect(() => {
        // Mock featured products data
        const mockFeaturedProducts = [
            {
                id: 1,
                name: "Kem Dưỡng Ẩm Avene",
                price: 450000,
                image: "/src/assets/images/product1.jpg"
            },
            {
                id: 2,
                name: "Serum Chống Lão Hóa Innisfree",
                price: 380000,
                image: "/src/assets/images/product2.jpg"
            },
            {
                id: 3,
                name: "Nước Tẩy Trang Bioderma",
                price: 290000,
                image: "/src/assets/images/product3.jpg"
            },
            {
                id: 4,
                name: "Mặt Nạ Dưỡng Ẩm The Face Shop",
                price: 120000,
                image: "/src/assets/images/product4.jpg"
            },
            {
                id: 5,
                name: "Kem Chống Nắng Anessa",
                price: 520000,
                image: "/src/assets/images/product5.jpg"
            }
        ];
        
        setFeaturedProducts(mockFeaturedProducts);
        
        // Initialize quantities
        const initialQuantities = {};
        mockFeaturedProducts.forEach(product => {
            initialQuantities[product.id] = 1;
        });
        setQuantities(initialQuantities);
    }, []);

    const handleQuantity = (id, action) => {
        setQuantities(prevQuantities => ({
            ...prevQuantities,
            [id]: action === 'increase' 
                ? prevQuantities[id] + 1 
                : Math.max(1, prevQuantities[id] - 1)
        }));
    };

    const handleAddToCart = async (item) => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/cart' } });
            return;
        }
        
        // Prevent multiple clicks
        if (addingToCart[item.id]) return;
        
        try {
            setAddingToCart(prev => ({ ...prev, [item.id]: true }));
            const response = await addItemToCart(item.id, quantities[item.id]);
            console.log("Product added to cart:", response);
            setSuccessMessage("✅ Đã thêm vào giỏ hàng thành công!");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error) {
            console.error("Error adding to cart:", error);
            if (error.response?.status === 401) {
                alert("❌ Vui lòng đăng nhập để thêm vào giỏ hàng!");
                navigate('/login', { state: { from: '/cart' } });
            } else {
                alert("❌ Thêm vào giỏ hàng thất bại! " + (error.response?.data?.message || error.message || "Vui lòng thử lại sau."));
            }
        } finally {
            setAddingToCart(prev => ({ ...prev, [item.id]: false }));
        }
    };

    return (
        <div className="cart-page">
            {successMessage && (
                <div className="success-message">
                    {successMessage}
                </div>
            )}
            
            <div className="cart-section">
                <h2 className="member-privileges-title">FEATURED PRODUCTS🔥</h2>
                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    spaceBetween={10}
                    slidesPerView={4}
                    autoplay={{ delay: 5000, disableOnInteraction: false }}
                    navigation
                    pagination={{ clickable: true }}
                    className="cart-slider"
                >
                    {featuredProducts.map(item => (
                        <SwiperSlide key={item.id}>
                            <div className="cart-item">
                                <div className="item-image">
                                    <img src={item.image} alt={item.name} />
                                </div>
                                <div className="item-info">
                                    <h3>{item.name}</h3>
                                    <div className="item-price">
                                        {formatPrice(item.price)}
                                    </div>
                                    <div className="quantity-control">
                                        <label>Quantity:</label>
                                        <div className="quantity-buttons">
                                            <button
                                                onClick={() => handleQuantity(item.id, 'decrease')}
                                                disabled={quantities[item.id] <= 1}
                                            >
                                                <FaMinus />
                                            </button>
                                            <span>{quantities[item.id]}</span>
                                            <button
                                                onClick={() => handleQuantity(item.id, 'increase')}
                                            >
                                                <FaPlus />
                                            </button>
                                        </div>
                                    </div>
                                    <button 
                                        className={`add-cart-btn ${addingToCart[item.id] ? 'loading' : ''}`}
                                        onClick={() => handleAddToCart(item)}
                                        disabled={addingToCart[item.id]}
                                    >
                                        <FaShoppingCart /> {addingToCart[item.id] ? 'Adding...' : 'Add to Cart'}
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
