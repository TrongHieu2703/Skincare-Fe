// src/pages/Checkout.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createOrder } from '../api/orderApi';
import '/src/styles/Checkout.css';
import { getAccountInfo, updateAccountInfo } from '../api/accountApi';
import { useAuth } from '../auth/AuthProvider';
import { useCart } from "../store/CartContext";

// Payment Method Component
// Add this formatter function at the top after imports
const formatVND = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

// Update PaymentMethodSelector component
const PaymentMethodSelector = ({ selectedMethod, onChange }) => {
  return (
    <div className="payment-selection">
      <h3>Phương Thức Thanh Toán</h3>
      <div className="payment-methods">
        <div
          className={`payment-method-card ${selectedMethod === "Credit" ? "selected" : ""}`}
          onClick={() => onChange("Credit")}
        >
          <img src="/src/assets/images/visa.png" alt="Thẻ tín dụng" />
          <span>Thẻ Tín Dụng</span>
        </div>

        <div
          className={`payment-method-card ${selectedMethod === "Cash" ? "selected" : ""}`}
          onClick={() => onChange("Cash")}
        >
          <i className="fas fa-money-bill-wave"></i>
          <span>Tiền Mặt</span>
        </div>

        <div
          className={`payment-method-card ${selectedMethod === "Momo" ? "selected" : ""}`}
          onClick={() => onChange("Momo")}
        >
          <img src="/src/assets/images/momo.webp" alt="Momo" />
          <span>Ví Momo</span>
        </div>

        <div
          className={`payment-method-card ${selectedMethod === "Bank" ? "selected" : ""}`}
          onClick={() => onChange("Bank")}
        >
          <img src="/src/assets/images/applepay.png" alt="Chuyển khoản" />
          <span>Apple Pay</span>
        </div>

        <div
          className={`payment-method-card ${selectedMethod === "PayPal" ? "selected" : ""}`}
          onClick={() => onChange("PayPal")}
        >
          <img src="/src/assets/images/mastercard.png" alt="PayPal" />
          <span>MasterCard</span>
        </div>
      </div>

      {selectedMethod === "Credit" && (
        <div className="card-details">
          <div className="form-group">
            <label>Số Thẻ</label>
            <input type="text" placeholder="0000 0000 0000 0000" />
          </div>
          <div className="form-row">
            <div className="form-group half">
              <label>Hết Hạn</label>
              <input type="text" placeholder="MM/YY" />
            </div>
            <div className="form-group half">
              <label>CVV</label>
              <input type="text" placeholder="123" />
            </div>
          </div>
        </div>
      )}
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
  const { clearCart } = useCart();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    // Kiểm tra đăng nhập
    if (!isAuthenticated) {
      setLoading(false);
      setErrorMessage('Bạn chưa đăng nhập!');
      return;
    }

    // Kiểm tra token
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      setErrorMessage('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!');
      return;
    }

    console.log("Token exists before creating order:", !!token);
    console.log("Selected payment method:", paymentMethod);

    // Chuẩn bị dữ liệu tạo Order - sử dụng paymentMethod đã chọn
    const orderData = {
      voucherId: null,
      totalPrice: subtotal,
      discountPrice: 0,
      totalAmount: total,
      status: 'Pending',
      isPrepaid: paymentMethod !== "Cash", // Đánh dấu đã thanh toán nếu không phải thanh toán tiền mặt
      orderItems: cartItems.map((item) => ({
        productId: item.product?.id ?? item.productId ?? 0,
        itemQuantity: item.quantity
      })),
      transactions: [
        {
          // Sử dụng giá trị paymentMethod đã chọn (đã được kiểm tra là hợp lệ)
          paymentMethod: paymentMethod,
          status: paymentMethod === "Cash" ? "Pending" : "Completed",
          amount: total,
          createdDate: new Date().toISOString()
        }
      ]
    };

    try {
      console.log("Submitting order:", orderData);
      const response = await createOrder(orderData);
      console.log("Order created successfully:", response);

      // Giả lập quá trình thanh toán
      await simulatePayment(paymentMethod, orderData);
      
      try {
        // Clear the cart after successful order
        await clearCart();
        console.log("Cart cleared successfully after order");
      } catch (clearError) {
        console.error("Failed to clear cart, but order was successful:", clearError);
        // We don't want to block the order success flow if cart clearing fails
      }

      // Sau khi thanh toán thành công, chuyển hướng đến trang chi tiết đơn hàng
      navigate(`/order/${response.id}`, {
        state: {
          orderId: response.id,
          paymentSuccess: true
        }
      });
    } catch (error) {
      console.error("Error creating order:", error);
      setErrorMessage(
        error.response?.data?.message ||
        "Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại sau."
      );
      setLoading(false);
    }
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

            {/* Thêm component chọn phương thức thanh toán */}
            <PaymentMethodSelector
              selectedMethod={paymentMethod}
              onChange={setPaymentMethod}
            />

            <div className="form-actions">
              <button
                type="button"
                className="update-profile-button"
                onClick={handleUpdateProfile}
                disabled={isUpdatingProfile}
              >
                {isUpdatingProfile ? 'Đang Cập Nhật...' : 'Cập Nhật Thông Tin'}
              </button>

              <button type="submit" className="checkout-button" disabled={loading}>
                {loading ? 'Đang Xử Lý...' : paymentMethod === "Cash" ? 'Đặt Hàng (COD)' : 'Thanh Toán Ngay'}
              </button>
            </div>

            {errorMessage && <div className="error-message">{errorMessage}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
          </form>
        </div>
        <div className="order-detail-right">
          <h3>Tổng Quan Đơn Hàng</h3>
          <div className="cart-items-summary">
            {cartItems.map((item) => {
              const productName = item.product?.name || 'Product';
              const productPrice = item.product?.price ?? 0;
              return (
                <div key={item.cartId || item.id} className="cart-item-summary">
                  <span>{productName}</span>
                  <span>
                    {new Intl.NumberFormat('vi-VN').format(productPrice * item.quantity)}đ
                  </span>
                </div>
              );
            })}
          </div>
          // Update the price details section
          <div className="price-details">
            <div className="price-row">
              <span>Tổng Tạm Tính</span>
              <span>{formatVND(subtotal)}</span>
            </div>
            <div className="price-row">
              <span>Phí Vận Chuyển</span>
              <span>{formatVND(shippingFee)}</span>
            </div>
            <div className="price-row total">
              <span>Tổng Cộng</span>
              <span>{formatVND(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
