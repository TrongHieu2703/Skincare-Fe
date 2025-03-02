// src/api/cartApi.js
import axios from 'axios';
const axiosClient = axios.create({
  baseURL: 'https://localhost:7290/api/Cart', // Adjust the base URL as needed
  headers: {
    'Content-Type': 'application/json',
    // Add any other headers you need
  },
});

export const addCart = async (productId, quantity) => {
  const response = await axiosClient.post('/api/cart', {
    productId,
    quantity,
  });
  return response.data;
};

export const getAllCarts = async () => {
  const response = await axiosClient.get('/api/cart/user');
  return response.data; // Mảng cart item
};

// Lấy cart của user hiện tại


export const getCartByUser = async () => {
  const response = await axiosClient.get('/api/cart/user');
  return response.data; // Mảng cart item
};

export const createOrderFromCart = async (cartItems) => {
  const orderData = {
    customerId: 1, // Example customer ID
    voucherId: 0,
    totalPrice: cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    discountPrice: 0,
    isPrepaid: true,
    status: "Pending",
    orderItems: cartItems.map(item => ({
      productId: item.productId,
      itemQuantity: item.quantity,
    })),
    transactions: [{
      transactionId: 0,
      orderId: 0,
      paymentMethod: "Credit Card", // Example payment method
      status: "Pending",
      amount: cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
      createdDate: new Date().toISOString(),
    }],
  };

  const response = await axiosClient.post('/api/Order', orderData);
  return response.data;
};


// Cập nhật giỏ hàng
export const updateCart = async (cartId, productId, quantity) => {
  const response = await axiosClient.put(`/api/cart/${cartId}`, {
    productId,
    quantity,
  });
  return response.data;
};

// Xóa 1 item khỏi giỏ
export const deleteCartItem = async (cartId) => {
  await axiosClient.delete(`/api/cart/${cartId}`);
};
