import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaSearch, FaShoppingCart, FaUserCircle, FaHistory } from "react-icons/fa";
import { getCartByUser } from "../api/cartApi";
import { searchProducts } from "../api/productApi";
import "/src/styles/Navbar.css";

const Navbar = () => {
    const [user, setUser] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0); // 🛒 Cart Counter
    const navigate = useNavigate();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const loggedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (loggedUser && token) {
            const parsedUser = JSON.parse(loggedUser);
            setUser(parsedUser);

            getCartByUser()  // ✅ Gọi đúng tên hàm
                .then((data) => setCartCount(data.length))
                .catch((err) => console.error("❌ Error fetching cart:", err));
        } else {
            setUser(null);
            setCartCount(0);
        }
    }, [location]);

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
        setCartCount(0); // Clear cart count
        navigate("/");
    };

    const toggleDropdown = (e) => {
        e.stopPropagation();
        console.log('Toggle dropdown clicked');
        setDropdownOpen((prev) => !prev);
        console.log('Dropdown state:', !dropdownOpen);
    };

    const handleClickOutside = (e) => {
        if (!e.target.closest('.user-menu') && dropdownOpen) {
            setDropdownOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [dropdownOpen]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.trim()) {
                setIsSearching(true);
                try {
                    const results = await searchProducts(searchTerm);
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
        <nav className="navbar">
            {/* Logo Section - Left */}
            <div className="navbar-left">
                <div className="navbar-logo" onClick={() => navigate("/")}>
                    <img src="/src/assets/images/logo.png" alt="Skincare Logo" className="logo" />
                </div>
            </div>

            {/* Navigation Links - Center */}
            <div className="navbar-center">
                <div className="nav-links">
                    <Link to="/">Trang chủ</Link>
                    <Link to="/AboutSkincare">Giới thiệu</Link>
                    <Link to="/test-loai-da">Kiểm tra da</Link>
                    <Link to="/product-list">Sản phẩm</Link>
                    <Link to="/blog">Blog</Link>
                </div>

                {/* Search Bar */}
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

            {/* User Actions - Right */}
        <div className="navbar-right">
                <Link to="/cart-items" className="cart-link">
                    <div className="cart-icon-container">
                        <FaShoppingCart className="cart-icon" />
                        {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
                    </div>
                </Link>

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
