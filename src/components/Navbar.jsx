import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaSearch, FaShoppingCart, FaUserCircle, FaHistory, FaTrash, FaSpinner } from "react-icons/fa";
import { searchProducts } from "../api/productApi";
import { useCart } from "../store/CartContext";
import { useAuth } from "../auth/AuthProvider";
import { formatProductImageUrl, handleImageError } from "../utils/imageUtils";
import { API_BASE_URL } from "../api/axiosClient";
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
    const [avatarError, setAvatarError] = useState(false);
    
    // Use cart context instead of local state
    const { cartItems, cartData, subtotal, formatPrice, removeCartItem } = useCart();
    const { isAuthenticated, user: authUser } = useAuth();
    
    // Ref để theo dõi lần render đầu tiên
    const firstRender = useRef(true);

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

    // Cập nhật user từ auth context khi có thay đổi
    useEffect(() => {
        console.log("Auth user changed:", authUser);
        if (authUser) {
            setUser(authUser);
            setAvatarError(false); // Reset avatar error when auth user changes
        } else {
            setUser(null);
        }
    }, [authUser]);

    // Thêm event listener để cập nhật khi profile được sửa
    useEffect(() => {
        const handleProfileUpdate = () => {
            console.log("Navbar detected profile update event");
            setAvatarError(false); // Reset avatar error when profile is updated
        };

        // Lắng nghe custom event
        window.addEventListener('user-profile-updated', handleProfileUpdate);
        
        return () => {
            window.removeEventListener('user-profile-updated', handleProfileUpdate);
        };
    }, []);

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

    // Handle navigate to product details page
    const handleNavigateToProduct = (productId) => {
        setCartPopupVisible(false);
        navigate(`/product/${productId}`);
    };

    // Handle remove item with loading state
    const handleRemoveItem = async (e, itemId) => {
        // Stop propagation to prevent navigation when clicking remove button
        e.stopPropagation();
        e.preventDefault();
        
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
                    console.log(`Searching for: "${searchTerm}"`);
                    const response = await searchProducts(searchTerm);
                    console.log('Processed search response:', response);
                    
                    // Use the new response format
                    const results = response.data;
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

    // Thêm helper function để lấy đúng URL ảnh
    const getAvatarUrl = (avatarPath) => {
        if (!avatarPath) return "/src/assets/images/profile-pic.png";
        
        // URL tương đối từ wwwroot (bắt đầu bằng /avatar-images/)
        if (avatarPath.startsWith("/avatar-images/")) {
            // Thêm timestamp để tránh cache browser
            const timestamp = new Date().getTime();
            return `${API_BASE_URL}${avatarPath}?t=${timestamp}`;
        }
        
        // Nếu là ảnh Google Drive, sử dụng ảnh mặc định
        if (avatarPath.includes("drive.google.com")) {
            console.warn("Navbar: Google Drive image detected. Should be migrated to local.");
            return "/src/assets/images/profile-pic.png";
        }
        
        // Nếu là URL http(s) khác, giữ nguyên
        if (avatarPath.startsWith("http")) {
            return avatarPath;
        }
        
        // Fallback cho base64
        if (avatarPath.startsWith("data:image")) {
            return avatarPath;
        }
        
        return "/src/assets/images/profile-pic.png";
    };

    // Đảm bảo có mặc định khi user null
    const userAvatar = user && user.avatar ? getAvatarUrl(user.avatar) : "/src/assets/images/profile-pic.png";

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
                                            src={formatProductImageUrl(product.image)}
                                            alt={product.name}
                                            className="search-result-image"
                                            onError={(e) => handleImageError(e, "/src/assets/images/aboutus.jpg")}
                                            loading="lazy"
                                            width="100"
                                            height="100"
                                            style={{ objectFit: 'cover' }}
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
                                                <div 
                                                    key={item.id} 
                                                    className={`cart-popup-item ${isRemoving ? 'removing' : ''}`}
                                                    onClick={() => handleNavigateToProduct(item.productId)}
                                                >
                                                    <div className="item-image">
                                                        <img 
                                                            src={formatProductImageUrl(item.productImage)} 
                                                            alt={item.productName}
                                                            onError={(e) => handleImageError(e, "/src/assets/images/aboutus.jpg")}
                                                            loading="lazy"
                                                            width="60"
                                                            height="60"
                                                            style={{ objectFit: 'cover' }}
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
                                                            className="action-btn remove"
                                                            onClick={(e) => handleRemoveItem(e, item.id)}
                                                            title="Xóa sản phẩm"
                                                            disabled={isRemoving}
                                                        >
                                                            {isRemoving ? <FaSpinner className="spin" /> : <FaTrash className="trash-icon" />}
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
                            <img 
                                src={avatarError ? "/src/assets/images/profile-pic.png" : userAvatar} 
                                alt={user.username}
                                className="user-avatar" 
                                onError={() => setAvatarError(true)}
                            />
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
