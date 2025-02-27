import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createOrder } from '../api/orderApi'; 
import '/src/styles/OrderDetails.css';

const OrderDetail = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { cartItems, subtotal, shippingFee, total } = state || {};

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setOrderInfo((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const orderData = {
            customerId: 1, // Giả sử lấy từ Auth
            totalPrice: subtotal,
            discountPrice: 0,
            totalAmount: total,
            status: 'Pending',
            isPrepaid: false,
            orderItems: cartItems.map(item => ({
                productId: item.id,
                itemQuantity: item.quantity
            })),
            transactions: [],
            shippingInfo: {
                fullName: orderInfo.fullName,
                email: orderInfo.email,
                phone: orderInfo.phone,
                address: `${orderInfo.address}, ${orderInfo.ward}, ${orderInfo.district}, ${orderInfo.city}`,
                note: orderInfo.note
            }
        };

        try {
            const response = await createOrder(orderData);
            navigate('/payment', { state: { orderId: response.id, total } });
        } catch (error) {
            console.error('Error creating order:', error);
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
                            <input type="text" name="fullName" value={orderInfo.fullName} onChange={handleInputChange} required />
                        </div>

                        <div className="form-group">
                            <label>Email *</label>
                            <input type="email" name="email" value={orderInfo.email} onChange={handleInputChange} required />
                        </div>

                        <div className="form-group">
                            <label>Phone *</label>
                            <input type="tel" name="phone" value={orderInfo.phone} onChange={handleInputChange} required />
                        </div>

                        <div className="form-group">
                            <label>Address *</label>
                            <input type="text" name="address" value={orderInfo.address} onChange={handleInputChange} required />
                        </div>

                        <div className="form-group">
                            <label>Order Notes</label>
                            <textarea name="note" value={orderInfo.note} onChange={handleInputChange} rows="3" />
                        </div>

                        <button type="submit" className="checkout-button">Place Order</button>
                    </form>
                </div>

                <div className="order-detail-right">
                    <h3>Order Summary</h3>

                    {cartItems.map(item => (
                        <div key={item.id} className="cart-item-summary">
                            <span>{item.name}</span>
                            <span>${(item.price * item.quantity / 23000).toFixed(2)}</span>
                        </div>
                    ))}

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
