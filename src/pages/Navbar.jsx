import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaSearch, FaShoppingCart, FaUserCircle, FaHistory, FaTrash, FaEye, FaSpinner } from "react-icons/fa";
import { searchProducts } from "../api/productApi";
import { useCart } from "../store/CartContext";
import { useAuth } from "../auth/AuthProvider";
import { formatProductImageUrl } from "../utils/imageUtils";
import "/src/styles/Navbar.css";

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { cartItems, subtotal, formatPrice, removeCartItem } = useCart();
    const { isAuthenticated, user } = useAuth();
    const [cartPopupVisible, setCartPopupVisible] = useState(false);
    const [removingItems, setRemovingItems] = useState({});
    const [scrolled, setScrolled] = useState(false);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Effect to handle scroll for the navbar appearance
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Function to navigate to the product details page
    const handleViewItem = (productId) => {
        console.log("Navigating to product:", productId);
        setCartPopupVisible(false); // Close the popup first
        navigate(`/product/${productId}`);
    };

    // Function to navigate to the cart page
    const handleViewCart = () => {
        setCartPopupVisible(false);
        navigate('/cart');
    };

    // Function to toggle the cart popup visibility
    const toggleCartPopup = () => {
        setCartPopupVisible(prev => !prev);
        // Close dropdown if open
        if (dropdownVisible) setDropdownVisible(false);
    };

    // Function to toggle the user dropdown
    const toggleDropdown = () => {
        setDropdownVisible(prev => !prev);
        // Close cart popup if open
        if (cartPopupVisible) setCartPopupVisible(false);
    };

    // Function to handle search input change
    const handleSearchChange = async (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value.trim().length > 2) {
            setIsSearching(true);
            try {
                const results = await searchProducts(value);
                setSearchResults(results.data || []);
            } catch (error) {
                console.error("Search error:", error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        } else {
            setSearchResults([]);
        }
    };

    // Function to handle removing an item from the cart
    const handleRemoveItem = async (itemId) => {
        try {
            setRemovingItems(prev => ({ ...prev, [itemId]: true }));
            await removeCartItem(itemId);
        } catch (error) {
            console.error("Error removing item:", error);
        } finally {
            setRemovingItems(prev => ({ ...prev, [itemId]: false }));
        }
    };

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="navbar-left">
                <div className="navbar-logo" onClick={() => navigate('/')}>
                    <img src="/src/assets/images/logo.png" alt="Logo" className="logo" />
                </div>
            </div>

            <div className="navbar-center">
                <div className="nav-links">
                    <Link to="/">Trang Chủ</Link>
                    <Link to="/product-list">Sản Phẩm</Link>
                    <Link to="/about">Về Chúng Tôi</Link>
                    <Link to="/contact">Liên Hệ</Link>
                </div>
            </div>

            <div className="navbar-right">
                <div className="navbar-search">
                    <div className="search-container">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            className="search-input"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                    
                    {searchResults.length > 0 && (
                        <div className="search-results">
                            {searchResults.map(product => (
                                <div 
                                    key={product.id} 
                                    className="search-result-item"
                                    onClick={() => {
                                        navigate(`/product/${product.id}`);
                                        setSearchTerm('');
                                        setSearchResults([]);
                                    }}
                                >
                                    <img 
                                        src={formatProductImageUrl(product.imageUrl)}
                                        alt={product.name}
                                        className="search-result-image"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "/src/assets/images/placeholder.png";
                                        }}
                                    />
                                    <div className="search-result-info">
                                        <div className="search-result-name">{product.name}</div>
                                        <div className="search-result-price">{formatPrice(product.price)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {isSearching && (
                        <div className="search-results">
                            <div className="search-loading">Đang tìm kiếm...</div>
                        </div>
                    )}

                    {searchTerm.trim().length > 2 && searchResults.length === 0 && !isSearching && (
                        <div className="search-results">
                            <div className="no-results">Không tìm thấy sản phẩm nào</div>
                        </div>
                    )}
                </div>
                
                <div className="cart-icon-container" onClick={toggleCartPopup}>
                    <FaShoppingCart className="cart-icon" />
                    {cartItems.length > 0 && (
                        <span className="cart-count">{cartItems.length}</span>
                    )}
                </div>
                
                <div className="user-menu">
                    {isAuthenticated ? (
                        <>
                            <div className="user-info" onClick={toggleDropdown}>
                                {user?.avatar ? (
                                    <img src={user.avatar} alt="User Avatar" className="user-avatar" />
                                ) : (
                                    <FaUserCircle className="user-icon" />
                                )}
                            </div>
                            {dropdownVisible && (
                                <div className="dropdown-menu">
                                    <Link to="/profile" className="dropdown-item">
                                        <FaUserCircle className="dropdown-icon" />
                                        Hồ sơ
                                    </Link>
                                    <Link to="/orders" className="dropdown-item">
                                        <FaHistory className="dropdown-icon" />
                                        Đơn hàng
                                    </Link>
                                    <div
                                        className="dropdown-item"
                                        onClick={() => {
                                            localStorage.removeItem('token');
                                            window.location.href = '/login';
                                        }}
                                    >
                                        <i className="fas fa-sign-out-alt dropdown-icon"></i>
                                        Đăng xuất
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="auth-buttons">
                            <button className="login-btn" onClick={() => navigate('/login')}>
                                Đăng nhập
                            </button>
                            <button className="register-btn" onClick={() => navigate('/register')}>
                                Đăng ký
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            {cartPopupVisible && (
                <div className="cart-popup">
                    <div className="cart-popup-header">
                        <h3>Giỏ hàng của bạn ({cartItems.length})</h3>
                    </div>
                    <div className="cart-popup-items">
                        {cartItems.length === 0 ? (
                            <div className="empty-cart-message">
                                Giỏ hàng trống
                            </div>
                        ) : (
                            <>
                                {cartItems.slice(0, 3).map((item) => {
                                    const isRemoving = removingItems[item.id];
                                    
                                    return (
                                        <div key={item.id} className={`cart-popup-item ${isRemoving ? 'removing' : ''}`}>
                                            <div 
                                                className="item-image" 
                                                onClick={() => handleViewItem(item.productId)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <img 
                                                    src={formatProductImageUrl(item.productImage)}
                                                    alt={item.productName}
                                                    onError={(e) => {
                                                        console.log("Image load error:", e.target.src);
                                                        e.target.onerror = null;
                                                        e.target.src = "/src/assets/images/placeholder.png";
                                                    }}
                                                />
                                            </div>
                                            <div 
                                                className="item-details" 
                                                onClick={() => handleViewItem(item.productId)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className="item-name">{item.productName}</div>
                                                <div className="item-price-qty">
                                                    <span>{formatPrice(item.productPrice)}</span>
                                                    <span>x{item.quantity}</span>
                                                </div>
                                            </div>
                                            <div className="item-actions">
                                                <button 
                                                    className="action-btn view"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewItem(item.productId);
                                                    }}
                                                    title="Xem chi tiết"
                                                    disabled={isRemoving}
                                                >
                                                    <FaEye />
                                                </button>
                                                <button 
                                                    className="action-btn remove"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveItem(item.id);
                                                    }}
                                                    title="Xóa sản phẩm"
                                                    disabled={isRemoving}
                                                >
                                                    {isRemoving ? <FaSpinner className="spin" /> : <FaTrash />}
                                                </button>
                                            </div>
                                            
                                            {isRemoving && (
                                                <div className="removing-overlay">
                                                    <FaSpinner className="spin" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                
                                {cartItems.length > 3 && (
                                    <div className="more-items-note">
                                        + {cartItems.length - 3} sản phẩm khác
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    <div className="cart-popup-footer">
                        <div className="cart-popup-total">
                            <span>Tạm tính:</span>
                            <span className="total-amount">{formatPrice(subtotal)}</span>
                        </div>
                        <button 
                            className="view-cart-btn"
                            onClick={handleViewCart}
                        >
                            Xem giỏ hàng
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar; 