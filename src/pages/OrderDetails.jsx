// src/pages/OrderDetail.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createOrder } from '../api/orderApi';
import '/src/styles/OrderDetails.css';

const OrderDetail = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  // Lấy cartItems, subtotal, shippingFee, total từ location.state
  const { cartItems = [], subtotal = 0, shippingFee = 30000, total = 0 } = state || {};

  const [orderInfo, setOrderInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    note: ''
  });

  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Lấy userId từ localStorage (sau khi đăng nhập)
  useEffect(() => {
    const loggedUser = localStorage.getItem("user");
    if (loggedUser) {
      try {
        const parsedUser = JSON.parse(loggedUser);
        if (parsedUser?.id) {
          setUserId(parsedUser.id);
        }
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    if (!userId) {
      setLoading(false);
      setErrorMessage('Bạn chưa đăng nhập!');
      return;
    }

    // Chuẩn bị dữ liệu tạo Order
    const orderData = {
      customerId: userId,
      voucherId: null,
      totalPrice: subtotal,
      discountPrice: 0,
      totalAmount: total,
      status: 'Pending',
      isPrepaid: false,
      orderItems: cartItems.map((item) => ({
        productId: item.product?.id ?? item.productId ?? 0,
        itemQuantity: item.quantity
      })),
      transactions: [
        {
          paymentMethod: "CashOnDelivery",
          status: "Pending",
          amount: total,
          createdDate: new Date().toISOString()
        }
      ]
      // Nếu backend hỗ trợ shippingInfo, có thể bổ sung:
      // shippingInfo: {
      //   fullName: orderInfo.fullName,
      //   email: orderInfo.email,
      //   phone: orderInfo.phone,
      //   address: `${orderInfo.address}, ${orderInfo.ward}, ${orderInfo.district}, ${orderInfo.city}`,
      //   note: orderInfo.note
      // }
    };

    try {
      const response = await createOrder(orderData);
      setSuccessMessage('Order placed successfully!');
      navigate('/payment', { state: { orderId: response.id, total } });
    } catch (error) {
      console.error('Error creating order:', error);
      setErrorMessage('Error creating order');
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
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={orderInfo.email}
                onChange={handleInputChange}
                required
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
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={orderInfo.city}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>District</label>
              <input
                type="text"
                name="district"
                value={orderInfo.district}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Ward</label>
              <input
                type="text"
                name="ward"
                value={orderInfo.ward}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Order Notes</label>
              <textarea
                name="note"
                value={orderInfo.note}
                onChange={handleInputChange}
                rows="3"
              />
            </div>
            <button type="submit" className="checkout-button" disabled={loading}>
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
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

export default OrderDetail;
