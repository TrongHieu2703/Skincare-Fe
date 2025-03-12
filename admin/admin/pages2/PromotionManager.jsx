import { useState } from 'react';
import PropTypes from 'prop-types';
import styles from '/admin/admin/pages2/PromotionManager.module.css';
import Sidebar from './Sidebar';

const PromotionManager = ({ orders }) => {
  // Track promotion usage from orders
  const updatePromotionUsage = (promotion) => {
    const usedInOrders = orders.filter(order => order.promotionCode === promotion.code);
    const totalDiscount = usedInOrders.reduce((sum, order) => sum + order.discountAmount, 0);
    return {
      ...promotion,
      usageCount: usedInOrders.length,
      totalDiscount
    };
  };

  const [promotions, setPromotions] = useState([]);
  const [newPromotion, setNewPromotion] = useState({
    code: '',
    type: 'percentage', // 'percentage' or 'fixed'
    value: '',
    minOrder: '',
    startDate: '',
    endDate: '',
    category: '', // for category-specific discounts
    usageLimit: '',
    description: ''
  });
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  // Promotion types
  const promotionTypes = [
    { value: 'percentage', label: 'Giảm theo %' },
    { value: 'fixed', label: 'Giảm số tiền cố định' },
    { value: 'buyXgetY', label: 'Mua X tặng Y' },
    { value: 'category', label: 'Giảm giá theo danh mục' }
  ];

  const addPromotion = () => {
    if (validatePromotion(newPromotion)) {
      setPromotions([...promotions, {
        id: Date.now(),
        ...newPromotion,
        status: isActive(newPromotion) ? 'active' : 'scheduled',
        usageCount: 0,
        totalDiscount: 0
      }]);
      resetNewPromotion();
    }
  };

  const validatePromotion = (promo) => {
    if (!promo.code || !promo.value || !promo.startDate || !promo.endDate) {
      alert('Vui lòng nhập đầy đủ thông tin khuyến mãi!');
      return false;
    }

    if (promo.type === 'percentage' && (promo.value < 0 || promo.value > 100)) {
      alert('Phần trăm giảm giá phải từ 0-100%!');
      return false;
    }

    if (new Date(promo.endDate) <= new Date(promo.startDate)) {
      alert('Ngày kết thúc phải sau ngày bắt đầu!');
      return false;
    }

    return true;
  };

  const resetNewPromotion = () => {
    setNewPromotion({
      code: '',
      type: 'percentage',
      value: '',
      minOrder: '',
      startDate: '',
      endDate: '',
      category: '',
      usageLimit: '',
      description: ''
    });
  };

  const deletePromotion = (id) => {
    setPromotions(promotions.filter(p => p.id !== id));
  };

  const isActive = (promotion) => {
    const now = new Date();
    const start = new Date(promotion.startDate);
    const end = new Date(promotion.endDate);
    return now >= start && now <= end;
  };

  const getPromotionStatus = (promotion) => {
    if (isActive(promotion)) return 'active';
    if (new Date() < new Date(promotion.startDate)) return 'scheduled';
    if (new Date() > new Date(promotion.endDate)) return 'expired';
    if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) return 'depleted';
    return 'inactive';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Filter promotions based on status
  const filteredPromotions = promotions.filter(promotion =>
    filterStatus === 'all' || getPromotionStatus(promotion) === filterStatus
  ).map(updatePromotionUsage);

  return (
    <>
      <Sidebar />
      <div className={styles.section}>
        <h1>Quản lý khuyến mãi</h1>

        {/* Add new promotion form */}
        <div className={styles.form}>
          <input
            type="text"
            placeholder="Mã khuyến mãi"
            value={newPromotion.code}
            onChange={(e) => setNewPromotion({ ...newPromotion, code: e.target.value.toUpperCase() })}
            className={styles.input}
          />
          <select
            value={newPromotion.type}
            onChange={(e) => setNewPromotion({ ...newPromotion, type: e.target.value })}
            className={styles.select}
          >
            {promotionTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder={newPromotion.type === 'percentage' ? 'Phần trăm giảm (%)' : 'Số tiền giảm (VNĐ)'}
            value={newPromotion.value}
            onChange={(e) => setNewPromotion({ ...newPromotion, value: e.target.value })}
            className={styles.input}
          />
          <input
            type="number"
            placeholder="Đơn hàng tối thiểu (VNĐ)"
            value={newPromotion.minOrder}
            onChange={(e) => setNewPromotion({ ...newPromotion, minOrder: e.target.value })}
            className={styles.input}
          />
          <input
            type="datetime-local"
            placeholder="Ngày bắt đầu"
            value={newPromotion.startDate}
            onChange={(e) => setNewPromotion({ ...newPromotion, startDate: e.target.value })}
            className={styles.input}
          />
          <input
            type="datetime-local"
            placeholder="Ngày kết thúc"
            value={newPromotion.endDate}
            onChange={(e) => setNewPromotion({ ...newPromotion, endDate: e.target.value })}
            className={styles.input}
          />
          <input
            type="number"
            placeholder="Giới hạn sử dụng"
            value={newPromotion.usageLimit}
            onChange={(e) => setNewPromotion({ ...newPromotion, usageLimit: e.target.value })}
            className={styles.input}
          />
          <textarea
            placeholder="Mô tả khuyến mãi"
            value={newPromotion.description}
            onChange={(e) => setNewPromotion({ ...newPromotion, description: e.target.value })}
            className={styles.textarea}
          />
          <button onClick={addPromotion} className={styles.button}>Thêm khuyến mãi</button>
        </div>

        {/* Filter promotions */}
        <div className={styles.filterContainer}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Tất cả khuyến mãi</option>
            <option value="active">Đang hoạt động</option>
            <option value="scheduled">Chưa bắt đầu</option>
            <option value="expired">Đã kết thúc</option>
            <option value="depleted">Hết lượt dùng</option>
          </select>
        </div>

        {/* Promotions table */}
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Mã KM</th>
              <th>Loại</th>
              <th>Giá trị</th>
              <th>Thời gian</th>
              <th>Đã dùng</th>
              <th>Trạng thái</th>
              <th>Tổng giảm giá</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredPromotions.map(promotion => (
              <tr key={promotion.id}>
                <td>{promotion.code}</td>
                <td>{promotionTypes.find(t => t.value === promotion.type)?.label}</td>
                <td>
                  {promotion.type === 'percentage'
                    ? `${promotion.value}%`
                    : `${parseInt(promotion.value).toLocaleString()}đ`
                  }
                </td>
                <td>
                  {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
                </td>
                <td>
                  {promotion.usageLimit
                    ? `${promotion.usageCount}/${promotion.usageLimit}`
                    : promotion.usageCount
                  }
                </td>
                <td>
                  <span
                    className={styles.statusBadge}
                    style={{
                      backgroundColor:
                        getPromotionStatus(promotion) === 'active' ? '#27ae60' :
                          getPromotionStatus(promotion) === 'scheduled' ? '#3498db' :
                            getPromotionStatus(promotion) === 'expired' ? '#e74c3c' :
                              '#95a5a6'
                    }}
                  >
                    {getPromotionStatus(promotion) === 'active' ? 'Đang hoạt động' :
                      getPromotionStatus(promotion) === 'scheduled' ? 'Chưa bắt đầu' :
                        getPromotionStatus(promotion) === 'expired' ? 'Đã kết thúc' :
                          'Hết lượt dùng'}
                  </span>
                </td>
                <td>{promotion.totalDiscount.toLocaleString()}đ</td>
                <td>
                  <button
                    onClick={() => setSelectedPromotion(promotion)}
                    className={styles.viewButton}
                  >
                    Chi tiết
                  </button>
                  <button
                    onClick={() => deletePromotion(promotion.id)}
                    className={styles.deleteButton}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Promotion details modal */}
        {selectedPromotion && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <span className={styles.closeButton} onClick={() => setSelectedPromotion(null)}>&times;</span>
              <h2>Chi tiết khuyến mãi</h2>
              <div className={styles.promotionDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Mã khuyến mãi:</span>
                  <span className={styles.value}>{selectedPromotion.code}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Mô tả:</span>
                  <span className={styles.value}>{selectedPromotion.description || '—'}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Đơn hàng tối thiểu:</span>
                  <span className={styles.value}>
                    {selectedPromotion.minOrder ? `${parseInt(selectedPromotion.minOrder).toLocaleString()}đ` : 'Không giới hạn'}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Lượt sử dụng:</span>
                  <span className={styles.value}>
                    {selectedPromotion.usageCount}
                    {selectedPromotion.usageLimit ? `/${selectedPromotion.usageLimit}` : ''}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Tổng giảm giá:</span>
                  <span className={styles.value}>{selectedPromotion.totalDiscount.toLocaleString()}đ</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Show message when no promotions */}
        {filteredPromotions.length === 0 && (
          <div className={styles.noPromotions}>
            <p>Không có khuyến mãi nào{filterStatus !== 'all' ? ` ${filterStatus}` : ''}.</p>
          </div>
        )}
      </div>
    </>
  );
};

// Define prop types
PromotionManager.propTypes = {
  orders: PropTypes.arrayOf(PropTypes.shape({
    promotionCode: PropTypes.string,
    discountAmount: PropTypes.number,
    // Add other order properties if needed
  })).isRequired,
};

export default PromotionManager; 