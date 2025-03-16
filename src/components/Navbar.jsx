import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaSearch, FaShoppingCart, FaUserCircle, FaHistory, FaTrash, FaEye, FaSpinner } from "react-icons/fa";
import { searchProducts } from "../api/productApi";
import { useCart } from "../store/CartContext";
import { useAuth } from "../auth/AuthProvider";
import "/src/styles/Navbar.css";

const Navbar = () => {
    const [user, setUser] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false); // State to track dropdown visibility
    const [cartPopupVisible, setCartPopupVisible] = useState(false); // State for cart popup
    const [scrolled, setScrolled] = useState(false); // Track scroll position
    const navigate = useNavigate();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    // State để theo dõi item đang được xóa
    const [removingItems, setRemovingItems] = useState({});
    
    // Use cart context instead of local state
    const { cartItems, cartData, subtotal, formatPrice, removeCartItem } = useCart();
    const { isAuthenticated } = useAuth();

    // Add scroll listener to change navbar style on scroll
    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            if (scrollPosition > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Debug cart count
    useEffect(() => {
        console.log("Navbar - cartItems:", cartItems);
        console.log("Navbar - cartCount:", cartItems.length);
    }, [cartItems]);

    useEffect(() => {
        const loggedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (loggedUser && token) {
            try {
                const parsedUser = JSON.parse(loggedUser);
                setUser(parsedUser);
            } catch (error) {
                console.error("Error parsing user data:", error);
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                setUser(null);
            }
        } else {
            setUser(null);
        }
    }, [location, isAuthenticated]);

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
        navigate("/");
    };

    const toggleDropdown = (e) => {
        e.stopPropagation();
        setDropdownOpen((prev) => !prev); // Toggle dropdown visibility
    };

    // Toggle cart popup
    const toggleCartPopup = (e) => {
        e.preventDefault(); // Prevent navigation to cart page when clicking the icon
        e.stopPropagation();
        setCartPopupVisible((prev) => !prev); // Toggle cart popup
    };

    const handleClickOutside = (e) => {
        if (!e.target.closest('.user-menu') && dropdownOpen) {
            setDropdownOpen(false); // Close dropdown if clicked outside
        }
        
        // Close cart popup if clicked outside
        if (!e.target.closest('.cart-popup-container') && cartPopupVisible) {
            setCartPopupVisible(false);
        }
    };

    // Handle cart item view details
    const handleViewItem = (productId) => {
        setCartPopupVisible(false);
        navigate(`/product/${productId}`);
    };

    // Handle remove item with loading state
    const handleRemoveItem = async (itemId) => {
        try {
            // Set loading state cho item này
            setRemovingItems(prev => ({ ...prev, [itemId]: true }));
            
            // Gọi API để xóa item
            await removeCartItem(itemId);
            
            // Hiển thị thông báo thành công (tùy chọn)
            // Không cần làm gì thêm vì CartContext đã tự động cập nhật state
        } catch (error) {
            console.error("Error removing item:", error);
            // Có thể hiển thị thông báo lỗi ở đây
        } finally {
            // Reset loading state sau khi hoàn thành
            setTimeout(() => {
                setRemovingItems(prev => ({ ...prev, [itemId]: false }));
            }, 300);
        }
    };

    // Handle view cart
    const handleViewCart = () => {
        setCartPopupVisible(false);
        navigate('/cart-items');
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [dropdownOpen, cartPopupVisible]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.trim()) {
                setIsSearching(true);
                try {
                    console.log(`Searching for: ${searchTerm}`); // Log the search term
                    const response = await searchProducts(searchTerm);
                    console.log('Search response:', response); // Log the response
                    const results = response.data; // Extract the 'data' field
                    setSearchResults(Array.isArray(results) ? results : []);
                    setShowSearchResults(true);
                } catch (error) {
                    console.error('Search error:', error);
                    setSearchResults([]);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
                setShowSearchResults(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleSearchResultClick = (productId) => {
        navigate(`/product/${productId}`);
        setSearchTerm("");
        setSearchResults([]);
        setShowSearchResults(false);
    };

    // Close search results when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.navbar-search')) {
                setShowSearchResults(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            {/* Logo Section */}
            <div className="navbar-left">
                <div className="navbar-logo" onClick={() => navigate("/")}>
                    <img src="/src/assets/images/logo.png" alt="Skincare Logo" className="logo" />
                </div>
            </div>

            {/* Navigation Links */}
            <div className="navbar-center">
                <div className="nav-links">
                    <Link to="/">Trang chủ</Link>
                    <Link to="/AboutSkincare">Giới thiệu</Link>
                    <Link to="/test-loai-da">Kiểm tra da</Link>
                    <Link to="/product-list">Sản phẩm</Link>
                    <Link to="/blog">Blog</Link>
                </div>

                {/* Add Search Bar */}
                <div className="navbar-search">
                    <div className="search-container">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    {showSearchResults && (
                        <div className="search-results">
                            {isSearching ? (
                                <div className="search-loading">Đang tìm kiếm...</div>
                            ) : searchResults.length > 0 ? (
                                searchResults.map((product) => (
                                    <div
                                        key={product.id}
                                        className="search-result-item"
                                        onClick={() => handleSearchResultClick(product.id)}
                                    >
                                        <img
                                            src={product.image || '/placeholder.png'}
                                            alt={product.name}
                                            className="search-result-image"
                                        />
                                        <div className="search-result-info">
                                            <div className="search-result-name">{product.name}</div>
                                            <div className="search-result-price">
                                                {new Intl.NumberFormat('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND'
                                                }).format(product.price)}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-results">Không tìm thấy sản phẩm</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* User Actions */}
            <div className="navbar-right">
                <div className="cart-popup-container">
                    <div 
                        className="cart-icon-container"
                        onClick={toggleCartPopup}
                    >
                        <FaShoppingCart className="cart-icon" />
                        {cartItems.length > 0 && <span className="cart-count">{cartItems.length}</span>}
                    </div>

                    {/* Cart Popup */}
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
                                                    <div className="item-image">
                                                        <img 
                                                            src={item.productImage || "https://via.placeholder.com/50"} 
                                                            alt={item.productName}
                                                        />
                                                    </div>
                                                    <div className="item-details">
                                                        <div className="item-name">{item.productName}</div>
                                                        <div className="item-price-qty">
                                                            <span>{formatPrice(item.productPrice)}</span>
                                                            <span>x{item.quantity}</span>
                                                        </div>
                                                    </div>
                                                    <div className="item-actions">
                                                        <button 
                                                            className="action-btn view"
                                                            onClick={() => handleViewItem(item.productId)}
                                                            title="Xem chi tiết"
                                                            disabled={isRemoving}
                                                        >
                                                            <FaEye />
                                                        </button>
                                                        <button 
                                                            className="action-btn remove"
                                                            onClick={() => handleRemoveItem(item.id)}
                                                            title="Xóa sản phẩm"
                                                            disabled={isRemoving}
                                                        >
                                                            {isRemoving ? <FaSpinner className="spin" /> : <FaTrash />}
                                                        </button>
                                                    </div>
                                                    
                                                    {/* Overlay for removing items */}
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
                </div>

                {user ? (
                    <div className="user-menu">
                        <div className="user-info" onClick={toggleDropdown}>
                            <FaUserCircle className="user-icon" />
                            <span className="username">{user.username}</span>
                        </div>

                        {dropdownOpen && (
                            <div className="dropdown-menu">
                                <Link to="/profile" className="dropdown-item">
                                    <FaUserCircle className="dropdown-icon" />
                                    <span>Hồ sơ</span>
                                </Link>
                                <Link to="/order-history" className="dropdown-item">
                                    <FaHistory className="dropdown-icon" />
                                    <span>Lịch sử đơn hàng</span>
                                </Link>
                                <div className="dropdown-item" onClick={handleLogout}>
                                    <i className="fas fa-sign-out-alt dropdown-icon"></i>
                                    <span>Đăng xuất</span>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="auth-buttons">
                        <Link to="/register">
                            <button className="register-btn">Đăng ký</button>
                        </Link>
                        <Link to="/login">
                            <button className="login-btn">Đăng nhập</button>
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
