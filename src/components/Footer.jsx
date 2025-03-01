import React from "react";
import "/src/styles/Footer.css";
import { FaFacebookF, FaYoutube, FaShoppingBag } from 'react-icons/fa';
import { SiZalo } from 'react-icons/si';
import { TbLetterL } from 'react-icons/tb';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                {/* Brand Section */}
                <div className="footer-brand">
                    <img src="/src/assets/images/logo.png" alt="Skincare Logo" className="footer-logo" />
                    <p>Your trusted destination for premium skincare products and beauty solutions.</p>
                    <div className="social-links">
                        <a href="#" aria-label="Facebook"><FaFacebookF /></a>
                        <a href="#" aria-label="YouTube"><FaYoutube /></a>
                        <a href="#" aria-label="Zalo"><SiZalo /></a>
                        <a href="#" aria-label="Shopee"><FaShoppingBag /></a>
                        <a href="#" aria-label="Lazada"><TbLetterL /></a>
                    </div>
                </div>

                {/* Footer Sections */}
                <div className="footer-sections">
                    <div className="footer-section">
                        <h4>Products</h4>
                        <ul>
                            <li><a href="#">Face Care</a></li>
                            <li><a href="#">Body Care</a></li>
                            <li><a href="#">Hair Care</a></li>
                            <li><a href="#">Makeup</a></li>
                            <li><a href="#">Fragrances</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>Help & Support</h4>
                        <ul>
                            <li><a href="#">Contact Us</a></li>
                            <li><a href="#">FAQs</a></li>
                            <li><a href="#">Shipping Info</a></li>
                            <li><a href="#">Returns</a></li>
                            <li><a href="#">Order Status</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>Company</h4>
                        <ul>
                            <li><a href="#">About Us</a></li>
                            <li><a href="#">Blog</a></li>
                            <li><a href="#">Careers</a></li>
                            <li><a href="#">Press</a></li>
                            <li><a href="#">Gift Cards</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Footer Extra Information */}
            <div className="footer-extra">
                <p>🌿 <strong>GPKD/MST:</strong> 0106740438</p>
                <img src="/src/assets/images/tich.webp" alt="Đã thông báo Bộ Công Thương" className="bo-cong-thuong" />
                <p>🌿 <strong>SKINCARE ONLINE🌻</strong></p>
                <div className="footer-social">
                    <a href="#" aria-label="Facebook"><FaFacebookF className="social-icon" /></a>
                    <a href="#" aria-label="YouTube"><FaYoutube className="social-icon" /></a>
                    <a href="#" aria-label="Zalo"><SiZalo className="social-icon" /></a>
                    <a href="#" aria-label="Shopee"><FaShoppingBag className="social-icon" /></a>
                    <a href="#" aria-label="Lazada"><TbLetterL className="social-icon" /></a>
                </div>
            </div>

            {/* Footer Bottom */}
            <div className="footer-bottom">
                <div className="footer-bottom-content">
                    <div className="footer-legal">
                        <a href="#">Privacy Policy</a>
                        <span className="separator">•</span>
                        <a href="#">Terms of Service</a>
                        <span className="separator">•</span>
                        <a href="#">Cookie Settings</a>
                    </div>
                    <p>&copy; 2024 Skincare. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
