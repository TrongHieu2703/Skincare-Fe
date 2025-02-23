import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '/src/styles/OrderDetails.css';

const OrderDetail = () => {
    const navigate = useNavigate();
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

    // Mock cart data (will be replaced with global state or context)
    const cartItems = [
        { id: 1, name: 'Product 1', price: 450000, quantity: 1, image: '/path-to-image-1.jpg' },
        { id: 2, name: 'Product 2', price: 450000, quantity: 1, image: '/path-to-image-2.jpg' },
    ];

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingFee = 30000;
    const total = subtotal + shippingFee;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setOrderInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        navigate('/payment');
    };

    return (
        <div className="order-detail-page">
            <div className="order-detail-container">
                <div className="order-detail-left">
                    <div className="section-header">
                        <h2>Shipping Information</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="shipping-form">
                        <div className="form-group">
                            <label>Full Name *</label>
                            <input
                                type="text"
                                name="fullName"
                                value={orderInfo.fullName}
                                onChange={handleInputChange}
                                required
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={orderInfo.email}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="example@email.com"
                                />
                            </div>

                            <div className="form-group">
                                <label>Phone Number *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={orderInfo.phone}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="0123456789"
                                />
                            </div>
                        </div>

                        <div className="address-section">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>City/Province *</label>
                                    <select name="city" value={orderInfo.city} onChange={handleInputChange} required>
                                        <option value="">Select city/province</option>
                                        {/* Add city options */}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>District *</label>
                                    <select name="district" value={orderInfo.district} onChange={handleInputChange} required>
                                        <option value="">Select district</option>
                                        {/* Add district options */}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Ward *</label>
                                <select name="ward" value={orderInfo.ward} onChange={handleInputChange} required>
                                    <option value="">Select ward</option>
                                    {/* Add ward options */}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Street Address *</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={orderInfo.address}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="House number, street name"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Order Notes</label>
                            <textarea
                                name="note"
                                value={orderInfo.note}
                                onChange={handleInputChange}
                                placeholder="Special notes for delivery"
                                rows="4"
                            />
                        </div>
                    </form>
                </div>

                <div className="order-detail-right">
                    <div className="order-summary">
                        <h3>Order Summary</h3>

                        <div className="cart-items">
                            {cartItems.map(item => (
                                <div key={item.id} className="cart-item">
                                    <div className="item-image">
                                        <img src={item.image} alt={item.name} />
                                    </div>
                                    <div className="item-details">
                                        <h4>{item.name}</h4>
                                        <div className="item-meta">
                                            <span className="quantity">Quantity: {item.quantity}</span>
                                            <span className="price">${(item.price / 23000).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
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

                        <button type="submit" className="checkout-button" onClick={handleSubmit}>
                            Proceed to Payment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;