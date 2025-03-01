import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaPlus, FaMinus, FaTrash } from 'react-icons/fa';
import { updateCart, deleteCartItem, getCartByUser } from '../api/cartApi';
import '/src/styles/CartItems.css';

const Cart = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [cartItems, setCartItems] = useState(location.state?.cartItems || []);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("Cart Items from Location:", location.state?.cartItems);

        const loggedUser = localStorage.getItem("user");
        let userId = null;

        if (loggedUser) {
            try {
                const parsedUser = JSON.parse(loggedUser);
                userId = parsedUser?.id;
            } catch (error) {
                console.error("❌ Error parsing user data:", error);
            }
        }

        if (!location.state?.cartItems && userId) {
            console.log("Fetching cart from API for user ID:", userId);
            getCartByUser(userId)
                .then((data) => {
                    setCartItems(data);
                    setLoading(false);
                })
                .catch((error) => {
                    console.error('Error fetching cart:', error);
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [location.state?.cartItems]);

    const updateQuantity = async (id, change) => {
        const updatedCart = cartItems.map(item => {
            if (item.cartId === id) {
                const newQuantity = Math.max(1, item.quantity + change);
                return { ...item, quantity: newQuantity };
            }
            return item;
        });

        setCartItems(updatedCart);

        const itemToUpdate = updatedCart.find(item => item.cartId === id);
        if (itemToUpdate) {
            try {
                await updateCart(id, itemToUpdate);
            } catch (err) {
                console.error("Error updating cart:", err);
            }
        }
    };

    const removeItem = async (id) => {
        try {
            await deleteCartItem(id);
            setCartItems(cartItems.filter(item => item.cartId !== id));
        } catch (error) {
            console.error('Error deleting cart item:', error);
        }
    };

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingFee = 30000;
    const total = subtotal + shippingFee;

    const handleCheckout = () => {
        navigate('/order-detail', {
            state: { cartItems, subtotal, shippingFee, total }
        });
    };

    if (loading) {
        return <h2>Loading cart items...</h2>;
    }

    return (
        <div className="cart-page">
            <div className="cart-container">
                <div className="cart-header">
                    <h1>Shopping Cart</h1>
                    <span className="item-count">{cartItems.length} items</span>
                </div>

                {cartItems.length === 0 ? (
                    <div className="empty-cart">
                        <h2>Giỏ hàng của bạn đang trống 🛒</h2>
                        <p>Hãy thêm sản phẩm để tiếp tục mua sắm!</p>
                        <button onClick={() => navigate("/product-list")} className="continue-shopping">
                            Tiếp tục mua sắm
                        </button>
                    </div>
                ) : (
                    <div className="cart-content">
                        <div className="cart-items">
                            {cartItems.map(item => (
                                <div key={item.cartId} className="cart-item">
                                    <div className="item-image">
                                        <img src={item.image} alt={item.name} />
                                    </div>

                                    <div className="item-details">
                                        <h3>{item.name}</h3>
                                        <div className="item-price">${(item.price / 23000).toFixed(2)}</div>

                                        <div className="item-controls">
                                            <div className="quantity-controls">
                                                <button
                                                    onClick={() => updateQuantity(item.cartId, -1)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <FaMinus />
                                                </button>
                                                <span>{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.cartId, 1)}>
                                                    <FaPlus />
                                                </button>
                                            </div>

                                            <button className="remove-button" onClick={() => removeItem(item.cartId)}>
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
                )}
            </div>
        </div>
    );
};

export default Cart;
