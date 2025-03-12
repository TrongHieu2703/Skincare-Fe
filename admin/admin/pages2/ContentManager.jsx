import React, { useState } from 'react';
import styles from '/admin/admin/pages2/ContentManager.module.css';
import Sidebar from '/admin/admin/pages2/Sidebar';

const ContentManager = () => {
  const [activeTab, setActiveTab] = useState('blog');
  const [posts, setPosts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'skincare',
    tags: [],
    seoTitle: '',
    seoDescription: '',
    image: null,
    status: 'draft'
  });
  const [newBanner, setNewBanner] = useState({
    title: '',
    image: null,
    link: '',
    startDate: '',
    endDate: '',
    position: 'home_top',
    status: 'active'
  });

  // Blog categories
  const categories = [
    { value: 'skincare', label: 'Chăm sóc da' },
    { value: 'product', label: 'Giới thiệu sản phẩm' },
    { value: 'tips', label: 'Mẹo làm đẹp' },
    { value: 'news', label: 'Tin tức' }
  ];

  // Banner positions
  const bannerPositions = [
    { value: 'home_top', label: 'Đầu trang chủ' },
    { value: 'home_middle', label: 'Giữa trang chủ' },
    { value: 'sidebar', label: 'Thanh bên' },
    { value: 'category_page', label: 'Trang danh mục' }
  ];

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'post') {
          setNewPost({ ...newPost, image: reader.result });
        } else {
          setNewBanner({ ...newBanner, image: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const validatePost = () => {
    if (!newPost.title || !newPost.content || !newPost.category) {
      alert('Vui lòng nhập đầy đủ thông tin bài viết!');
      return false;
    }
    return true;
  };

  const validateBanner = () => {
    if (!newBanner.title || !newBanner.image || !newBanner.link) {
      alert('Vui lòng nhập đầy đủ thông tin banner!');
      return false;
    }
    return true;
  };

  const resetNewPost = () => {
    setNewPost({
      title: '', content: '', category: 'skincare', tags: [],
      seoTitle: '', seoDescription: '', image: null, status: 'draft'
    });
  };

  const resetNewBanner = () => {
    setNewBanner({
      title: '', image: null, link: '', startDate: '',
      endDate: '', position: 'home_top', status: 'active'
    });
  };

  const addPost = () => {
    if (validatePost()) {
      setPosts([...posts, {
        id: Date.now(),
        ...newPost,
        date: new Date().toISOString(),
        views: 0,
        comments: []
      }]);
      resetNewPost();
    }
  };

  const addBanner = () => {
    if (validateBanner()) {
      setBanners([...banners, {
        id: Date.now(),
        ...newBanner,
        createdAt: new Date().toISOString()
      }]);
      resetNewBanner();
    }
  };

  return (
    <>
      <Sidebar />
      <div className={styles.section}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tabButton} ${activeTab === 'blog' ? styles.active : ''}`}
            onClick={() => setActiveTab('blog')}
          >
            Quản lý bài viết
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'banner' ? styles.active : ''}`}
            onClick={() => setActiveTab('banner')}
          >
            Quản lý banner
          </button>
        </div>

        {activeTab === 'blog' && (
          <div className={styles.blogSection}>
            <h2>Thêm bài viết mới</h2>
            <div className={styles.form}>
              <input
                type="text"
                placeholder="Tiêu đề bài viết"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                className={styles.input}
              />
              <select
                value={newPost.category}
                onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                className={styles.select}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              <textarea
                placeholder="Nội dung bài viết"
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                className={styles.textarea}
              />
              <div className={styles.seoSection}>
                <input
                  type="text"
                  placeholder="SEO Title"
                  value={newPost.seoTitle}
                  onChange={(e) => setNewPost({ ...newPost, seoTitle: e.target.value })}
                  className={styles.input}
                />
                <textarea
                  placeholder="SEO Description"
                  value={newPost.seoDescription}
                  onChange={(e) => setNewPost({ ...newPost, seoDescription: e.target.value })}
                  className={styles.textarea}
                />
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'post')}
                className={styles.fileInput}
              />
              <button onClick={addPost} className={styles.button}>Đăng bài</button>
            </div>

            <h2>Danh sách bài viết</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Danh mục</th>
                  <th>Ngày đăng</th>
                  <th>Lượt xem</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {posts.map(post => (
                  <tr key={post.id}>
                    <td>{post.title}</td>
                    <td>{categories.find(c => c.value === post.category)?.label}</td>
                    <td>{new Date(post.date).toLocaleDateString('vi-VN')}</td>
                    <td>{post.views}</td>
                    <td>
                      <span className={`${styles.status} ${styles[post.status]}`}>
                        {post.status === 'draft' ? 'Nháp' : 'Đã đăng'}
                      </span>
                    </td>
                    <td>
                      <button className={styles.editButton}>Sửa</button>
                      <button className={styles.deleteButton}>Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'banner' && (
          <div className={styles.bannerSection}>
            <h2>Thêm banner mới</h2>
            <div className={styles.form}>
              <input
                type="text"
                placeholder="Tiêu đề banner"
                value={newBanner.title}
                onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                className={styles.input}
              />
              <input
                type="text"
                placeholder="Link liên kết"
                value={newBanner.link}
                onChange={(e) => setNewBanner({ ...newBanner, link: e.target.value })}
                className={styles.input}
              />
              <select
                value={newBanner.position}
                onChange={(e) => setNewBanner({ ...newBanner, position: e.target.value })}
                className={styles.select}
              >
                {bannerPositions.map(pos => (
                  <option key={pos.value} value={pos.value}>{pos.label}</option>
                ))}
              </select>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'banner')}
                className={styles.fileInput}
              />
              <button onClick={addBanner} className={styles.button}>Thêm banner</button>
            </div>

            <h2>Danh sách banner</h2>
            <div className={styles.bannerGrid}>
              {banners.map(banner => (
                <div key={banner.id} className={styles.bannerCard}>
                  <img src={banner.image} alt={banner.title} />
                  <div className={styles.bannerInfo}>
                    <h3>{banner.title}</h3>
                    <p>{bannerPositions.find(p => p.value === banner.position)?.label}</p>
                    <div className={styles.bannerActions}>
                      <button className={styles.editButton}>Sửa</button>
                      <button className={styles.deleteButton}>Xóa</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ContentManager; 