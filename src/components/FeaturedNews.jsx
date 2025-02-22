import React from "react";
import "./styles/FeaturedNews.css";
import { FaArrowRight } from 'react-icons/fa';

const FeaturedNews = () => {
    const newsItems = [
        {
            id: 1,
            title: "SVR-KHUYẾN MÃI",
            description: "KHI MUA BẤT KỲ SẢN PHẨM CỦA SVR VỚI HÓA ĐƠN 350K - TẶNG GEL LAVANT 50ML",
            image: "/src/images/svr.jpg",
            tag: "Promotion"
        },
        {
            id: 2,
            title: "SVR-KHUYẾN MÃI",
            description: "KHI MUA BẤT KỲ SẢN PHẨM CỦA SVR VỚI HÓA ĐƠN 350K - TẶNG GEL LAVANT 50ML",
            image: "/src/images/srv2.jpg",
            tag: "New Arrival"
        },
        {
            id: 3,
            title: "SVR-KHUYẾN MÃI",
            description: "KHI MUA BẤT KỲ SẢN PHẨM CỦA SVR VỚI HÓA ĐƠN  - TẶNG GEL LAVANT 50ML",
            image: "/src/images/svr3.jpg",
            tag: "Special Offer"
        }
    ];

    return (
        <div className="featured-news">
            <h2 className="section-title">Standout News</h2>
            <div className="news-grid">
                {newsItems.map(item => (
                    <div key={item.id} className="news-card">
                        <div className="news-image-wrapper">
                            <img src={item.image} alt={item.title} className="news-image" />
                            <span className="news-tag">{item.tag}</span>
                        </div>
                        <div className="news-content">
                            <h3 className="news-title">{item.title}</h3>
                            <p className="news-description">{item.description}</p>
                            <a href="#" className="read-more">
                                Read more <FaArrowRight className="arrow-icon" />
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FeaturedNews;
