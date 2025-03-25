import axiosClient from "./axiosClient";

const VOUCHER_API_URL = "https://localhost:7290/api/Voucher";

/**
 * Lấy tất cả voucher
 */
export const getAllVouchers = async () => {
    try {
        console.log("Fetching vouchers from API:", VOUCHER_API_URL);
        const response = await axiosClient.get(VOUCHER_API_URL);
        console.log("Raw voucher response:", response);
        return response;  // Return the full response to handle in the component
    } catch (error) {
        console.error('Error fetching vouchers:', error);
        throw error;
    }
};

/**
 * Lấy chi tiết voucher theo ID
 */
export const getVoucherById = async (id) => {
    try {
        const response = await axiosClient.get(`${VOUCHER_API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching voucher with ID ${id}:`, error);
        throw error;
    }
};

/**
 * Tạo voucher mới (Admin)
 */
export const createVoucher = async (voucherData) => {
    try {
        const response = await axiosClient.post(VOUCHER_API_URL, voucherData);
        return response.data;
    } catch (error) {
        console.error('Error creating voucher:', error);
        throw error;
    }
};

/**
 * Cập nhật voucher (Admin)
 */
export const updateVoucher = async (voucherId, updatedData) => {
    try {
        const response = await axiosClient.put(`${VOUCHER_API_URL}/${voucherId}`, updatedData);
        return response.data;
    } catch (error) {
        console.error(`Error updating voucher with ID ${voucherId}:`, error);
        throw error;
    }
};

/**
 * Xóa voucher (Admin)
 */
export const deleteVoucher = async (voucherId) => {
    try {
        const response = await axiosClient.delete(`${VOUCHER_API_URL}/${voucherId}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting voucher with ID ${voucherId}:`, error);
        throw error;
    }
};