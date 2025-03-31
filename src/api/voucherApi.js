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
        return response;
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
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        const response = await axiosClient.post(VOUCHER_API_URL, voucherData, config);
        return response;
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
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        const response = await axiosClient.put(`${VOUCHER_API_URL}/${voucherId}`, updatedData, config);
        return response;
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
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        const response = await axiosClient.delete(`${VOUCHER_API_URL}/${voucherId}`, config);
        return response;
    } catch (error) {
        console.error(`Error deleting voucher with ID ${voucherId}:`, error);
        throw error;
    }
};

/**
 * Lấy voucher có sẵn (Customer)
 */
export const getAvailableVouchers = async () => {
    try {
        console.log("Fetching available vouchers from API:", VOUCHER_API_URL + "/available");
        const response = await axiosClient.get(`${VOUCHER_API_URL}/available`);
        console.log("Available vouchers response:", response);
        return response;
    } catch (error) {
        console.error('Error fetching available vouchers:', error);
        
        // If the /available endpoint fails, try the main endpoint as fallback
        if (error.response && error.response.status === 400) {
            console.log("Falling back to main voucher endpoint due to routing error");
            try {
                // Get all vouchers and filter client-side
                const allVouchersResponse = await axiosClient.get(VOUCHER_API_URL);
                console.log("Fallback vouchers response:", allVouchersResponse);
                
                if (allVouchersResponse && allVouchersResponse.data) {
                    const vouchersData = Array.isArray(allVouchersResponse.data) 
                      ? allVouchersResponse.data 
                      : (allVouchersResponse.data.data || []);
                    
                    // Client-side filtering of available vouchers
                    const now = new Date();
                    const availableVouchers = vouchersData.filter(v => {
                        const expiredAt = new Date(v.expiredAt);
                        const startedAt = new Date(v.startedAt);
                        return (expiredAt > now) && 
                               (startedAt <= now) && 
                               (v.isInfinity || v.quantity > 0);
                    });
                    
                    console.log("Client-side filtered vouchers:", availableVouchers);
                    return { 
                        data: { 
                            message: "Fetched available vouchers with client-side filtering", 
                            data: availableVouchers 
                        } 
                    };
                }
            } catch (fallbackError) {
                console.error('Error in fallback voucher fetch:', fallbackError);
            }
        }
        
        throw error;
    }
};