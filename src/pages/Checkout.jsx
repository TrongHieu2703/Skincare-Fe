// src/pages/OrderDetail.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createOrder } from '../api/orderApi';
import '/src/styles/Checkout.css';
import { getAccountInfo } from '../api/accountApi';
import { updateAccountInfo } from '../api/accountApi';
import { useAuth } from '../auth/AuthProvider';

// Payment Method Component
const PaymentMethodSelector = ({ selectedMethod, onChange }) => {
  return (
    <div className="payment-selection">
      <h3>Phương thức thanh toán</h3>
      <div className="payment-methods">
        <div 
          className={`payment-method-card ${selectedMethod === "Credit" ? "selected" : ""}`}
          onClick={() => onChange("Credit")}
        >
          <div className="payment-icon credit-icon">
            <i className="fas fa-credit-card"></i>
          </div>
          <span>Credit Card</span>
        </div>
        
        <div 
          className={`payment-method-card ${selectedMethod === "Cash" ? "selected" : ""}`}
          onClick={() => onChange("Cash")}
        >
          <div className="payment-icon cash-icon">
            <i className="fas fa-money-bill-wave"></i>
          </div>
          <span>Cash</span>
        </div>
        
        <div 
          className={`payment-method-card ${selectedMethod === "Bank" ? "selected" : ""}`}
          onClick={() => onChange("Bank")}
        >
          <div className="payment-icon paypal-icon">
            <i className="fas fa-university"></i>
          </div>
          <span>PayPal</span>
        </div>
      </div>
      
      {selectedMethod === "Credit" && (
        <div className="card-details">
          <div className="form-group">
            <label>Số thẻ</label>
            <input type="text" placeholder="0000 0000 0000 0000" />
          </div>
          <div className="form-row">
            <div className="form-group half">
              <label>Hết hạn</label>
              <input type="text" placeholder="MM/YY" />
            </div>
            <div className="form-group half">
              <label>CVV</label>
              <input type="text" placeholder="123" />
            </div>
          </div>
          <div className="form-group">
            <label>Tên chủ thẻ</label>
            <input type="text" placeholder="NGUYEN VAN A" />
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
    // Giả lập thanh toán cho Credit và Bank
    if (paymentMethod !== "Cash") {
      return new Promise((resolve) => {
        // Hiển thị thông báo đang xử lý thanh toán
        setSuccessMessage(`Đang xử lý thanh toán qua ${paymentMethod === "Credit" ? "thẻ tín dụng" : "PayPal"}...`);
        
        // Giả lập thời gian xử lý thanh toán
        setTimeout(() => {
          setSuccessMessage(`Thanh toán ${paymentMethod === "Credit" ? "thẻ tín dụng" : "PayPal"} thành công!`);
          resolve(true);
        }, 2000);
      });
    }
    
    // Cash không cần giả lập thanh toán
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
      
      // Sau khi thanh toán thành công, chuyển hướng đến trang chi tiết đơn hàng
      navigate(`/order/${response.id}`, { 
        state: { 
          orderId: response.id,
          paymentSuccess: true,
          paymentMethod: paymentMethod
        } 
      });
    } catch (error) {
      console.error('Error creating order:', error);
      
      // Xử lý lỗi chi tiết hơn
      if (error.errors) {
        const errorMessages = Object.values(error.errors).flat().join(', ');
        setErrorMessage('Lỗi khi tạo đơn hàng: ' + errorMessages);
      } else if (error.message) {
        setErrorMessage('Lỗi khi tạo đơn hàng: ' + error.message);
      } else {
        setErrorMessage('Lỗi khi tạo đơn hàng');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="order-detail-page">
      <div className="order-detail-container">
        <div className="order-detail-left">
          <h2>Shipping Information</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={orderInfo.fullName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email * (Không thể thay đổi)</label>
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
              <label>Phone *</label>
              <input
                type="tel"
                name="phone"
                value={orderInfo.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Address *</label>
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
                {isUpdatingProfile ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
              </button>
              
              <button type="submit" className="checkout-button" disabled={loading}>
                {loading ? 'Đang xử lý...' : paymentMethod === "Cash" ? 'Đặt hàng (COD)' : 'Thanh toán ngay'}
              </button>
            </div>
            
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
          </form>
        </div>
        <div className="order-detail-right">
          <h3>Order Summary</h3>
          <div className="cart-items-summary">
            {cartItems.map((item) => {
              const productName = item.product?.name || 'Product';
              const productPrice = item.product?.price ?? 0;
              return (
                <div key={item.cartId || item.id} className="cart-item-summary">
                  <span>{productName}</span>
                  <span>
                    ${((productPrice * item.quantity) / 23000).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="price-details">
            <div className="price-row">
              <span>Subtotal</span>
              <span>${(subtotal / 23000).toFixed(2)}</span>
            </div>
            <div className="price-row">
              <span>Shipping Fee</span>
              <span>${(shippingFee / 23000).toFixed(2)}</span>
            </div>
            <div className="price-row total">
              <span>Total</span>
              <span>${(total / 23000).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
