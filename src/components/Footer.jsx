import React from "react";
import "/src/styles/Footer.css";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

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
                        <a href="#" aria-label="Twitter"><FaTwitter /></a>
                        <a href="#" aria-label="Instagram"><FaInstagram /></a>
                        <a href="#" aria-label="LinkedIn"><FaLinkedinIn /></a>
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
