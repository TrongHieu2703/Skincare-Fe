import React from "react";
import "/src/styles/Footer.css";
import { FaFacebookF, FaYoutube, FaShoppingBag } from 'react-icons/fa';
import { SiZalo } from 'react-icons/si';
import { TbLetterL } from 'react-icons/tb';

const Footer = () => {
    return (
        <div className="main-content">
            {/* Your main content goes here */}
            <footer className="footer">

                <div className="footer-extra">
                    <div className="certification">
                        <p>🌿 <strong>GPKD/MST:</strong> 0106740438</p>
                        <img src="/src/assets/images/tich.webp" alt="Đã thông báo Bộ Công Thương" className="bo-cong-thuong" />
                    </div>
                    <div className="brand-motto">
                        <span>🌿</span>
                        <strong>SKINCARE ONLINE</strong>
                        <span>🌻</span>
                        <p>&copy; 2024 Skincare. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Footer;