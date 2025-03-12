import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '/admin/admin/pages2/Sidebar.module.css';

// Import icon
import {
  FaTachometerAlt,
  FaBox,
  FaClipboardList,
  FaUsers,
  FaTags,
  FaFileAlt,
  FaUserCircle,
  FaSignOutAlt,
} from 'react-icons/fa';

const Sidebar = () => {
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);

  return (
    <div className={styles.sidebar}>
      <h2 className={styles.title}>Skincare Dashboard ☘</h2>
      <ul className={styles.list}>
        <li className={styles.item} onClick={() => navigate('/admin/dashboard')}>
          <FaTachometerAlt className={styles.icon} />
          <span>Thống kê</span>
        </li>
        <li className={styles.item} onClick={() => navigate('/admin/productsmanager')}>
          <FaBox className={styles.icon} />
          <span>Quản lý sản phẩm</span>
        </li>
        <li className={styles.item} onClick={() => navigate('/admin/orders')}>
          <FaClipboardList className={styles.icon} />
          <span>Quản lý đơn hàng</span>
        </li>
        <li className={styles.item} onClick={() => navigate('/admin/customers')}>
          <FaUsers className={styles.icon} />
          <span>Quản lý khách hàng</span>
        </li>
        <li className={styles.item} onClick={() => navigate('/admin/promotions')}>
          <FaTags className={styles.icon} />
          <span>Quản lý khuyến mãi</span>
        </li>
        <li className={styles.item} onClick={() => navigate('/admin/content')}>
          <FaFileAlt className={styles.icon} />
          <span>Quản lý nội dung</span>
        </li>
      </ul>

      <div className={styles.accountSection}>
        <div className={styles.accountToggle} onClick={() => setShowLogout(prev => !prev)}>
          <FaUserCircle className={styles.icon} />
          <span>Tài khoản</span>
        </div>
        {showLogout && (
          <button className={styles.logoutButton}>
            <FaSignOutAlt className={styles.icon} />
            Đăng xuất
          </button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
