// src/api/cartApi.js
import axios from 'axios';

const API_URL = "https://localhost:7290/api/Cart";

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to automatically add token to header
axiosClient.interceptors.request.use(config => {
  const token = localStorage.getItem("token"); // Retrieve token from localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Function to fetch the user's cart
export const getCartByUser = async () => {
  try {
    const token = localStorage.getItem("token"); // Debugging log


    console.log("Token retrieved:", token); // Log the token
    console.log("Local Storage:", localStorage); // Log the entire localStorage
    const response = await axiosClient.get('/user');


    return response.data;
  } catch (error) {
    console.error("❌ Error fetching cart:", error.response?.data || error.message);


    throw error;
  }
};

// ✅ Thêm sản phẩm vào giỏ hàng
export const addCart = async (productId, quantity) => {
  const response = await axiosClient.post('/add', { productId, quantity });
  return response.data;
};

// ✅ Tạo đơn hàng từ giỏ hàng
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
      paymentMethod: "Credit Card",
      status: "Pending",
      amount: cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
      createdDate: new Date().toISOString(),
    }],
  };

  try {
    const response = await axiosClient.post('/order', orderData);
    return response.data;
  } catch (error) {
    console.error("❌ Error creating order:", error);
    throw error;
  }
};

// ✅ Cập nhật giỏ hàng
export const updateCart = async (cartId, productId, quantity) => {
  const response = await axiosClient.put(`/update/${cartId}`, { productId, quantity });
  return response.data;
};

// ✅ Xóa 1 item khỏi giỏ
export const deleteCartItem = async (cartId) => {
  await axiosClient.delete(`/delete/${cartId}`);
};
