import React from "react";
import "/src/styles/Footer.css";
import { FaFacebookF, FaYoutube, FaShoppingBag } from 'react-icons/fa';
import { SiZalo } from 'react-icons/si';
import { TbLetterL } from 'react-icons/tb';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-brand">
                    <img src="/src/assets/images/logo.png" alt="Skincare Logo" className="footer-logo" />
                    <p>Điểm đến đáng tin cậy của bạn cho các sản phẩm chăm sóc da cao cấp và giải pháp làm đẹp.</p>
                    <div className="social-links">
                        <a href="#" aria-label="Facebook"><FaFacebookF /></a>
                        <a href="#" aria-label="YouTube"><FaYoutube /></a>
                        <a href="#" aria-label="Zalo"><SiZalo /></a>
                        <a href="#" aria-label="Shopee"><FaShoppingBag /></a>
                        <a href="#" aria-label="Lazada"><TbLetterL /></a>
                    </div>
                </div>

                <div className="footer-sections">
                    <div className="footer-section">
                        <h4>Sản Phẩm</h4>
                        <ul>
                            <li><a href="#">Chăm Sóc Mặt</a></li>
                            <li><a href="#">Chăm Sóc Cơ Thể</a></li>
                            <li><a href="#">Chăm Sóc Tóc</a></li>
                            <li><a href="#">Trang Điểm</a></li>
                            <li><a href="#">Nước Hoa</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>Hỗ Trợ & Giúp Đỡ</h4>
                        <ul>
                            <li><a href="#">Liên Hệ</a></li>
                            <li><a href="#">FAQ</a></li>
                            <li><a href="#">Vận Chuyển</a></li>
                            <li><a href="#">Đổi Trả</a></li>
                            <li><a href="#">Đơn Hàng</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>Công Ty</h4>
                        <ul>
                            <li><a href="#">Về Chúng Tôi</a></li>
                            <li><a href="#">Blog</a></li>
                            <li><a href="#">Tuyển Dụng</a></li>
                            <li><a href="#">Báo Chí</a></li>
                            <li><a href="#">Quà Tặng</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>Chính Sách</h4>
                        <ul>
                            <li><a href="#">Bảo Mật</a></li>
                            <li><a href="#">Điều Khoản</a></li>
                            <li><a href="#">Cookie</a></li>
                            <li><a href="#">Đổi Trả</a></li>
                            <li><a href="#">Vận Chuyển</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="footer-extra">
                <div className="certification">
                    <p>🌿 <strong>GPKD/MST:</strong> 0106740438</p>
                    <img src="/src/assets/images/tich.webp" alt="Đã thông báo Bộ Công Thương" className="bo-cong-thuong" />
                </div>
                <div className="brand-motto">
                    <span>🌿</span>
                    <strong>SKINCARE ONLINE</strong>
                    <span>🌻</span>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; 2024 Skincare. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
