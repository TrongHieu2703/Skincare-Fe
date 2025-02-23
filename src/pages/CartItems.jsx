import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaMinus, FaTrash } from 'react-icons/fa';
import '/src/styles/CartItems.css';

const Cart = () => {
    const navigate = useNavigate();
    // Mock cart data (later replace with real data from context/redux)
    const [cartItems, setCartItems] = useState([
        {
            id: 1,
            name: 'Product 1',
            price: 450000,
            quantity: 1,
            image: '/src/assets/images/sanpham1.jpg'
        },
        {
            id: 2,
            name: 'Product 2',
            price: 450000,
            quantity: 1,
            image: '/src/assets/images/sanpham2.jpg'
        },
        {
            id: 3,
            name: 'Product 3',
            price: 550000,
            quantity: 1,
            image: '/src/assets/images/sanpham3.jpg'
        }
    ]);

    const updateQuantity = (id, change) => {
        setCartItems(prevItems =>
            prevItems.map(item => {
                if (item.id === id) {
                    const newQuantity = item.quantity + change;
                    return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
                }
                return item;
            })
        );
    };

    const removeItem = (id) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    };

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingFee = 30000;
    const total = subtotal + shippingFee;

    const handleCheckout = () => {
        navigate('/order-detail', {
            state: {
                cartItems,
                subtotal,
                shippingFee,
                total
            }
        });
    };

    return (
        <div className="cart-page">
            <div className="cart-container">
                <div className="cart-header">
                    <h1>Shopping Cart</h1>
                    <span className="item-count">{cartItems.length} items</span>
                </div>

                <div className="cart-content">
                    <div className="cart-items">
                        {cartItems.map(item => (
                            <div key={item.id} className="cart-item">
                                <div className="item-image">
                                    <img src={item.image} alt={item.name} />
                                </div>

                                <div className="item-details">
                                    <h3>{item.name}</h3>
                                    <div className="item-price">${(item.price / 23000).toFixed(2)}</div>

                                    <div className="item-controls">
                                        <div className="quantity-controls">
                                            <button
                                                onClick={() => updateQuantity(item.id, -1)}
                                                disabled={item.quantity <= 1}
                                            >
                                                <FaMinus />
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, 1)}>
                                                <FaPlus />
                                            </button>
                                        </div>

                                        <button
                                            className="remove-button"
                                            onClick={() => removeItem(item.id)}
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>

                                <div className="item-total">
                                    ${((item.price * item.quantity) / 23000).toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary">
                        <h3>Order Summary</h3>

                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>${(subtotal / 23000).toFixed(2)}</span>
                        </div>

                        <div className="summary-row">
                            <span>Shipping Fee</span>
                            <span>${(shippingFee / 23000).toFixed(2)}</span>
                        </div>

                        <div className="summary-row total">
                            <span>Total</span>
                            <span>${(total / 23000).toFixed(2)}</span>
                        </div>

                        <button
                            className="checkout-button"
                            onClick={handleCheckout}
                            disabled={cartItems.length === 0}
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;