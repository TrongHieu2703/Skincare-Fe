import React from "react";
import "./FeaturedNews.css";

const FeaturedNews = () => {
    const newsItems = [
        {
            id: 1,
            title: "SVR-KHUYẾN MÃI",
            description: "KHI MUA BẤT KỲ SẢN PHẨM CỦA SVR VỚI HÓA ĐƠN 350K - TẶNG GEL LAVANT 50ML",
            image: "./src/images/sampham4.jpg",
            link: "/news/svr-sale-1"
        },
        {
            id: 2,
            title: "SVR-KHUYẾN MÃI",
            description: "KHI MUA BẤT KỲ SẢN PHẨM CỦA SVR VỚI HÓA ĐƠN 350K - TẶNG GEL LAVANT 50ML",
            image: "/images/svrsale2.jpg",
            link: "/news/svr-sale-2"
        },
        {
            id: 3,
            title: "SVR-KHUYẾN MÃI",
            description: "KHI MUA BẤT KỲ SẢN PHẨM CỦA SVR VỚI HÓA ĐƠN 350K - TẶNG GEL LAVANT 50ML",
            image: "/images/svrsale3.jpg",
            link: "/news/svr-sale-3"
        }
    ];

    return (
        <div className="featured-news">
            <h2>Standout News</h2>
            <div className="news-list">
                {newsItems.map(item => (
                    <div key={item.id} className="news-item">
                        <img src={item.image} alt={item.title} className="news-image" />
                        <div className="news-info">
                            <h3>{item.title}</h3>
                            <p>{item.description}</p>
                            <a href={item.link} className="read-more">
                                Read more
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FeaturedNews;
