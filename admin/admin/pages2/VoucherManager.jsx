import React, { useState, useEffect, useCallback } from "react";
import styles from "./VoucherManager.module.css";
import Sidebar from "./Sidebar";
import { FaEdit, FaTrash, FaPlus, FaTicketAlt, FaSearch, FaFilter, FaRedo, FaSort, FaCalendar } from "react-icons/fa";
import { message, Button, Form, Input, Select, DatePicker, InputNumber, Checkbox, Spin, Tooltip } from "antd";
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "/src/auth/AuthProvider";
import ConfirmationModal from "/src/components/ConfirmationModal";

// Import API functions
import {
  getAllVouchers,
  getVoucherById,
  createVoucher,
  updateVoucher,
  deleteVoucher
} from "/src/api/voucherApi";

const { Option } = Select;
const { RangePicker } = DatePicker;

const VoucherManager = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, checkTokenExpiration, loading: authLoading } = useAuth();

  // State for vouchers list
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    totalItems: 0
  });

  // State for form
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  // State for filters
  const [searchKeyword, setSearchKeyword] = useState("");
  const [voucherTypeFilter, setVoucherTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortOption, setSortOption] = useState("dateDesc");

  // Success notification
  const [successMessage, setSuccessMessage] = useState("");
  const [showNotification, setShowNotification] = useState(false);

  // Add state for delete confirmation modal
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, voucherId: null, voucherName: '' });

  // Add these lines at the beginning of the component
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");

  // Voucher types mapping
  const voucherTypes = {
    "percentage": "Giảm theo phần trăm",
    "fixed": "Giảm số tiền cố định",
    "shipping": "Miễn phí vận chuyển"
  };

  // Check authentication on component mount
  useEffect(() => {
    // Wait until authentication check is complete before redirecting
    if (authLoading) return;
    
    // Only redirect if explicitly not authenticated (not on initial loading state)
    if (isAuthenticated === false) {
      navigate('/login');
      return;
    }
    
    if (isAuthenticated && !isAdmin) {
      message.error("Bạn không có quyền truy cập trang này!");
      navigate('/');
      return;
    }
  }, [isAuthenticated, isAdmin, navigate, authLoading]);

  // Fetch vouchers on component mount and when pagination changes
  useEffect(() => {
    // Don't fetch data while auth is loading or if not authenticated
    if (authLoading || !isAuthenticated) return;
    
    fetchVouchers();
  }, [pagination.currentPage, isAuthenticated, authLoading]);

  // Effect for when filters change
  useEffect(() => {
    // Don't apply filters while auth is loading or if not authenticated
    if (authLoading || !isAuthenticated) return;
    
    if (pagination.currentPage !== 1) {
      setPagination(prev => ({ ...prev, currentPage: 1 }));
    } else {
      fetchVouchers();
    }
  }, [searchKeyword, voucherTypeFilter, statusFilter, startDate, endDate, sortOption, isAuthenticated, authLoading]);

  // Fetch vouchers
  const fetchVouchers = async () => {
    try {
      setLoading(true);
      
      // Validate token before making API call
      if (!checkTokenExpiration()) {
        setLoading(false);
        return;
      }
      
      const response = await getAllVouchers();
      
      if (response && response.data && response.data.data) {
        // Get the vouchers array from the nested response structure
        const vouchersArray = response.data.data;
        console.log("Vouchers array:", vouchersArray);
        
        // Process and filter vouchers
        let filteredVouchers = applyFilters(vouchersArray);
        
        // Calculate total pages
        const totalPages = Math.ceil(filteredVouchers.length / pagination.pageSize);
        
        // Get current page data
        const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
        const paginatedVouchers = filteredVouchers.slice(
          startIndex, 
          startIndex + pagination.pageSize
        );
        
        setVouchers(paginatedVouchers);
        setPagination(prev => ({
          ...prev,
          totalItems: filteredVouchers.length,
          totalPages: Math.max(1, totalPages)
        }));
      } else {
        console.error("Invalid response format:", response);
        setVouchers([]);
        setPagination(prev => ({
          ...prev,
          totalItems: 0,
          totalPages: 1
        }));
      }
    } catch (error) {
      console.error("Error fetching vouchers:", error);
      message.error("Không thể tải danh sách voucher");
      setVouchers([]);
      setPagination(prev => ({
        ...prev,
        totalItems: 0,
        totalPages: 1
      }));
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to vouchers
  const applyFilters = (voucherList) => {
    // Check if voucherList is an array
    if (!Array.isArray(voucherList)) {
      console.error("Expected voucher list to be an array, got:", voucherList);
      return [];
    }
    
    // Return original list if no filters are applied
    if (!searchKeyword && !voucherTypeFilter && !statusFilter && !startDate && !endDate && !sortOption) {
      return voucherList;
    }

    let filtered = [...voucherList];

    // Search filter
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(voucher => 
        (voucher.name && voucher.name.toLowerCase().includes(keyword)) || 
        (voucher.code && voucher.code.toLowerCase().includes(keyword))
      );
    }

    // Voucher type filter
    if (voucherTypeFilter) {
      if (voucherTypeFilter === "percentage") {
        filtered = filtered.filter(voucher => voucher.isPercent === true);
      } else if (voucherTypeFilter === "fixed") {
        filtered = filtered.filter(voucher => voucher.isPercent === false && voucher.value > 0);
      } else if (voucherTypeFilter === "shipping") {
        // Shipping vouchers have isPercent=false and value=0
        filtered = filtered.filter(voucher => 
          voucher.isPercent === false && voucher.value === 0
        );
      }
    }

    // Status filter (active/expired)
    if (statusFilter) {
      const now = new Date();
      if (statusFilter === "active") {
        filtered = filtered.filter(voucher => {
          const isStarted = new Date(voucher.startedAt) <= now;
          const isNotExpired = voucher.isInfinity || !voucher.expiredAt || new Date(voucher.expiredAt) > now;
          const hasQuantity = voucher.quantity > 0;
          return isStarted && isNotExpired && hasQuantity;
        });
      } else if (statusFilter === "expired") {
        filtered = filtered.filter(voucher => {
          const isExpired = voucher.expiredAt && new Date(voucher.expiredAt) <= now;
          const isOutOfStock = voucher.quantity <= 0;
          return isExpired || isOutOfStock;
        });
      }
    }

    // Date range filter
    if (startDate || endDate) {
      filtered = filtered.filter(voucher => {
        const voucherStartDate = new Date(voucher.startedAt);
        voucherStartDate.setHours(0, 0, 0, 0);
        
        // Apply start date filter if it exists
        if (startDate && !endDate) {
          const filterStartDate = new Date(startDate);
          filterStartDate.setHours(0, 0, 0, 0);
          return voucherStartDate >= filterStartDate;
        }
        
        // Apply end date filter if it exists
        if (endDate && !startDate) {
          const filterEndDate = new Date(endDate);
          filterEndDate.setHours(0, 0, 0, 0);
          return voucherStartDate <= filterEndDate;
        }
        
        // Apply both filters if both exist
        if (startDate && endDate) {
          const filterStartDate = new Date(startDate);
          const filterEndDate = new Date(endDate);
          filterStartDate.setHours(0, 0, 0, 0);
          filterEndDate.setHours(0, 0, 0, 0);
          return voucherStartDate >= filterStartDate && voucherStartDate <= filterEndDate;
        }
        
        return true;
      });
    }

    // Sort options
    if (sortOption) {
      if (sortOption === "nameAsc") {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortOption === "nameDesc") {
        filtered.sort((a, b) => b.name.localeCompare(a.name));
      } else if (sortOption === "dateAsc") {
        filtered.sort((a, b) => new Date(a.startedAt) - new Date(b.startedAt));
      } else if (sortOption === "dateDesc") {
        filtered.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
      } else if (sortOption === "valueAsc") {
        filtered.sort((a, b) => a.value - b.value);
      } else if (sortOption === "valueDesc") {
        filtered.sort((a, b) => b.value - a.value);
      }
    }

    return filtered;
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      // Check token validity before submitting
      if (!checkTokenExpiration()) {
        return;
      }
      
      setSubmitting(true);
      
      // Get dates from form values instead of state
      const formStartDate = values.startDate;
      const formEndDate = values.endDate;
      
      // Validate dates
      if (!formStartDate) {
        message.error("Vui lòng chọn ngày bắt đầu");
        setSubmitting(false);
        return;
      }
      
      if (!values.isInfinity && !formEndDate) {
        message.error("Vui lòng chọn ngày kết thúc hoặc chọn 'Không giới hạn thời gian'");
        setSubmitting(false);
        return;
      }
      
      // Validate end date is after start date
      if (!values.isInfinity && formEndDate && new Date(formEndDate) <= new Date(formStartDate)) {
        message.error("Ngày kết thúc phải sau ngày bắt đầu");
        setSubmitting(false);
        return;
      }
      
      // Format dates correctly to avoid timezone issues
      const startDateObj = new Date(formStartDate);
      // Set hours to noon (12:00) to avoid timezone boundary issues
      startDateObj.setHours(12, 0, 0, 0);
      
      let endDateObj = null;
      if (!values.isInfinity && formEndDate) {
        endDateObj = new Date(formEndDate);
        // Set to end of day in local time to include the full day
        endDateObj.setHours(23, 59, 59, 999);
      }
      
      // Prepare data for API
      const voucherData = {
        name: values.name,
        code: values.code,
        isPercent: values.voucherType === "percentage",
        minOrderValue: values.minOrderValue || 0,
        value: values.voucherType === "shipping" ? 0 : values.value,
        maxDiscountValue: values.voucherType === "percentage" ? values.maxDiscountValue : null,
        startedAt: startDateObj.toISOString(),
        expiredAt: values.isInfinity ? null : endDateObj.toISOString(),
        isInfinity: values.isInfinity || false,
        quantity: values.quantity || 1,
        pointCost: values.pointCost || 0
      };

      let response;
      if (editMode) {
        // Update existing voucher
        response = await updateVoucher(values.voucherId, voucherData);
        setSuccessMessage("Cập nhật voucher thành công!");
      } else {
        // Create new voucher
        response = await createVoucher(voucherData);
        setSuccessMessage("Thêm voucher mới thành công!");
      }

      // Show success notification
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);

      // Reset form and close
      form.resetFields();
      setShowForm(false);
      setEditMode(false);
      
      // Refetch vouchers
      fetchVouchers();
    } catch (error) {
      console.error("Error submitting voucher:", error);
      if (error.response && error.response.status === 401) {
        message.error("Bạn không có quyền thực hiện thao tác này!");
        navigate('/login');
      } else {
        message.error(editMode ? "Lỗi khi cập nhật voucher" : "Lỗi khi thêm voucher mới");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle form cancel
  const handleCancel = () => {
    form.resetFields();
    setShowForm(false);
    setEditMode(false);
  };

  // Handle edit voucher
  const handleEdit = async (voucherId) => {
    try {
      // Check token validity
      if (!checkTokenExpiration()) {
        return;
      }
      
      setLoading(true);
      const response = await getVoucherById(voucherId);
      
      if (response && response.data && response.data.data) {
        const voucher = response.data.data;
        
        // Parse dates properly to prevent timezone shifts
        // Extract the YYYY-MM-DD part directly from the API date string
        // This preserves the exact date without timezone adjustments
        const startDateStr = voucher.startedAt.substring(0, 10);
        
        let endDateStr = "";
        if (!voucher.isInfinity && voucher.expiredAt) {
          endDateStr = voucher.expiredAt.substring(0, 10);
        }
        
        console.log("API date:", voucher.startedAt, "Formatted date:", startDateStr);
        
        // Store dates in local state
        setFormStartDate(startDateStr);
        setFormEndDate(endDateStr);
        
        // Determine voucher type - SIMPLIFIED LOGIC BASED ONLY ON PROPERTIES
        let voucherType = "fixed";
        if (voucher.isPercent) {
          voucherType = "percentage";
        } else if (voucher.value === 0) {
          // Shipping vouchers have isPercent=false and value=0
          voucherType = "shipping";
        }
        
        // Log detected voucher type
        console.log("Detected voucher type:", voucherType, "for voucher:", voucher);
        
        // Reset form before setting new values to clear previous state
        form.resetFields();
        
        // Set form values
        form.setFieldsValue({
          voucherId: voucher.voucherId,
          name: voucher.name,
          code: voucher.code,
          voucherType: voucherType,
          value: voucher.value,
          minOrderValue: voucher.minOrderValue,
          maxDiscountValue: voucher.maxDiscountValue,
          isInfinity: voucher.isInfinity,
          startDate: startDateStr, // Add to form values
          endDate: endDateStr, // Add to form values
          quantity: voucher.quantity,
          pointCost: voucher.pointCost
        });
        
        setShowForm(true);
        setEditMode(true);
      } else {
        console.error("Invalid response format:", response);
        message.error("Không thể tải thông tin voucher");
      }
    } catch (error) {
      console.error("Error fetching voucher details:", error);
      message.error("Có lỗi xảy ra khi tải thông tin voucher");
    } finally {
      setLoading(false);
    }
  };

  // Update handle delete voucher to show confirmation modal
  const handleDelete = async (voucherId) => {
    try {
      // Check token validity
      if (!checkTokenExpiration()) {
        return; // No need to show a message here as checkTokenExpiration will handle it
      }
      
      await deleteVoucher(voucherId);
      message.success("Xóa voucher thành công");
      fetchVouchers();
    } catch (error) {
      console.error("Error deleting voucher:", error);
      if (error.response && error.response.status === 401) {
        message.error("Bạn không có quyền thực hiện thao tác này!");
        navigate('/login');
      } else {
        message.error("Lỗi khi xóa voucher");
      }
    }
  };

  // New function to show delete confirmation modal
  const showDeleteConfirmation = (voucherId, voucherName) => {
    setDeleteModal({
      isOpen: true,
      voucherId,
      voucherName
    });
  };
  
  // New function to close delete confirmation modal
  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      voucherId: null,
      voucherName: ''
    });
  };
  
  // New function to confirm delete
  const confirmDeleteVoucher = async () => {
    if (deleteModal.voucherId) {
      await handleDelete(deleteModal.voucherId);
    }
  };

  // Replace or update the date-related functions
  const generateVoucherCode = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit number
    const timestamp = Date.now().toString().slice(-4); // last 4 digits of timestamp
    return `SALE${randomNum}${timestamp}`;
  };

  // Update the handleShowAddForm function to set dates in the form state as well
  const handleShowAddForm = () => {
    // Generate voucher code
    const newCode = generateVoucherCode();
    
    // Set today and 30 days later as default dates using YYYY-MM-DD format
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);
    
    const todayStr = today.toISOString().split('T')[0];
    const thirtyDaysLaterStr = thirtyDaysLater.toISOString().split('T')[0];
    
    // Set dates in local state
    setFormStartDate(todayStr);
    setFormEndDate(thirtyDaysLaterStr);
    
    // Reset form fields including the hidden dates
    form.resetFields();
    
    // Set initial form values
    form.setFieldsValue({
      code: newCode,
      isInfinity: false,
      startDate: todayStr, // Add to form values
      endDate: thirtyDaysLaterStr // Add to form values
    });
    
    setShowForm(true);
    setEditMode(false);
  };

  // Handle pagination change
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  // Update handleResetFilters to clear the individual date states
  const handleResetFilters = () => {
    setSearchKeyword("");
    setVoucherTypeFilter("");
    setStatusFilter("");
    setStartDate("");
    setEndDate("");
    setSortOption("dateDesc");
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Check if a voucher is active
  const isVoucherActive = (voucher) => {
    // Get today's date at 00:00:00
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get start date at 00:00:00
    const startDate = new Date(voucher.startedAt);
    startDate.setHours(0, 0, 0, 0);
    
    // Check if voucher has started
    const isStarted = startDate <= today;
    
    // Check if voucher has expired
    let isNotExpired = voucher.isInfinity;
    if (!isNotExpired && voucher.expiredAt) {
      const expiredDate = new Date(voucher.expiredAt);
      expiredDate.setHours(0, 0, 0, 0);
      // Consider the voucher valid throughout its expiry date
      isNotExpired = expiredDate >= today;
    }
    
    // Check quantity
    const hasQuantity = voucher.quantity > 0;
    
    return isStarted && isNotExpired && hasQuantity;
  };

  // Fix the getVoucherStatus function to properly handle expiry times
  const getVoucherStatus = (voucher) => {
    // Get today's date at 00:00:00
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get start date at 00:00:00
    const startDate = new Date(voucher.startedAt);
    startDate.setHours(0, 0, 0, 0);
    
    // Check quantity
    const hasQuantity = voucher.quantity > 0;
    
    // Check expiry date - compare only the date part
    let expiredAt = null;
    if (voucher.expiredAt) {
      expiredAt = new Date(voucher.expiredAt);
      expiredAt.setHours(0, 0, 0, 0);
    }
    
    // If the voucher has no quantity left
    if (!hasQuantity) {
      return {
        status: "expired",
        label: "Hết lượt"
      };
    }
    
    // If the start date is in the future, it's pending
    if (startDate > today) {
      return {
        status: "pending",
        label: "Chưa kích hoạt"
      };
    }
    
    // If the voucher is infinity or has no expiry date, and has started
    if ((voucher.isInfinity || !expiredAt) && startDate <= today) {
      return {
        status: "active",
        label: "Còn hạn"
      };
    }
    
    // If the expiry date has passed (comparing date parts only)
    if (expiredAt && expiredAt < today) {
      return {
        status: "expired",
        label: "Hết hạn"
      };
    }
    
    // If the voucher has started and hasn't expired yet (comparing date parts)
    if (startDate <= today && (!expiredAt || expiredAt >= today)) {
      return {
        status: "active",
        label: "Còn hạn"
      };
    }
    
    // Default case (shouldn't reach here normally)
    return {
      status: "unknown",
      label: "Không xác định"
    };
  };

  // Format voucher value for display
  const formatVoucherValue = (voucher) => {
    if (voucher.isPercent) {
      return `${voucher.value}%`;
    } else if (voucher.value === 0) {
      return "Miễn phí vận chuyển";
    } else {
      return `${voucher.value.toLocaleString()} VND`;
    }
  };

  // Get voucher type label
  const getVoucherTypeLabel = (voucher) => {
    if (voucher.isPercent) {
      return voucherTypes.percentage;
    } else if (voucher.value === 0) {
      return voucherTypes.shipping;
    } else {
      return voucherTypes.fixed;
    }
  };

  // Render pagination controls
  const renderPagination = () => {
    const { currentPage, totalPages } = pagination;
    
    return (
      <div className={styles.pagination}>
        <Button 
          onClick={() => handlePageChange(currentPage - 1)} 
          disabled={currentPage === 1}
        >
          Trước
        </Button>
        <span className={styles.pageInfo}>
          Trang {currentPage} / {totalPages}
        </span>
        <Button 
          onClick={() => handlePageChange(currentPage + 1)} 
          disabled={currentPage === totalPages}
        >
          Sau
        </Button>
      </div>
    );
  };

  const handleCheckAuth = useCallback(() => {
    // Don't proceed if still loading
    if (authLoading) return true;
    
    // If not authenticated, redirect
    if (!isAuthenticated) {
      navigate('/login');
      return false;
    }
    
    // If not admin, show error and redirect
    if (!isAdmin) {
      message.error("Bạn không có quyền truy cập trang này!");
      navigate('/');
      return false;
    }
    
    // Check token expiration
    return checkTokenExpiration();
  }, [isAuthenticated, isAdmin, authLoading, navigate, checkTokenExpiration]);

  // Add an effect to periodically check authentication status
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      // Set up an interval to check token periodically
      const authCheckInterval = setInterval(() => {
        checkTokenExpiration();
      }, 60000); // Check every minute
      
      return () => clearInterval(authCheckInterval);
    }
  }, [authLoading, isAuthenticated, checkTokenExpiration]);

  // If still loading auth status, show loading indicator
  if (authLoading) {
    return <div className={styles.loadingContainer}><Spin size="large" /><p>Đang tải...</p></div>;
  }

  // If not authenticated or not admin, show nothing (or loading)
  if (!isAuthenticated || !isAdmin) {
    return <div className={styles.loadingContainer}><Spin size="large" /><p>Kiểm tra quyền truy cập...</p></div>;
  }

  // Add back the filter date handlers below the form date handlers
  // Handle date changes for filtering
  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
    // Reset to page 1 when filter changes
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
    // Reset to page 1 when filter changes
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <h1>Quản lý voucher</h1>
        
        {/* Success notification */}
        {showNotification && (
          <div className={styles.successNotification}>
            {successMessage}
          </div>
        )}
        
        {/* Filters and actions */}
        <div className={styles.actions}>
          <div className={styles.filtersContainer}>
            {/* Row 1: Type filter, Status filter, Sort option, DateTime filter */}
            <div className={styles.filterRow}>
              <Select
                value={voucherTypeFilter}
                onChange={(value) => setVoucherTypeFilter(value)}
                placeholder="Loại voucher"
                className={styles.filterSelect}
                allowClear
                dropdownMatchSelectWidth={false}
                defaultValue=""
                suffixIcon={<FaFilter />}
              >
                <Option value="">Tất cả loại voucher</Option>
                <Option value="percentage">Giảm theo phần trăm</Option>
                <Option value="fixed">Giảm số tiền cố định</Option>
                <Option value="shipping">Miễn phí vận chuyển</Option>
              </Select>
              
              <Select
                value={statusFilter}
                onChange={(value) => setStatusFilter(value)}
                placeholder="Trạng thái"
                className={styles.filterSelect}
                allowClear
                dropdownMatchSelectWidth={false}
                defaultValue=""
                suffixIcon={<FaFilter />}
              >
                <Option value="">Tất cả trạng thái</Option>
                <Option value="active">Đang hoạt động</Option>
                <Option value="expired">Hết hạn</Option>
              </Select>
              
              <Select
                value={sortOption}
                onChange={(value) => setSortOption(value)}
                placeholder="Sắp xếp theo"
                className={styles.filterSelect}
                allowClear
                dropdownMatchSelectWidth={false}
                suffixIcon={<FaSort />}
              >
                <Option value="dateDesc">Mới nhất</Option>
                <Option value="dateAsc">Cũ nhất</Option>
                <Option value="nameAsc">Tên (A-Z)</Option>
                <Option value="nameDesc">Tên (Z-A)</Option>
                <Option value="valueAsc">Giá trị (Thấp-Cao)</Option>
                <Option value="valueDesc">Giá trị (Cao-Thấp)</Option>
              </Select>
              
              <div className={styles.dateFilterWrapper}>
                <FaCalendar className={styles.calendarIcon} />
                <input
                  type="date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  className={styles.dateInput}
                  placeholder="Ngày bắt đầu"
                />
                <span className={styles.dateSeparator}>đến</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  className={styles.dateInput}
                  placeholder="Ngày kết thúc"
                />
              </div>
            </div>
            
            {/* Row 2: Search bar and Reset button */}
            <div className={styles.filterRow}>
              <div className={styles.searchBar}>
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên hoặc mã"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className={styles.searchInput}
                />
                <FaSearch className={styles.searchIcon} />
              </div>
              
              <Button 
                icon={<FaRedo />} 
                onClick={handleResetFilters}
                className={styles.resetButton}
              >
                Đặt lại
              </Button>
            </div>
          </div>
          
          {/* Row 3: Add button */}
          <div className={styles.addButtonContainer}>
            <Button
              type="primary"
              icon={<FaPlus />}
              onClick={handleShowAddForm}
              className={styles.addButton}
            >
              Thêm voucher mới
            </Button>
          </div>
        </div>
        
        {/* Voucher Table */}
        <div className={styles.tableWrapper}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <Spin size="large" />
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : (
            <table className={styles.voucherTable}>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên</th>
                  <th>Mã</th>
                  <th>Loại</th>
                  <th>Giá trị</th>
                  <th>Giá trị đơn tối thiểu</th>
                  <th>Số lượng</th>
                  <th>Ngày bắt đầu</th>
                  <th>Ngày hết hạn</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.length === 0 ? (
                  <tr>
                    <td colSpan="11" className={styles.noData}>
                      Không có voucher nào
                    </td>
                  </tr>
                ) : (
                  vouchers.map((voucher, index) => (
                    <tr key={voucher.voucherId}>
                      <td>{(pagination.currentPage - 1) * pagination.pageSize + index + 1}</td>
                      <td title={voucher.name} className={styles.nameCell}>{voucher.name}</td>
                      <td>{voucher.code}</td>
                      <td>{getVoucherTypeLabel(voucher)}</td>
                      <td>{formatVoucherValue(voucher)}</td>
                      <td>{voucher.minOrderValue?.toLocaleString() || 0} VND</td>
                      <td>{voucher.quantity}</td>
                      <td>{dayjs(voucher.startedAt).format('DD/MM/YYYY')}</td>
                      <td>
                        {voucher.isInfinity ? 'Không giới hạn' : dayjs(voucher.expiredAt).format('DD/MM/YYYY')}
                      </td>
                      <td>
                        <span className={
                          getVoucherStatus(voucher).status === "active" ? styles.statusActive : 
                          getVoucherStatus(voucher).status === "pending" ? styles.statusPending : 
                          styles.statusExpired
                        }>
                          {getVoucherStatus(voucher).label}
                        </span>
                      </td>
                      <td>
                        <div className={styles.tableActions}>
                          <Tooltip title="Sửa">
                            <button 
                              onClick={() => handleEdit(voucher.voucherId)}
                              className={`${styles.actionButton} ${styles.editButton}`}
                            >
                              <FaEdit size={16} />
                            </button>
                          </Tooltip>
                          <Tooltip title="Xóa">
                            <button 
                              onClick={() => showDeleteConfirmation(voucher.voucherId, voucher.name)}
                              className={`${styles.actionButton} ${styles.deleteButton}`}
                            >
                              <FaTrash size={16} />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination */}
        {!loading && vouchers.length > 0 && renderPagination()}
        
        {/* Add/Edit Voucher Form Modal */}
        {showForm && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2>Thêm voucher mới</h2>
                <button onClick={handleCancel} className={styles.closeButton}>×</button>
              </div>
              
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className={styles.voucherForm}
              >
                {/* Hidden id field for edit mode */}
                {editMode && (
                  <Form.Item name="voucherId" hidden>
                    <Input />
                  </Form.Item>
                )}
                
                {/* Voucher name */}
                <Form.Item
                  name="name"
                  label="Tên voucher"
                  rules={[{ required: true, message: 'Vui lòng nhập tên voucher' }]}
                >
                  <Input placeholder="Nhập tên voucher" />
                </Form.Item>
                
                {/* Voucher code */}
                <Form.Item
                  name="code"
                  label="Mã voucher"
                  rules={[{ required: true, message: 'Vui lòng nhập mã voucher' }]}
                >
                  <Input.Group compact>
                    <Form.Item
                      name="code"
                      noStyle
                      rules={[{ required: true, message: 'Vui lòng nhập mã voucher' }]}
                    >
                      <Input 
                        style={{ width: 'calc(100% - 130px)' }}
                        placeholder="Mã voucher"
                        readOnly
                        className={styles.codeInput}
                      />
                    </Form.Item>
                    {!editMode && (
                      <Button
                        type="default"
                        onClick={generateVoucherCode}
                        style={{ width: '130px' }}
                      >
                        Tạo mã mới
                      </Button>
                    )}
                    {editMode && (
                      <Button
                        type="default"
                        disabled
                        style={{ width: '130px' }}
                      >
                        Không thể đổi
                      </Button>
                    )}
                  </Input.Group>
                </Form.Item>
                
                {/* Voucher type */}
                <Form.Item
                  name="voucherType"
                  label="Loại voucher"
                  rules={[{ required: true, message: 'Vui lòng chọn loại voucher' }]}
                >
                  <Select placeholder="Chọn loại voucher">
                    <Option value="percentage">Giảm theo phần trăm</Option>
                    <Option value="fixed">Giảm số tiền cố định</Option>
                    <Option value="shipping">Miễn phí vận chuyển</Option>
                  </Select>
                </Form.Item>
                
                {/* Value - conditional based on voucher type */}
                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) => 
                    prevValues.voucherType !== currentValues.voucherType
                  }
                >
                  {({ getFieldValue }) => {
                    const voucherType = getFieldValue('voucherType');
                    
                    if (voucherType === 'shipping') {
                      return null; // No value input for shipping vouchers
                    }
                    
                    return (
                      <Form.Item
                        name="value"
                        label={voucherType === 'percentage' ? 'Phần trăm giảm giá' : 'Số tiền giảm giá'}
                        rules={[{ required: true, message: 'Vui lòng nhập giá trị voucher' }]}
                      >
                        {voucherType === 'percentage' ? (
                          <InputNumber
                            min={1}
                            max={100}
                            formatter={value => `${value}%`}
                            parser={value => value.replace('%', '')}
                            style={{ width: '100%' }}
                          />
                        ) : (
                          <InputNumber
                            min={1000}
                            step={1000}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            style={{ width: '100%' }}
                            addonAfter="VND"
                          />
                        )}
                      </Form.Item>
                    );
                  }}
                </Form.Item>
                
                {/* Max discount value - only for percentage */}
                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) => 
                    prevValues.voucherType !== currentValues.voucherType
                  }
                >
                  {({ getFieldValue }) => {
                    if (getFieldValue('voucherType') === 'percentage') {
                      return (
                        <Form.Item
                          name="maxDiscountValue"
                          label="Giảm giá tối đa"
                          rules={[{ required: true, message: 'Vui lòng nhập giá trị giảm tối đa' }]}
                        >
                          <InputNumber
                            min={1000}
                            step={1000}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            style={{ width: '100%' }}
                            addonAfter="VND"
                          />
                        </Form.Item>
                      );
                    }
                    return null;
                  }}
                </Form.Item>
                
                {/* Min order value */}
                <Form.Item
                  name="minOrderValue"
                  label="Giá trị đơn hàng tối thiểu"
                >
                  <InputNumber
                    min={0}
                    step={10000}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    style={{ width: '100%' }}
                    addonAfter="VND"
                  />
                </Form.Item>
                
                {/* Date range */}
                <Form.Item
                  label="Thời gian hiệu lực"
                  required
                >
                  {/* Hidden form items to store date values */}
                  <Form.Item name="startDate" hidden>
                    <Input />
                  </Form.Item>
                  
                  <Form.Item name="endDate" hidden>
                    <Input />
                  </Form.Item>
                  
                  <div className={styles.dateInputGroup}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Ngày bắt đầu:</label>
                      <input
                        type="date"
                        value={formStartDate}
                        onChange={(e) => {
                          const newDate = e.target.value;
                          setFormStartDate(newDate);
                          form.setFieldsValue({ startDate: newDate });
                          
                          // If we have an end date and it's now before the new start date, adjust it
                          if (formEndDate && new Date(formEndDate) < new Date(newDate)) {
                            // Set end date to start date + 1 day
                            const nextDay = new Date(newDate);
                            nextDay.setDate(nextDay.getDate() + 1);
                            const nextDayStr = nextDay.toISOString().split('T')[0];
                            setFormEndDate(nextDayStr);
                            form.setFieldsValue({ endDate: nextDayStr });
                          }
                        }}
                        className={styles.formDateInput}
                        required
                      />
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Ngày kết thúc:</label>
                      <input
                        type="date"
                        value={formEndDate}
                        onChange={(e) => {
                          const newDate = e.target.value;
                          
                          // Only allow end dates that are after the start date
                          if (formStartDate && new Date(newDate) <= new Date(formStartDate)) {
                            message.error("Ngày kết thúc phải sau ngày bắt đầu");
                            return;
                          }
                          
                          setFormEndDate(newDate);
                          form.setFieldsValue({ endDate: newDate });
                        }}
                        className={styles.formDateInput}
                        disabled={form.getFieldValue('isInfinity')}
                        required={!form.getFieldValue('isInfinity')}
                      />
                    </div>
                    
                    <Form.Item 
                      name="isInfinity" 
                      valuePropName="checked"
                      className={styles.infinityCheckbox}
                    >
                      <Checkbox onChange={(e) => {
                        if (e.target.checked) {
                          setFormEndDate('');
                          form.setFieldsValue({ endDate: null });
                        } else if (formStartDate) {
                          // If unchecking infinity and we have a start date, set end date to start date + 30 days
                          const startDate = new Date(formStartDate);
                          const endDate = new Date(startDate);
                          endDate.setDate(startDate.getDate() + 30);
                          const endDateStr = endDate.toISOString().split('T')[0];
                          setFormEndDate(endDateStr);
                          form.setFieldsValue({ endDate: endDateStr });
                        }
                      }}>
                        Không giới hạn thời gian
                      </Checkbox>
                    </Form.Item>
                  </div>
                </Form.Item>
                
                {/* Quantity */}
                <Form.Item
                  name="quantity"
                  label="Số lượng"
                  rules={[{ required: true, message: 'Vui lòng nhập số lượng voucher' }]}
                >
                  <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>
                
                {/* Point cost */}
                <Form.Item
                  name="pointCost"
                  label="Điểm đổi (nếu có)"
                >
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
                
                {/* Submit buttons */}
                <div className={styles.formActions}>
                  <Button onClick={handleCancel}>Hủy</Button>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={submitting}
                  >
                    {editMode ? 'Cập nhật' : 'Thêm mới'}
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        )}
        
        {/* Add delete confirmation modal */}
        <ConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={confirmDeleteVoucher}
          title="Xác nhận xóa voucher"
          message="Bạn có chắc chắn muốn xóa"
          itemName={deleteModal.voucherName}
          itemType="voucher"
        />
      </div>
    </div>
  );
};

export default VoucherManager; 