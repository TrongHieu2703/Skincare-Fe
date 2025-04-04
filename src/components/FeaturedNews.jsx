import React from "react";
import "/src/styles/FeaturedNews.css";
import { FaArrowRight, FaGift, FaTag, FaStar } from 'react-icons/fa';

const FeaturedNews = () => {
    const newsItems = [
        {
            id: 1,
            title: "SVR-KHUYẾN MÃI",
            description: "KHI MUA BẤT KỲ SẢN PHẨM CỦA SVR VỚI HÓA ĐƠN 350K - TẶNG GEL LAVANT 50ML",
            image: "/src/assets/images/svr.jpg",
            tag: "Promotion",
            icon: <FaGift />
        },
        {
            id: 2,
            title: "SVR-KHUYẾN MÃI",
            description: "KHI MUA BẤT KỲ SẢN PHẨM CỦA SVR VỚI HÓA ĐƠN 350K - TẶNG GEL LAVANT 50ML",
            image: "/src/assets/images/srv2.jpg",
            tag: "New Arrival",
            icon: <FaTag />
        },
        {
            id: 3,
            title: "SVR-KHUYẾN MÃI",
            description: "KHI MUA BẤT KỲ SẢN PHẨM CỦA SVR VỚI HÓA ĐƠN 350K - TẶNG GEL LAVANT 50ML",
            image: "/src/assets/images/svr3.jpg",
            tag: "Special Offer",
            icon: <FaStar />
        }
    ];

    return (
        <div className="featured-news">
            <div className="news-header">
                <h2 className="section-title">Tin Nổi Bật</h2>
                <div className="section-subtitle">Khuyến Mãi • Sản Phẩm Mới • Ưu Đãi Đặc Biệt</div>
            </div>
            <div className="news-grid">
                {newsItems.map(item => (
                    <div key={item.id} className="news-card">
                        <div className="news-image-wrapper">
                            <img src={item.image} alt={item.title} className="news-image" />
                            <span className="news-tag">
                                {item.icon}
                                <span>{item.tag}</span>
                            </span>
                        </div>
                        <div className="news-content">
                            <h3 className="news-title">{item.title}</h3>
                            <p className="news-description">{item.description}</p>
                            <a href="/blog" className="read-more flex items-center gap-1 hover:underline">
                                Đọc ngay <FaArrowRight className="arrow-icon" />
                            </a>

                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FeaturedNews;
