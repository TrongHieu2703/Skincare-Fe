import axiosClient from './axiosClient';

const dashboardApi = {
  /**
   * Get comprehensive dashboard statistics with time filtering
   * @param {string} timeRange - Time range (24h, 7d, 30d, 12m, all)
   * @param {Date} customStartDate - Optional custom start date
   * @param {Date} customEndDate - Optional custom end date
   * @returns {Promise<Object>} Dashboard statistics
   */
  getAllStats: (timeRange = '30d', customStartDate = null, customEndDate = null) => {
    const params = { timeRange };
    
    if (customStartDate) {
      params.customStartDate = customStartDate.toISOString();
    }
    
    if (customEndDate) {
      params.customEndDate = customEndDate.toISOString();
    }
    
    return axiosClient.get('/dashboard/stats', { params });
  },
  
  /**
   * Get product-related statistics only
   * @param {Date} startDate - Optional start date
   * @param {Date} endDate - Optional end date
   * @returns {Promise<Object>} Product statistics
   */
  getProductStats: (startDate = null, endDate = null) => {
    const params = {};
    
    if (startDate) {
      params.startDate = startDate.toISOString();
    }
    
    if (endDate) {
      params.endDate = endDate.toISOString();
    }
    
    return axiosClient.get('/dashboard/products', { params });
  },
  
  /**
   * Get customer-related statistics only
   * @param {Date} startDate - Optional start date
   * @param {Date} endDate - Optional end date
   * @returns {Promise<Object>} Customer statistics
   */
  getCustomerStats: (startDate = null, endDate = null) => {
    const params = {};
    
    if (startDate) {
      params.startDate = startDate.toISOString();
    }
    
    if (endDate) {
      params.endDate = endDate.toISOString();
    }
    
    return axiosClient.get('/dashboard/customers', { params });
  },
  
  /**
   * Get order-related statistics only
   * @param {Date} startDate - Optional start date
   * @param {Date} endDate - Optional end date
   * @param {string} interval - Time interval for charts (hour, day, month, year)
   * @returns {Promise<Object>} Order statistics
   */
  getOrderStats: (startDate = null, endDate = null, interval = 'day') => {
    const params = { interval };
    
    if (startDate) {
      params.startDate = startDate.toISOString();
    }
    
    if (endDate) {
      params.endDate = endDate.toISOString();
    }
    
    return axiosClient.get('/dashboard/orders', { params });
  },
  
  /**
   * Get revenue-related statistics only
   * @param {Date} startDate - Optional start date
   * @param {Date} endDate - Optional end date
   * @param {string} interval - Time interval for charts (hour, day, month, year)
   * @returns {Promise<Object>} Revenue statistics
   */
  getRevenueStats: (startDate = null, endDate = null, interval = 'day') => {
    const params = { interval };
    
    if (startDate) {
      params.startDate = startDate.toISOString();
    }
    
    if (endDate) {
      params.endDate = endDate.toISOString();
    }
    
    return axiosClient.get('/dashboard/revenue', { params });
  },
  
  /**
   * Get best selling products
   * @param {Date} startDate - Optional start date
   * @param {Date} endDate - Optional end date
   * @param {number} limit - Number of products to return
   * @returns {Promise<Array>} List of best selling products
   */
  getBestSellers: (startDate = null, endDate = null, limit = 5) => {
    const params = { limit };
    
    if (startDate) {
      params.startDate = startDate.toISOString();
    }
    
    if (endDate) {
      params.endDate = endDate.toISOString();
    }
    
    return axiosClient.get('/dashboard/bestsellers', { params });
  },
  
  /**
   * Get top rated products
   * @param {number} limit - Number of products to return
   * @returns {Promise<Array>} List of top rated products
   */
  getTopRated: (limit = 5) => {
    return axiosClient.get('/dashboard/toprated', { params: { limit } });
  }
};

export default dashboardApi; 