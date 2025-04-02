import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "/src/styles/Payments.css";

export default function PaymentPage() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { orderId, total, paymentMethod = "Credit", email } = state || {}; // Added email

    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(paymentMethod);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Kiểm tra nếu không có orderId hoặc total, chuyển về trang checkout
        if (!orderId || !total) {
            navigate('/checkout');
        }
    }, [orderId, total, navigate]);

    const handlePayment = () => {
        setLoading(true);

        // Giả lập xử lý thanh toán
        setTimeout(() => {
            setPaymentSuccess(true);
            setLoading(false);
        }, 2000);
    };

    const handleContinueShopping = () => {
        navigate('/');
    };

    const handleViewOrder = () => {
        navigate(`/order/${orderId}`);
    };

    // Format total price
    const formattedTotal = (total / 23000).toFixed(2);

    return (
        <div className="payment-page">
            <div className="payment-card">
                {paymentSuccess ? (
                    <div className="payment-success-container">
                        <h2 className="payment-success">Congratulations! Your payment was successful.</h2>
                        <p>Order #{orderId} has been confirmed.</p>
                        <p>Email: {email}</p> {/* Display email */}
                        <div className="success-actions">
                            <button onClick={handleContinueShopping} className="continue-shopping">
                                Continue Shopping
                            </button>
                            <button onClick={handleViewOrder} className="view-order">
                                View Order
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <h2 className="payment-title">Complete Your Payment</h2>
                        <div className="payment-content">
                            <div className="payment-amount">
                                <span>Total Amount</span>
                                <p>${formattedTotal}</p>
                                <small>Order #{orderId}</small>
                                <small>Email: {email}</small> {/* Display email */}
                            </div>
                            <div className="payment-method">
                                <label>Payment Method</label>
                                <select
                                    value={selectedPaymentMethod}
                                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                >
                                    <option value="Credit">Credit Card</option>
                                    <option value="Bank">Bank Transfer</option>
                                    <option value="Momo">Momo</option>
                                    <option value="Zalo">ZaloPay</option>
                                </select>
                            </div>

                            {selectedPaymentMethod === "Credit" && (
                                <div className="card-details">
                                    <input placeholder="Card Number" type="text" />
                                    <div className="card-info">
                                        <input placeholder="MM/YY" type="text" className="expiry" />
                                        <input placeholder="CVV" type="text" className="cvv" />
                                    </div>
                                    <input placeholder="Cardholder Name" type="text" />
                                </div>
                            )}

                            <button
                                className="payment-button"
                                onClick={handlePayment}
                                disabled={loading}
                            >
                                {loading ? "Processing..." : "Confirm Payment"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
