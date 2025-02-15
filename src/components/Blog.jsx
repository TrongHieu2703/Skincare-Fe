import React from "react";
import "./Blog.css";

const Blog = () => {
    const blogPosts = [
        {
            id: 1,
            title: "Effective Acne Care Treatment",
            category: "Skin Care",
            date: "March 15, 2024",
            image: "/src/images/acne-care.jpg",
            excerpt: "Discover effective and safe methods for treating acne...",
            author: {
                name: "Dr. Sarah Johnson",
                avatar: "/src/images/author1.jpg"
            }
        },
        {
            id: 2,
            title: "Top 10 Best Sunscreens of 2024",
            category: "Products",
            date: "March 12, 2024",
            image: "/src/images/sunscreen.jpg",
            excerpt: "Tổng hợp các sản phẩm chống nắng được đánh giá cao nhất...",
            author: {
                name: "Mai Phương",
                avatar: "/src/images/author2.jpg"
            }
        },
        // Thêm các bài viết khác
    ];

    return (
        <div className="blog-container">
            <div className="blog-header">
                <h1>Blog Chăm Sóc Da</h1>
                <div className="blog-categories">
                    <button className="category-btn active">Tất cả</button>
                    <button className="category-btn">Chăm sóc da</button>
                    <button className="category-btn">Sản phẩm</button>
                    <button className="category-btn">Mẹo làm đẹp</button>
                </div>
            </div>

            <div className="blog-grid">
                {blogPosts.map((post) => (
                    <article key={post.id} className="blog-card">
                        <div className="blog-card-image">
                            <img src={post.image} alt={post.title} />
                            <span className="category-tag">{post.category}</span>
                        </div>
                        <div className="blog-card-content">
                            <div className="blog-card-meta">
                                <span className="date">{post.date}</span>
                                <span className="dot">•</span>
                                <span className="read-time">5 phút đọc</span>
                            </div>
                            <h2>{post.title}</h2>
                            <p>{post.excerpt}</p>
                            <div className="blog-card-author">
                                <img src={post.author.avatar} alt={post.author.name} />
                                <span>{post.author.name}</span>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
};

export default Blog; 