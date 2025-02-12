import React from "react";
import "./Footer.css"; // Import your CSS file

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-section">
                    <div className="footer-logo">
                        <img src="/src/images/logo.png" alt="Skincare" />
                    </div>
                    <div className="footer-socials">
                        <a href="#">X</a>
                        <a href="#">Instagram</a>
                        <a href="#">LinkedIn</a>
                    </div>
                </div>
                <div className="footer-section">
                    <h3>Sản phẩm độc quyền</h3>
                    <ul>
                        <li>UX design</li>
                        <li>Wireframing</li>
                        <li>Diagramming</li>
                        <li>Brainstorming</li>
                        <li>Online whiteboard</li>
                        <li>Team collaboration</li>
                    </ul>
                </div>
                <div className="footer-section">
                    <h3>Hỗ trợ khách hàng</h3>
                    <ul>
                        <li>Design</li>
                        <li>Prototyping</li>
                        <li>Development features</li>
                        <li>Design systems</li>
                        <li>Collaboration features</li>
                        <li>Design process</li>
                        <li>FigJam</li>
                    </ul>
                </div>
                <div className="footer-section">
                    <h3>Thông tin hộ trợ
                    </h3>
                    <ul>
                        <li>Blog</li>
                        <li>Best practices</li>
                        <li>Colors</li>
                        <li>Color wheel</li>
                        <li>Support</li>
                        <li>Developers</li>
                        <li>Resource library</li>
                    </ul>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
