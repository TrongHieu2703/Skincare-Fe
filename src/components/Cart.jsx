import React, { useState } from "react";
import "./Cart.css";

const Cart = () => {
    // Example cart data with initial items
    const [cartItems, setCartItems] = useState([
        {
            id: 1,
            name: "Serum Dưỡng Ẩm",
            price: 450000,
            image: "./src/images/sampham1.jpg",
            quantity: 1,
        },
        {
            id: 2,
            name: "Kem Chống Nắng SPF50+",
            price: 380000,
            image: "./src/images/sampham2.jpg",
            quantity: 1,
        },
        {
            id: 3,
            name: "Sữa Rửa Mặt Dịu Nhẹ",
            price: 250000,
            image: "./src/images/sampham3.jpg",
            quantity: 1,
        },
    ]);

    // Function to add a product to the cart
    const addToCart = (item) => {
        const existingItem = cartItems.find((cartItem) => cartItem.id === item.id);

        if (existingItem) {
            // If item exists, increase quantity
            setCartItems(
                cartItems.map((cartItem) =>
                    cartItem.id === item.id
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem
                )
            );
        } else {
            // If item doesn't exist, add a new entry with quantity = 1
            setCartItems([...cartItems, { ...item, quantity: 1 }]);
        }
    };

    return (
        <div className="cart-container">
            <h2>Shopping Cart</h2>
            {cartItems.length === 0 ? (
                <p className="empty-cart">Your cart is empty.</p>
            ) : (
                <ul className="cart-list">
                    {cartItems.map((item) => (
                        <li key={item.id} className="cart-item">
                            <img
                                src={item.image}
                                alt={item.name}
                                className="cart-item-image"
                            />
                            <div className="cart-item-info">
                                <h3>{item.name}</h3>
                                <p>{item.price.toLocaleString()} VND</p>
                                <p>Quantity: {item.quantity}</p>
                            </div>
                            <button
                                className="add-btn"
                                onClick={() => addToCart(item)}
                            >
                                Add to Cart
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Cart;
