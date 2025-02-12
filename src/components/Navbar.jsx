import React from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaShoppingCart } from "react-icons/fa"; // Import shopping cart icon
import "../components/Navbar.css";

const Navbar = () => {
    return (
        <nav className="navbar">
            {/* Logo */}
            <div className="navbar-logo">
                <img
                    src="/src/images/logo.png" // Update to the actual path of the logo
                    alt="Skincare Logo"
                    className="logo"
                />
            </div>

            {/* Search Bar */}
            <div className="navbar-search">
                <input type="text" placeholder="Search for products..." />
                <FaSearch className="search-icon" />
            </div>

            {/* Navigation Links */}
            <div className="navbar-links">
                <Link to="/">Homepage</Link>
                <Link to="/test-loai-da">Skin Type Test</Link> {/* Link to the skin test */}
                <Link to="/san-pham">Skincare Products</Link>
                <Link to="/blog">Blog</Link>
                <Link to="/faq">FAQs</Link>
                <Link to="/ho-so">Profile</Link>
                <Link to="/cart" className="hover:text-green-700">
                    <FaShoppingCart /> {/* Shopping cart icon */}
                </Link>
            </div>

            {/* Buttons */}
            <div className="navbar-buttons">
                <Link to="/register">
                    <button className="register">Sign up</button>
                </Link>
                <Link to="/login">
                    <button className="login">Login</button>
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;
