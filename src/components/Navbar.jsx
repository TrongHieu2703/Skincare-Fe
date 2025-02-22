import React from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaShoppingCart } from 'react-icons/fa';
import './Navbar.css';

function Navbar() {
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top">
            <div className="container flex-column">
                {/* Top Row */}
                <div className="w-100 d-flex justify-content-between align-items-center mb-3">
                    {/* Logo */}
                    <Link className="navbar-brand" to="/">
                        <img src="./src/images/logo.png" alt="Skincare" height="50" />
                    </Link>

                    {/* Search Bar */}
                    <div className="search-container d-flex">
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search products..."
                            />
                            <button className="btn btn-success" type="button">
                                <FaSearch />
                            </button>
                        </div>
                    </div>

                    {/* Cart and Auth Buttons */}
                    <div className="d-flex align-items-center gap-3">
                        <Link to="/cart" className="cart-link">
                            <FaShoppingCart size={20} />
                            <span className="cart-badge">2</span>
                        </Link>
                        <Link to="/login" className="btn btn-success">Login</Link>
                        <Link to="/register" className="btn btn-success">Register</Link>
                    </div>
                </div>

                {/* Bottom Row - Navigation */}
                <div className="w-100 navigation-row">
                    <ul className="nav justify-content-center">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/products">Products</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/skin-test">Skin Test</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/blog">Blog</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
