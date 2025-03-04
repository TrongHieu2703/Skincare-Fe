import axiosClient from "./axiosClient";

const BASE_URL = "/Order";

// Lấy tất cả đơn hàng
export const getAllOrders = async () => {
  const response = await axiosClient.get(BASE_URL);
  return response.data;
};

// Lấy đơn hàng theo ID
export const getOrderById = async (id) => {
  try {
    console.log(`Fetching order with ID: ${id}`);
    const response = await axiosClient.get(`${BASE_URL}/${id}`);
    console.log('Order fetch response:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order with ID ${id}:`, error);
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw new Error(error.message || `Error fetching order with ID ${id}`);
  }
};

// Tạo đơn hàng mới
export const createOrder = async (orderData) => {
  try {
    // Kiểm tra token trước khi gọi API
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("No token found when creating order");
      throw new Error("Authentication required");
    }
    
    console.log("Creating order with data:", orderData);
    console.log("Payment method:", orderData.transactions[0].paymentMethod);
    console.log("Token exists:", !!token);
    
    const response = await axiosClient.post(BASE_URL, orderData);
    console.log("Create order response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Create order error:", error);
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw new Error(error.message || "Error creating order");
  }
};

// Cập nhật đơn hàng
export const updateOrder = async (id, orderData) => {
  const response = await axiosClient.put(`${BASE_URL}/${id}`, orderData);
  return response.data;
};

// Xóa đơn hàng
export const deleteOrder = async (id) => {
  await axiosClient.delete(`${BASE_URL}/${id}`);
};

// Lấy lịch sử đơn hàng của người dùng
export const getUserOrders = async () => {
  try {
    const response = await axiosClient.get(`${BASE_URL}/user`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw new Error(error.message || 'Error fetching user orders');
  }
};

// Lấy chi tiết đơn hàng an toàn
export const getOrderDetail = async (id) => {
  try {
    console.log(`Fetching safe order details for ID: ${id}`);
    const response = await axiosClient.get(`${BASE_URL}/detail/${id}`);
    console.log('Safe order details response:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching safe order details with ID ${id}:`, error);
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw new Error(error.message || `Error fetching order details with ID ${id}`);
  }
};
