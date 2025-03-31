import React from "react";
import "/src/styles/Blog.css";
import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaYoutube, FaPinterest, FaInstagram } from 'react-icons/fa';
import Footer from "./Footer";

const Blog = () => {
    const blogPosts = [
        {
            id: 1,
            title: "10 loại kem mắt tốt nhất của bác sĩ Joel và Daniel Schlessinger",
            description: "Giảm thiểu nếp nhăn và quầng thâm dưới mắt với những loại kem mắt được bác sĩ da liễu khuyên dùng.",
            image: "/src/assets/images/blog1.jpg",
            category: "Chăm Sóc Da",
            date: "Feb 14, 2025"
        },
        {
            id: 2,
            title: "5 quyết tâm chăm sóc da từ một chuyên gia của SkinCeuticals",
            image: "/src/assets/images/blog2.png",
            category: "Chăm Sóc Da",
            date: "Feb 10, 2025"
        },
        {
            id: 3,
            title: "Xoa dịu làn da mùa đông với La Roche-Posay Cicaplast B5 Spray",
            image: "/src/assets/images/blog3.avif",
            category: "Chăm Sóc Da",
            date: "Feb 07, 2025"
        },
        {
            id: 4,
            title: "Một quy trình tối giản cho làn da nhạy cảm với ISDIN",
            image: "/src/assets/images/blog4.webp",
            category: "Chăm Sóc Da",
            date: "Feb 07, 2025"
        },
        {
            id: 5,
            title: "Một quy trình tối giản cho làn da nhạy cảm với ISDIN",
            image: "/src/assets/images/blog5.png",
            category: "Chăm Sóc Da",
            date: "Feb 07, 2025"
        }
    ];

    const categories = [
        "Chăm Sóc Da",
        "Sản Phẩm Nóng",
        "Chăm Sóc Tóc",
        "Làm Đẹp",
        "Tin Tức và Sự Kiện",
        "Hỏi Các Chuyên Gia",
        "Chăm Sóc Da Mặt Trời"
    ];

    return (
        <div className="blog-container">
            <div className="blog-content">
                {/* Main Content */}
                <div className="blog-main">
                    <h1>Bài Viết Gần Đây</h1>

                    {/* Featured Post */}
                    <div className="featured-post">
                        <div className="post-image">
                            <img src={blogPosts[0].image} alt={blogPosts[0].title} />
                            <div className="post-overlay">
                                <span className="post-date">{blogPosts[0].date}</span>
                                <span className="post-category">{blogPosts[0].category}</span>
                            </div>
                        </div>
                        <div className="post-content">
                            <h2>{blogPosts[0].title}</h2>
                            <p>{blogPosts[0].description}</p>
                            <Link to={`/blog/${blogPosts[0].id}`} className="read-more">
                                Đọc Thêm →
                            </Link>
                        </div>
                    </div>

                    {/* Recent Posts Grid */}
                    <div className="posts-grid">
                        {blogPosts.slice(1).map(post => (
                            <article key={post.id} className="post-card">
                                <div className="card-image">
                                    <img src={post.image} alt={post.title} />
                                    <div className="card-overlay">
                                        <span className="post-date">{post.date}</span>
                                        <span className="post-category">{post.category}</span>
                                    </div>
                                </div>
                                <div className="card-content">
                                    <h3>{post.title}</h3>
                                    <Link to={`/blog/${post.id}`} className="read-more">
                                        Đọc Thêm →
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <aside className="blog-sidebar">
                    <div className="sidebar-section categories">
                        <h2>Danh Mục</h2>
                        <ul>
                            {categories.map((category, index) => (
                                <li key={index}>
                                    <Link to={`/blog/category/${category.toLowerCase().replace(/\s+/g, '-')}`}>
                                        {category}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="sidebar-section social">
                        <h2>Theo Dõi Chúng Tôi</h2>
                        <div className="social-links">
                            <a href="#" className="social-link facebook">
                                <FaFacebookF />
                            </a>
                            <a href="#" className="social-link twitter">
                                <FaTwitter />
                            </a>
                            <a href="#" className="social-link youtube">
                                <FaYoutube />
                            </a>
                            <a href="#" className="social-link pinterest">
                                <FaPinterest />
                            </a>
                            <a href="#" className="social-link instagram">
                                <FaInstagram />
                            </a>
                        </div>
                    </div>
                </aside>
            </div>
            <Footer />
        </div>
    );
};

export default Blog;
