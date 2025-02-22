import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaShoppingCart } from "react-icons/fa"; // Import shopping cart icon
import "../components/Navbar.css";

const Navbar = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loggedUser = localStorage.getItem('user');
        console.log('Logged user:', loggedUser);
        if (loggedUser) {
            setUser(JSON.parse(loggedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        navigate('/');
    };

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
                <input type="text" placeholder="Search products..." />
                <FaSearch className="search-icon" />
            </div>

            {/* Navigation Links */}
            <div className="navbar-links">
                <Link to="/">Home</Link>
                <Link to="/test-loai-da">Skin Test</Link>
                <Link to="/san-pham">Products</Link>
                <Link to="/blog">Blog</Link>
                {user && <Link to="/ho-so">Profile</Link>}
                <Link to="/cart">
                    <FaShoppingCart />
                </Link>
            </div>

            {/* Buttons */}
            <div className="navbar-buttons">
                {user ? (
                    <>
                        <Link to="/ho-so" className="profile-link">Profile</Link>
                        <button onClick={handleLogout} className="login">Logout</button>
                    </>
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
