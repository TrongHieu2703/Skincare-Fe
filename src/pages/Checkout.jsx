// src/pages/Checkout.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createOrder } from '../api/orderApi';
import { getAllVouchers } from '../api/voucherApi';
import '/src/styles/Checkout.css';
import { getAccountInfo, updateAccountInfo } from '../api/accountApi';
import { useAuth } from '../auth/AuthProvider';
import { useCart } from "../store/CartContext";
import { formatProductImageUrl } from "../utils/imageUtils";

// Hàm định dạng tiền tệ VND
const formatVND = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount).replace('₫', 'đ');
};

// Cập nhật component chọn phương thức thanh toán để nhỏ gọn hơn
const PaymentMethodSelector = ({ selectedMethod, onChange }) => {
  return (
    <div className="payment-selection">
      <h3>Phương Thức Thanh Toán</h3>
      <div className="payment-methods">
        <div
          className={`payment-method-card selected`}
          onClick={() => onChange("Cash")}
        >
          <i className="fas fa-money-bill-wave"></i>
          <span>Tiền Mặt (COD)</span>
        </div>
      </div>
    </div>
  );
};

const Checkout = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  // Lấy cartItems, subtotal, shippingFee, total từ location.state
  const { cartItems = [], subtotal = 0, shippingFee = 30000, total = 0 } = state || {};

  const [orderInfo, setOrderInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    note: ''
  });

  // Thêm state cho phương thức thanh toán
  const [paymentMethod, setPaymentMethod] = useState("Cash"); // Mặc định là Cash

  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Thêm useAuth
  const { user, isAuthenticated } = useAuth();

  // Thêm useCart
  const { clearCart, loadCartItems } = useCart();

  const [vouchers, setVouchers] = useState([]); // State for vouchers
  const [selectedVoucher, setSelectedVoucher] = useState(null); // Selected voucher
  const [discount, setDiscount] = useState(0); // Discount amount

  // Cập nhật useEffect
  useEffect(() => {
    if (!isAuthenticated) {
      setErrorMessage("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn");
      return;
    }

    if (user) {
      setUserId(user.id || 0);
      fetchUserInfo();
    }

    // Log ra thông tin cart items để debug
    console.log("Cart items in Checkout:", cartItems);

    const fetchVouchers = async () => {
      try {
        const fetchedVouchers = await getAllVouchers();
        setVouchers(fetchedVouchers.data); // Assuming the response structure
      } catch (error) {
        console.error("Error fetching vouchers:", error);
      }
    };

    fetchVouchers();
  }, [isAuthenticated, user]);

  // Hàm lấy thông tin người dùng
  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      console.log("Fetching user info..."); // Debug log

      const userInfo = await getAccountInfo();
      console.log("User info fetched successfully:", userInfo); // Debug log

      // Cập nhật orderInfo dựa trên UProfileDTO và lưu avatar
      setOrderInfo({
        fullName: userInfo.username || '', // Sử dụng username thay vì fullName
        email: userInfo.email || '',
        phone: userInfo.phoneNumber || '', // Sử dụng phoneNumber thay vì phone
        address: userInfo.address || '',
        note: '',
        avatar: userInfo.avatar || '' // Lưu avatar hiện tại
      });
    } catch (error) {
      console.error("Error in fetchUserInfo:", error);
      setErrorMessage("Không thể lấy thông tin người dùng: " + (error.message || "Lỗi không xác định"));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderInfo((prev) => ({ ...prev, [name]: value }));
  };

  // Hàm cập nhật thông tin người dùng
  const handleUpdateProfile = async () => {
    // Kiểm tra token
    const token = localStorage.getItem('token');
    if (!token) {
      setErrorMessage('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!');
      return;
    }

    try {
      setIsUpdatingProfile(true);
      setErrorMessage('');
      setSuccessMessage('');

      // Chuẩn bị dữ liệu cập nhật theo UProfileDTO
      const updateData = {
        username: orderInfo.fullName, // Sử dụng username thay vì fullName
        email: orderInfo.email, // Giữ email nhưng không thay đổi
        phoneNumber: orderInfo.phone, // Sử dụng phoneNumber thay vì phone
        address: orderInfo.address,
        avatar: orderInfo.avatar // Sử dụng avatar hiện tại thay vì null
      };

      console.log("Sending update profile request with data:", updateData);

      await updateAccountInfo(updateData);
      setSuccessMessage('Cập nhật thông tin thành công!');

      // Cập nhật lại thông tin người dùng sau khi update thành công
      await fetchUserInfo();
    } catch (error) {
      console.error('Error updating profile:', error);

      // Hiển thị thông báo lỗi chi tiết hơn
      if (error.errors) {
        const errorMessages = Object.values(error.errors).flat().join(', ');
        setErrorMessage('Lỗi khi cập nhật thông tin: ' + errorMessages);
      } else {
        setErrorMessage('Lỗi khi cập nhật thông tin: ' + (error.message || 'Lỗi không xác định'));
      }
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Thêm hàm giả lập thanh toán thành công cho tất cả phương thức
  const simulatePayment = async (paymentMethod, orderData) => {
    if (paymentMethod !== "Cash") {
      return new Promise((resolve) => {
        setSuccessMessage(`Đang xử lý thanh toán qua ${paymentMethod === "Credit" ? "thẻ tín dụng" : "PayPal"
          }...`);

        setTimeout(() => {
          setSuccessMessage(`Thanh toán ${paymentMethod === "Credit" ? "thẻ tín dụng" : "PayPal"
            } thành công!`);
          resolve(true);
        }, 2000);
      });
    }
    return Promise.resolve(true);
  };

  const handleApplyVoucher = () => {
    if (selectedVoucher) {
      // Calculate discount amount based on voucher type
      const discountAmount = selectedVoucher.isPercent
        ? Math.min(Math.floor((subtotal * selectedVoucher.value) / 100), subtotal) // Ensure discount doesn't exceed subtotal for percentage
        : Math.min(selectedVoucher.value, subtotal); // Ensure fixed discount doesn't exceed subtotal

      setDiscount(discountAmount);
      const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee); // Ensure final total is not negative

      // Show success message with formatted values
      setSuccessMessage(
        `Áp dụng voucher thành công! Giảm ${selectedVoucher.isPercent
          ? selectedVoucher.value + '%'
          : formatVND(selectedVoucher.value)} (${formatVND(discountAmount)}). Tổng thanh toán: ${formatVND(finalTotal)}`
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Kiểm tra đăng nhập
      if (!isAuthenticated) {
        throw new Error('Bạn chưa đăng nhập!');
      }

      // Kiểm tra token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!');
      }

      // Kiểm tra giỏ hàng trống
      if (!cartItems || cartItems.length === 0) {
        throw new Error('Giỏ hàng của bạn đang trống!');
      }

      // Chuẩn bị dữ liệu tạo Order
      const orderData = {
        voucherId: selectedVoucher?.id,
        totalPrice: subtotal,
        discountPrice: discount,
        totalAmount: subtotal - discount + shippingFee,
        status: 'Pending',
        isPrepaid: false,
        orderItems: cartItems.map((item) => ({
          productId: item.productId ?? 0,
          itemQuantity: item.quantity
        })),
        transactions: [
          {
            paymentMethod: 'Cash',
            status: 'Pending',
            amount: subtotal - discount + shippingFee,
            createdDate: new Date().toISOString()
          }
        ]
      };

      console.log("Submitting order:", orderData);
      const response = await createOrder(orderData);
      console.log("Order created successfully:", response);

      try {
        await clearCart();
        console.log("Cart cleared successfully after order");
      } catch (clearError) {
        console.error("Failed to clear cart, but order was successful:", clearError);
      }

      const orderId = response.data ? response.data.id : response.id;

      if (!orderId) {
        throw new Error("Đặt hàng thành công nhưng không thể hiển thị chi tiết đơn hàng.");
      }

      console.log("Navigating to order details with ID:", orderId);
      navigate(`/order/${orderId}`, {
        state: {
          orderId: orderId,
          paymentSuccess: true
        }
      });
    } catch (error) {
      console.error("Error creating order:", error);

      // Handle specific error types
      if (error.type === "INSUFFICIENT_INVENTORY") {
        setErrorMessage("❌ " + error.message);
        // Reload cart to get updated inventory
        await loadCartItems();
      } else if (error.type === "PRODUCT_NOT_FOUND") {
        setErrorMessage("❌ " + error.message);
        // Reload cart as product might have been removed
        await loadCartItems();
      } else if (error.type === "ORDER_ERROR") {
        setErrorMessage("❌ " + error.message);
      } else {
        setErrorMessage(
          "❌ " + (error.message || "Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại sau.")
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Add function to handle product click
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="order-detail-page">
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Đang xử lý đơn hàng của bạn...</p>
        </div>
      )}

      <div className="order-detail-container">
        <div className="order-detail-left">
          <h2>Thông Tin Giao Hàng</h2>
          <form onSubmit={handleSubmit}>
            <div className="user-info-section">
              <div className="form-group">
                <label>Họ Và Tên *</label>
                <input
                  type="text"
                  name="fullName"
                  value={orderInfo.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email * (Không Thể Thay Đổi)</label>
                <input
                  type="email"
                  name="email"
                  value={orderInfo.email}
                  onChange={handleInputChange}
                  required
                  readOnly
                  className="readonly-input"
                />
              </div>
              <div className="form-group">
                <label>Số Điện Thoại *</label>
                <input
                  type="tel"
                  name="phone"
                  value={orderInfo.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Địa Chỉ *</label>
                <input
                  type="text"
                  name="address"
                  value={orderInfo.address}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Nút cập nhật thông tin đặt ngay dưới thông tin người dùng */}
              <div className="update-profile-section">
                <button
                  type="button"
                  className="update-profile-button"
                  onClick={handleUpdateProfile}
                  disabled={isUpdatingProfile}
                >
                  {isUpdatingProfile ? 'Đang Cập Nhật...' : 'Cập Nhật Thông Tin'}
                </button>
              </div>
            </div>

            {/* Thêm component chọn phương thức thanh toán */}
            <PaymentMethodSelector
              selectedMethod={paymentMethod}
              onChange={setPaymentMethod}
            />

            <div>
              <label>Chọn Voucher:</label>
              <select onChange={(e) => setSelectedVoucher(vouchers.find(v => v.id === e.target.value))}>
                <option value="">Chọn voucher</option>
                {vouchers.map(voucher => (
                  <option key={voucher.id} value={voucher.id}>{voucher.code} - {voucher.value}{voucher.isPercent ? '%' : 'đ'}</option>
                ))}
              </select>
              <button type="button" onClick={handleApplyVoucher}>Áp dụng</button>
            </div>

            {errorMessage && <div className="error-message">{errorMessage}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
          </form>
        </div>
        <div className="order-detail-right">
          <h3>Tổng Quan Đơn Hàng</h3>
          <div className="cart-items-summary">
            {cartItems.map((item) => {
              const productName = item.productName || 'Sản phẩm không xác định';
              const productPrice = item.productPrice ?? 0;

              return (
                <div key={item.id} className="cart-item-summary">
                  <div
                    className="cart-item-image"
                    onClick={() => handleProductClick(item.productId)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img
                      src={formatProductImageUrl(item.productImage)}
                      alt={productName}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/src/assets/images/placeholder.png";
                      }}
                    />
                  </div>
                  <div
                    className="cart-item-info"
                    onClick={() => handleProductClick(item.productId)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="cart-item-name">{productName}</div>
                    <div className="cart-item-details">
                      <span className="cart-item-price">{formatVND(productPrice)}</span>
                      <span className="cart-item-quantity">x {item.quantity}</span>
                    </div>
                  </div>
                  <div className="cart-item-total">
                    {formatVND(productPrice * item.quantity)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="price-details">
            <div className="price-row">
              <span>Tổng Tạm Tính</span>
              <span>{formatVND(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="price-row discount">
                <span>Giảm Giá</span>
                <span>-{formatVND(discount)}</span>
              </div>
            )}
            <div className="price-row">
              <span>Phí Vận Chuyển</span>
              <span>{formatVND(shippingFee)}</span>
            </div>
            <div className="price-row total">
              <span>Tổng Cộng</span>
              <span>{formatVND(subtotal - discount + shippingFee)}</span>
            </div>
          </div>

          {/* Nút đặt hàng được di chuyển đến đây */}
          <button
            onClick={handleSubmit}
            className="checkout-button"
            disabled={loading}
          >
            {loading ? 'Đang Xử Lý...' : paymentMethod === "Cash" ? 'ĐẶT HÀNG (COD)' : 'THANH TOÁN NGAY'}
          </button>

          <div className="order-security-note">
            <p>Mọi thông tin của bạn sẽ được bảo mật theo chính sách bảo mật của chúng tôi.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
