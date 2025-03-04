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
                    <p>Điểm đến đáng tin cậy của bạn cho các sản phẩm chăm sóc da cao cấp và giải pháp làm đẹp.</p>
                    <div className="social-links">
                        <a href="#" aria-label="Facebook"><FaFacebookF className="social-icon" /></a>
                        <a href="#" aria-label="YouTube"><FaYoutube className="social-icon" /></a>
                        <a href="#" aria-label="Zalo"><SiZalo className="social-icon" /></a>
                        <a href="#" aria-label="Shopee"><FaShoppingBag className="social-icon" /></a>
                        <a href="#" aria-label="Lazada"><TbLetterL className="social-icon" /></a>
                    </div>
                </div>

                {/* Footer Sections */}
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
                            <li><a href="#">Liên Hệ Với Chúng Tôi</a></li>
                            <li><a href="#">Câu Hỏi Thường Gặp</a></li>
                            <li><a href="#">Thông Tin Vận Chuyển</a></li>
                            <li><a href="#">Trả Hàng</a></li>
                            <li><a href="#">Tình Trạng Đơn Hàng</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>Công Ty</h4>
                        <ul>
                            <li><a href="#">Về Chúng Tôi</a></li>
                            <li><a href="#">Blog</a></li>
                            <li><a href="#">Cơ Hội Nghề Nghiệp</a></li>
                            <li><a href="#">Báo Chí</a></li>
                            <li><a href="#">Thẻ Quà Tặng</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>Chính Sách</h4>
                        <ul>
                            <li><a href="#">Chính Sách Bảo Mật</a></li>
                            <li><a href="#">Điều Khoản Dịch Vụ</a></li>
                            <li><a href="#">Cài Đặt Cookie</a></li>
                            <li><a href="#">Chính Sách Trả Hàng</a></li>
                            <li><a href="#">Chính Sách Vận Chuyển</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>Liên Kết Nhanh</h4>
                        <ul>
                            <li><a href="#">Trang Chủ</a></li>
                            <li><a href="#">Giới Thiệu</a></li>
                            <li><a href="#">Sản Phẩm Mới</a></li>
                            <li><a href="#">Khuyến Mãi</a></li>
                            <li><a href="#">Liên Hệ</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Footer Extra Information */}
            <div className="footer-extra">
                <p>🌿 <strong>GPKD/MST:</strong> 0106740438</p>
                <img src="/src/assets/images/tich.webp" alt="Đã thông báo Bộ Công Thương" className="bo-cong-thuong" />
                <p>🌿 <strong>SKINCARE ONLINE🌻</strong></p>
            </div>

            {/* Footer Bottom */}
            <div className="footer-bottom">
                <div className="footer-bottom-content">
                    <p>&copy; 2024 Skincare. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
