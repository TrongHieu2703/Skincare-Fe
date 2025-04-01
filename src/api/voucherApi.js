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
<<<<<<< Updated upstream
=======
        
        // Check for shipping vouchers in the response
        if (response && response.data && response.data.data) {
            const shippingVouchers = response.data.data.filter(v => 
                !v.isPercent && v.value === 0
            );
            console.log("Shipping vouchers in getAllVouchers response:", shippingVouchers);
        }
        
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
=======
// Add a helper function to parse voucher data consistently
const parseVoucherData = (response) => {
  let vouchers = [];
  
  if (response && response.data) {
    // Handle nested data structure
    if (response.data.data && Array.isArray(response.data.data)) {
      vouchers = response.data.data;
    } 
    // Handle direct array
    else if (Array.isArray(response.data)) {
      vouchers = response.data;
    }
  }
  
  // Log what we found for debugging
  console.log("Parsed vouchers:", vouchers);
  
  // Log shipping vouchers specifically
  const shippingVouchers = vouchers.filter(v => !v.isPercent && v.value === 0);
  console.log("Shipping vouchers:", shippingVouchers);
  
  return vouchers;
};

>>>>>>> Stashed changes
/**
 * Lấy voucher có sẵn (Customer)
 */
export const getAvailableVouchers = async () => {
    try {
        console.log("Fetching available vouchers from API:", VOUCHER_API_URL + "/available");
        const response = await axiosClient.get(`${VOUCHER_API_URL}/available`);
<<<<<<< Updated upstream
        console.log("Available vouchers response:", response);
        return response;
=======
        console.log("Available vouchers raw response:", response);
        
        // Parse voucher data consistently
        const vouchers = parseVoucherData(response);
        
        // Log details of each voucher
        console.log("Detailed voucher information:");
        vouchers.forEach(v => {
            console.log(`Voucher ID: ${v.voucherId}, Name: ${v.name}, Code: ${v.code}, ` + 
                `isPercent: ${v.isPercent}, value: ${v.value}, ` +
                `Is shipping voucher: ${!v.isPercent && v.value === 0}`);
        });
        
        // Prepare the response in a consistent format
        return { 
            data: { 
                message: "Fetched available vouchers successfully", 
                data: vouchers 
            } 
        };
>>>>>>> Stashed changes
    } catch (error) {
        console.error('Error fetching available vouchers:', error);
        
        // If the /available endpoint fails, try the main endpoint as fallback
        if (error.response && error.response.status === 400) {
            console.log("Falling back to main voucher endpoint due to routing error");
            try {
                // Get all vouchers and filter client-side
                const allVouchersResponse = await axiosClient.get(VOUCHER_API_URL);
                console.log("Fallback vouchers response:", allVouchersResponse);
                
<<<<<<< Updated upstream
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
=======
                const allVouchers = parseVoucherData(allVouchersResponse);
                
                // Client-side filtering of available vouchers
                const now = new Date();
                now.setHours(0, 0, 0, 0); // Set to start of day
                
                const availableVouchers = allVouchers.filter(v => {
                    // Get the start date, set to beginning of day
                    const startedAt = new Date(v.startedAt);
                    startedAt.setHours(0, 0, 0, 0);
                    
                    // Get the expiry date, set to beginning of day for date comparison only
                    const expiredAt = v.expiredAt ? new Date(v.expiredAt) : null;
                    if (expiredAt) {
                        expiredAt.setHours(0, 0, 0, 0);
                    }
                    
                    // Compare only the date parts
                    // A voucher is available if:
                    // 1. It has started (start date <= today)
                    // 2. It hasn't expired (expiry date >= today or isInfinity=true)
                    // 3. It has available quantity (quantity > 0 or isInfinity=true)
                    const hasStarted = startedAt <= now;
                    const hasNotExpired = v.isInfinity || !expiredAt || expiredAt >= now;
                    const hasQuantity = v.isInfinity || v.quantity > 0;
                    
                    return hasStarted && hasNotExpired && hasQuantity;
                });
                
                console.log("Client-side filtered vouchers:", availableVouchers);
                
                // Log shipping vouchers specifically for debugging
                const shippingVouchers = availableVouchers.filter(v => 
                    !v.isPercent && v.value === 0
                );
                console.log("Shipping vouchers found:", shippingVouchers);
                
                // Log details of each voucher for debugging
                console.log("Detailed available voucher information:");
                availableVouchers.forEach(v => {
                    console.log(`Voucher ID: ${v.voucherId}, Name: ${v.name}, Code: ${v.code}, ` + 
                        `isPercent: ${v.isPercent}, value: ${v.value}, ` +
                        `Is shipping voucher: ${!v.isPercent && v.value === 0}`);
                });
                
                return { 
                    data: { 
                        message: "Fetched available vouchers with client-side filtering", 
                        data: availableVouchers 
                    } 
                };
>>>>>>> Stashed changes
            } catch (fallbackError) {
                console.error('Error in fallback voucher fetch:', fallbackError);
            }
        }
        
        throw error;
    }
};