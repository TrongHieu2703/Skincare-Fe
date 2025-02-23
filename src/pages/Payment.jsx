import { useState } from "react";
import "/src/styles/Payments.css";

export default function PaymentPage() {
    const [paymentMethod, setPaymentMethod] = useState("credit_card");
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const handlePayment = () => {
        setPaymentSuccess(true);
    };

    return (
        <div className="payment-page">
            <div className="payment-card">
                {paymentSuccess ? (
                    <h2 className="payment-success">Congratulations! Your payment was successful.</h2>
                ) : (
                    <>
                        <h2 className="payment-title">Payment Information</h2>
                        <div className="payment-content">
                            <div className="payment-amount">
                                <span>Total Amount</span>
                                <p>$40.43</p>
                            </div>
                            <div className="payment-method">
                                <label>Payment Method</label>
                                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                                    <option value="credit_card">Credit Card</option>
                                    <option value="paypal">PayPal</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                </select>
                            </div>

                            {paymentMethod === "credit_card" && (
                                <div className="card-details">
                                    <input placeholder="Card Number" type="text" />
                                    <div className="card-info">
                                        <input placeholder="MM/YY" type="text" className="expiry" />
                                        <input placeholder="CVV" type="text" className="cvv" />
                                    </div>
                                    <input placeholder="Cardholder Name" type="text" />
                                </div>
                            )}

                            <button className="payment-button" onClick={handlePayment}>Confirm Payment</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
