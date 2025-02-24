import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaSearch, FaShoppingCart, FaUserCircle } from "react-icons/fa";
import "/src/styles/Navbar.css";

const Navbar = () => {
    const [user, setUser] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation(); // Để theo dõi thay đổi URL

    // Lấy user từ localStorage khi URL thay đổi
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
        console.log("Dropdown clicked"); // Debug xem có click vào không
        setDropdownOpen((prev) => {
            console.log("Dropdown state before:", prev); // Kiểm tra state trước khi đổi
            return !prev;
        });
    };

    // Close dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest(".user-menu")) {
                setDropdownOpen(false);
                console.log("Dropdown closed due to outside click");
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    useEffect(() => {
        console.log("Dropdown Open State:", dropdownOpen); // Log state mỗi lần thay đổi
    }, [dropdownOpen]);

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
                <Link to="/products">Products</Link>
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
                            <div className="dropdown-menu" style={{ display: 'block', border: '2px solid red' }}>
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
