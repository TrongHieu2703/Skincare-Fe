import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaSearch, FaShoppingCart, FaUserCircle } from "react-icons/fa";
import "/src/styles/Navbar.css";

const Navbar = () => {
    const [user, setUser] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation(); // Theo dõi thay đổi URL

    useEffect(() => {
        const loggedUser = localStorage.getItem("user");
        if (loggedUser) {
            setUser(JSON.parse(loggedUser));
        } else {
            setUser(null);
        }
    }, [location]);

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
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
            <div className="navbar-logo">
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
                <Link to="/test-loai-da">Skin Test</Link>
                <Link to="/product-list">Products</Link> {/* ✅ Đã sửa thành ProductList */}
                <Link to="/blog">Blog</Link>
                {user && <Link to="/ho-so">Profile</Link>}
                <Link to="/cartitems">
                    <FaShoppingCart />
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
                            <div className="dropdown-menu" style={{ display: 'block' }}>
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
