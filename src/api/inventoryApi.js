import axiosClient from "./axiosClient";

/**
 * Lấy tất cả các kho hàng
 */
export const getAllInventories = async () => {
  try {
    const response = await axiosClient.get('/Inventory');
    return response.data;
  } catch (error) {
    console.error("Error fetching inventories:", error);
    throw error;
  }
};

/**
 * Lấy kho hàng theo ID
 */
export const getInventoryById = async (id) => {
  try {
    const response = await axiosClient.get(`/Inventory/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching inventory with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Tạo kho hàng mới
 */
export const createInventory = async (inventoryData) => {
  try {
    const response = await axiosClient.post('/Inventory', inventoryData);
    return response.data;
  } catch (error) {
    console.error("Error creating inventory:", error);
    throw error;
  }
};

/**
 * Cập nhật kho hàng
 */
export const updateInventory = async (id, inventoryData) => {
  try {
    const response = await axiosClient.put(`/Inventory/${id}`, inventoryData);
    return response.data;
  } catch (error) {
    console.error(`Error updating inventory with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Xóa kho hàng
 */
export const deleteInventory = async (id) => {
  try {
    await axiosClient.delete(`/Inventory/${id}`);
  } catch (error) {
    console.error(`Error deleting inventory with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Lấy kho hàng theo ID sản phẩm
 */
export const getInventoryByProductId = async (productId) => {
  try {
    const response = await axiosClient.get(`/Inventory/by-product/${productId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching inventory for product ID ${productId}:`, error);
    throw error;
  }
};
