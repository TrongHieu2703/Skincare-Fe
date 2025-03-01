import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaSearch, FaShoppingCart, FaUserCircle } from "react-icons/fa";
import { getCartsByUserId } from "../api/cartApi";
import "/src/styles/Navbar.css";

const Navbar = () => {
    const [user, setUser] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0); // 🛒 Cart Counter
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const loggedUser = localStorage.getItem("user");
        if (loggedUser) {
            const parsedUser = JSON.parse(loggedUser);
            setUser(parsedUser);

            // ✅ Fetch Cart Count
            getCartsByUserId(parsedUser.id)
                .then((data) => setCartCount(data.length))
                .catch((err) => console.error("Error fetching cart:", err));
        } else {
            setUser(null);
            setCartCount(0); // Reset cart count on logout
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

    return (
        <nav className="navbar">
            {/* Logo */}
            <div className="navbar-logo" onClick={() => navigate("/")}>
                <img src="/src/assets/images/logo.png" alt="Skincare Logo" className="logo" />
            </div>

            {/* Search Bar */}
            <div className="navbar-search">
                <input type="text" placeholder="Search products..." />
                <FaSearch className="search-icon" />
            </div>

            {/* Navigation Links */}
            <div className="navbar-links">
                <Link to="/">Home</Link>
                <Link to="/AboutSkincare">About</Link>
                <Link to="/test-loai-da">Skin Test</Link>
                <Link to="/product-list">Products</Link>
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
                                <Link to="/ho-so" className="dropdown-item">Profile</Link>
                                <div className="dropdown-item" onClick={handleLogout}>Logout</div>

                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <Link to="/register">
                            <button className="register">SIGN UP</button>
                        </Link>
                        <Link to="/login">
                            <button className="login">LOGIN</button>
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
