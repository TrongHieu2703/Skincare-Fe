import React, { useEffect, useState } from 'react';
import { getCartByUser, createOrderFromCart } from '../api/cartApi';

const CartItems = () => {
    const [cartItems, setCartItems] = useState(location.state?.cartItems || []);


    useEffect(() => {
        if (!location.state?.cartItems) {
            const fetchCart = async () => {
                try {
                    const items = await getCartByUser();
                    setCartItems(items);
                } catch (error) {
                    console.error('Error fetching cart items:', error);
                    alert('Unable to fetch cart items. Please ensure you are logged in.');

                }
            };

            fetchCart(); // ✅ Gọi hàm đúng chỗ
        }
    }, [location.state]); // ✅ Đúng cú pháp


    const handleCreateOrder = async () => {
        try {
            const orderResponse = await createOrderFromCart(cartItems);
            console.log('Order created successfully:', orderResponse);
            // ✅ Sau khi tạo order thành công, có thể làm sạch giỏ hàng
            setCartItems([]);
        } catch (error) {
            console.error('Error creating order:', error);
        }
    };

    return (
        <div>
            <h1>Your Cart</h1>
            {cartItems.length > 0 ? (
                <ul>
                    {cartItems.map(item => (
                        <li key={item.productId}>
                            {item.productName} - Quantity: {item.quantity}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Your cart is empty.</p> // ✅ Hiển thị nếu giỏ hàng trống
            )}
            <button onClick={handleCreateOrder} disabled={cartItems.length === 0}>
                Create Order
            </button>
        </div>
    );
};

export default CartItems;
