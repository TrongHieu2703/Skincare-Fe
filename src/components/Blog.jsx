import React from "react";
import "./Blog.css";
import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaYoutube, FaPinterest, FaInstagram } from 'react-icons/fa';

const Blog = () => {
    const blogPosts = [
        {
            id: 1,
            title: "Drs. Joel and Daniel Schlessinger's top 10 best eye creams",
            description: "Diminish crow's feet and dark under-eye circles with these dermatologist-recommended eye creams.",
            image: "/src/images/blog1.jpg",
            category: "Skin Care",
            date: "Feb 14, 2025"
        },
        {
            id: 2,
            title: "5 skin care resolutions from a SkinCeuticals aesthetician",
            image: "/src/images/blog2.png",
            category: "Skin Care",
            date: "Feb 10, 2025"
        },
        {
            id: 3,
            title: "Soothe winter skin with La Roche-Posay Cicaplast B5 Spray",
            image: "/src/images/blog3.avif",
            category: "Skin Care",
            date: "Feb 07, 2025"
        },
        {
            id: 4,
            title: "A minimalist routine for sensitive skin with ISDIN",
            image: "/src/images/blog4.webp",
            category: "Skin Care",
            date: "Feb 07, 2025"
        },
        {
            id: 5,
            title: "A minimalist routine for sensitive skin with ISDIN",
            image: "/src/images/blog5.png",
            category: "Skin Care",
            date: "Feb 07, 2025"
        }
    ];

    const categories = [
        "Skin Care",
        "Hot Products",
        "Hair Care",
        "Beauty",
        "News and Events",
        "Ask the Experts",
        "Sun Care"
    ];

    return (
        <div className="blog-container">
            <div className="blog-content">
                {/* Main Content */}
                <div className="blog-main">
                    <h1>Recent Posts</h1>

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
                                Read More →
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
                                        Read More →
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <aside className="blog-sidebar">
                    <div className="sidebar-section categories">
                        <h2>Categories</h2>
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
                        <h2>Follow Us</h2>
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
        </div>
    );
};

export default Blog;