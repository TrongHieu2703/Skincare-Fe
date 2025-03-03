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
        setDropdownOpen((prev) => !prev);
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest(".user-menu")) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm) {
                try {
                    const results = await searchProducts(searchTerm);
                    setSearchResults(results);
                    setShowSearchResults(true);
                } catch (error) {
                    console.error('Search error:', error);
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
            {/* Logo */}
            <div className="navbar-logo" onClick={() => navigate("/")}>
                <img src="/src/assets/images/logo.png" alt="Skincare Logo" className="logo" />
            </div>

            {/* Updated Search Bar */}
            <div className="navbar-search">
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <FaSearch className="search-icon" />
                </div>

                {showSearchResults && searchResults.length > 0 && (
                    <div className="search-results">
                        {searchResults.map((product) => (
                            <div
                                key={product.id}
                                className="search-result-item"
                                onClick={() => handleSearchResultClick(product.id)}
                            >
                                <img
                                    src={product.mainImage || '/placeholder.png'}
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
                        ))}
                    </div>
                )}
            </div>

            {/* Navigation Links */}
            <div className="navbar-links">
                <Link to="/">Trang chủ</Link>
                <Link to="/AboutSkincare">Giới thiệu</Link>
                <Link to="/test-loai-da">Kiểm tra da</Link>
                <Link to="/product-list">Sản phẩm</Link>
                <Link to="/blog">Blog</Link>
                <Link to="/cart-items" className="cart-icon">
                    <FaShoppingCart />
                    {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
                </Link>
            </div>

            {/* User Section */}
            <div className="navbar-buttons">
                {user ? (
                    <div className="user-menu">
                        <div className="user-info" onClick={toggleDropdown}>
                            <FaUserCircle className="user-icon" />
                            <span>{user.username}</span>
                        </div>

                        {dropdownOpen && (
                            <div className="dropdown-menu" style={{ display: 'block', border: '2px solid green' }}>
                                <Link to="/ho-so" className="dropdown-item">
                                    <FaUserCircle className="dropdown-icon" /> Hồ sơ
                                </Link>
                                <Link to="/order-history" className="dropdown-item">
                                    <FaHistory className="dropdown-icon" /> Lịch sử đơn hàng
                                </Link>
                                <div className="dropdown-item" onClick={handleLogout}>
                                    <i className="fas fa-sign-out-alt dropdown-icon"></i> Đăng xuất
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <Link to="/register">
                            <button className="register">Đăng ký</button>
                        </Link>
                        <Link to="/login">
                            <button className="login">Đăng nhập</button>
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
