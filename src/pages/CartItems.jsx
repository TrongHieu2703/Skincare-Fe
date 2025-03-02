// src/pages/CartItems.jsx
import React, { useEffect, useState } from 'react';
import { getCartByUser, createOrderFromCart } from '../api/cartApi';

const CartItems = () => {
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        const fetchCart = async () => {
            const items = await getCartByUser();
            setCartItems(items);
        };
        fetchCart();
    }, []);

    const handleCreateOrder = async () => {
        try {
            const orderResponse = await createOrderFromCart(cartItems);
            console.log('Order created successfully:', orderResponse);
            // Handle success (e.g., redirect to order confirmation page)
        } catch (error) {
            console.error('Error creating order:', error);
            // Handle error (e.g., show error message)
        }
    };

    return (
        <div>
            <h1>Your Cart</h1>
            <ul>
                {cartItems.map(item => (
                    <li key={item.productId}>
                        {item.productName} - Quantity: {item.quantity}
                    </li>
                ))}
            </ul>
            <button onClick={handleCreateOrder}>Create Order</button>
        </div>
    );
};

export default CartItems;
