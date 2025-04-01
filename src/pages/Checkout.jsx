// src/pages/Checkout.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createOrder } from '../api/orderApi';
import { getAllVouchers, getAvailableVouchers } from '../api/voucherApi';
import '/src/styles/Checkout.css';
import { getAccountInfo, updateAccountInfo } from '../api/accountApi';
import { useAuth } from '../auth/AuthProvider';
import { useCart } from "../store/CartContext";
import { formatProductImageUrl } from "../utils/imageUtils";

// Hàm định dạng tiền tệ VND
const formatVND = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount).replace('₫', 'đ');
};

// Cập nhật component chọn phương thức thanh toán để nhỏ gọn hơn
const PaymentMethodSelector = ({ selectedMethod, onChange }) => {
  return (
    <div className="payment-selection">
      <h3>Phương Thức Thanh Toán</h3>
      <div className="payment-methods">
        <div
          className={`payment-method-card selected`}
          onClick={() => onChange("Cash")}
        >
          <i className="fas fa-money-bill-wave"></i>
          <span>Tiền Mặt (COD)</span>
        </div>
      </div>
    </div>
  );
};

const Checkout = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  // Lấy cartItems, subtotal, shippingFee, total từ location.state
  const { 
    cartItems = [], 
    subtotal = 0, 
    shippingFee = 30000, 
    total = 0,
    isBuyNow = false 
  } = state || {};

  const [orderInfo, setOrderInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    note: ''
  });

  // Add formErrors state for validation
  const [formErrors, setFormErrors] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    note: ''
  });

  // Add orderSummary state
  const [orderSummary, setOrderSummary] = useState({
    items: cartItems,
    subtotal: subtotal,
    shipping: shippingFee,
    total: total
  });

  // Thêm state cho phương thức thanh toán
  const [paymentMethod, setPaymentMethod] = useState("Cash"); // Mặc định là Cash

  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Thêm useAuth
  const { user, isAuthenticated } = useAuth();

  // Thêm useCart
  const { clearCart, loadCartItems } = useCart();

  const [vouchers, setVouchers] = useState([]); // State for vouchers
  const [selectedVoucher, setSelectedVoucher] = useState(null); // Selected voucher
  const [discount, setDiscount] = useState(0); // Discount amount
  const [voucherErrorMessage, setVoucherErrorMessage] = useState(''); // Error message for voucher application

  // Function to fetch cart items if needed
  const fetchCartItems = async () => {
    try {
      // Don't load cart items in Buy Now mode
      if (isBuyNow) return;
      
      await loadCartItems();
      // If using direct cart items from context, update order summary
      setOrderSummary({
        items: cartItems,
        subtotal: subtotal,
        shipping: shippingFee,
        total: total
      });
    } catch (error) {
      console.error("Error fetching cart items:", error);
      setErrorMessage("Không thể tải giỏ hàng. Vui lòng thử lại sau.");
    }
  };

  // Modify the useEffect that fetches cart items to check for isBuyNow flag
  useEffect(() => {
    // If coming from "Buy Now", use the passed cart items directly
    // This ensures we're only showing the product from product details, not the whole cart
    if (isBuyNow && cartItems.length > 0) {
      console.log("Buy Now mode with items:", cartItems);
      // Use the cart items directly from state
      setOrderSummary({
        items: cartItems,
        subtotal: subtotal,
        shipping: shippingFee,
        total: total,
      });
      return;
    }

    // Regular cart checkout flow - fetch cart items if needed
    if (cartItems.length === 0) {
      fetchCartItems();
    } else {
      // Use cart items passed from the cart page
      setOrderSummary({
        items: cartItems,
        subtotal: subtotal,
        shipping: shippingFee,
        total: total,
      });
    }
  }, [state, cartItems.length, isBuyNow, subtotal, shippingFee, total]);

  // Cập nhật useEffect
  useEffect(() => {
    if (!isAuthenticated) {
      setErrorMessage("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn");
      return;
    }

    if (user) {
      setUserId(user.id || 0);
      fetchUserInfo();
    }

    // Log ra thông tin cart items để debug
    console.log("Cart items in Checkout:", cartItems);

    const fetchVouchers = async () => {
      try {
        const response = await getAvailableVouchers();
        
<<<<<<< Updated upstream
        if (response && response.data && Array.isArray(response.data.data)) {
          setVouchers(response.data.data);
        } else if (response && Array.isArray(response.data)) {
          setVouchers(response.data);
=======
        console.log("Raw voucher response:", response);
        
        if (response && response.data && Array.isArray(response.data.data)) {
          const vouchersData = response.data.data;
          console.log("Vouchers data before processing:", vouchersData);
          
          // Check for shipping vouchers
          const shippingVouchers = vouchersData.filter(v => 
            !v.isPercent && v.value === 0
          );
          console.log("Shipping vouchers found:", shippingVouchers);
          
          setVouchers(vouchersData);
        } else if (response && Array.isArray(response.data)) {
          const vouchersData = response.data;
          console.log("Vouchers array before processing:", vouchersData);
          
          // Check for shipping vouchers
          const shippingVouchers = vouchersData.filter(v => 
            !v.isPercent && v.value === 0
          );
          console.log("Shipping vouchers found:", shippingVouchers);
          
          setVouchers(vouchersData);
>>>>>>> Stashed changes
        } else {
          console.error("Unexpected voucher response format:", response);
          setVouchers([]);
        }
      } catch (error) {
        console.error("Error fetching vouchers:", error);
        setVouchers([]);
      }
    };

    fetchVouchers();
  }, [isAuthenticated, user]);

  // Hàm lấy thông tin người dùng
  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      console.log("Fetching user info..."); // Debug log

      const userInfo = await getAccountInfo();
      console.log("User info fetched successfully:", userInfo); // Debug log

      // Cập nhật orderInfo dựa trên UProfileDTO và lưu avatar
      setOrderInfo({
        fullName: userInfo.username || '', // Sử dụng username thay vì fullName
        email: userInfo.email || '',
        phone: userInfo.phoneNumber || '', // Sử dụng phoneNumber thay vì phone
        address: userInfo.address || '',
        note: '',
        avatar: userInfo.avatar || '' // Lưu avatar hiện tại
      });
    } catch (error) {
      console.error("Error in fetchUserInfo:", error);
      setErrorMessage("Không thể lấy thông tin người dùng: " + (error.message || "Lỗi không xác định"));
    } finally {
      setLoading(false);
    }
  };

  // Thêm kiểm tra validation khi thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderInfo((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear general error messages on input
    if (errorMessage) {
      setErrorMessage('');
    }

    // Validate phone number as user types
    if (name === 'phone') {
      if (value && !validatePhone(value)) {
        setFormErrors(prev => ({
          ...prev,
          phone: 'Số điện thoại không hợp lệ (Ví dụ: 0912345678 hoặc +84912345678)'
        }));
      } else {
        // Clear phone error if valid or empty
        setFormErrors(prev => ({
          ...prev,
          phone: ''
        }));
      }
    }
  };

  // Validate phone number
  const validatePhone = (phone) => {
    // Vietnamese phone number format: starts with 0 or +84, followed by 9-10 digits
    const phoneRegex = /^(0|\+84)(\d{9,10})$/;
    return phoneRegex.test(phone);
  };

  // Function to validate form fields
  const validateForm = () => {
    const errors = { ...formErrors };
    let isValid = true;
    
    // Validate full name
    if (!orderInfo.fullName.trim()) {
      errors.fullName = 'Vui lòng nhập họ tên';
      isValid = false;
    }
    
    // Validate phone number
    if (!orderInfo.phone) {
      errors.phone = 'Vui lòng nhập số điện thoại';
      isValid = false;
    } else if (!validatePhone(orderInfo.phone)) {
      errors.phone = 'Số điện thoại không hợp lệ (Ví dụ: 0912345678 hoặc +84912345678)';
      isValid = false;
    }
    
    // Validate address
    if (!orderInfo.address.trim()) {
      errors.address = 'Vui lòng nhập địa chỉ';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };

  // Hàm cập nhật thông tin người dùng
  const handleUpdateProfile = async () => {
    // Kiểm tra token
    const token = localStorage.getItem('token');
    if (!token) {
      setErrorMessage('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!');
      return;
    }

    // Validate form before submitting
    if (!validateForm()) {
      return;
    }

    try {
      setIsUpdatingProfile(true);
      setErrorMessage('');
      setSuccessMessage('');

      // Chuẩn bị dữ liệu cập nhật theo UProfileDTO
      const updateData = {
        username: orderInfo.fullName,
        email: orderInfo.email,
        phoneNumber: orderInfo.phone,
        address: orderInfo.address,
        avatar: orderInfo.avatar // Keeps existing avatar
      };

      console.log("Sending update profile request with data:", updateData);

      await updateAccountInfo(updateData);
      setSuccessMessage('Cập nhật thông tin thành công!');
      
      // Tự động xóa thông báo thành công sau 3 giây
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

      // Cập nhật lại thông tin người dùng sau khi update thành công
      await fetchUserInfo();
    } catch (error) {
      console.error('Error updating profile:', error);

      // Handle duplicate phone error specifically
      if (error.response?.data?.errorCode === "DUPLICATE_PHONE") {
        setFormErrors(prev => ({
          ...prev,
          phone: `Số điện thoại ${orderInfo.phone} đã được sử dụng bởi tài khoản khác`
        }));
      } 
      // Kiểm tra lỗi từ message và details (format thực tế)
      else if (error.response?.data?.details && error.response.data.details.includes("Phone number") && error.response.data.details.includes("already exists")) {
        // Trích xuất số điện thoại từ thông báo lỗi
        const phoneMatch = error.response.data.details.match(/Phone number (\d+)/);
        const phone = phoneMatch ? phoneMatch[1] : orderInfo.phone;
        
        setFormErrors(prev => ({
          ...prev,
          phone: `Số điện thoại ${phone} đã được sử dụng bởi tài khoản khác`
        }));
      } else {
        // Hiển thị thông báo lỗi chi tiết hơn
        if (error.errors) {
          const errorMessages = Object.values(error.errors).flat().join(', ');
          setErrorMessage('Lỗi khi cập nhật thông tin: ' + errorMessages);
        } else {
          setErrorMessage('Lỗi khi cập nhật thông tin: ' + (error.message || 'Lỗi không xác định'));
        }
      }
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Thêm useEffect để xóa thông báo thành công khi thay đổi dữ liệu hoặc unmount
  useEffect(() => {
    // Reset success message when user changes any field
    if (successMessage) {
      setSuccessMessage('');
    }
    
    // Cleanup function to clear timers and messages when unmounting
    return () => {
      setSuccessMessage('');
      setErrorMessage('');
    };
  }, [orderInfo.fullName, orderInfo.phone, orderInfo.address]);

  // Thêm hàm giả lập thanh toán thành công cho tất cả phương thức
  const simulatePayment = async (paymentMethod, orderData) => {
    if (paymentMethod !== "Cash") {
      return new Promise((resolve) => {
        setSuccessMessage(`Đang xử lý thanh toán qua ${paymentMethod === "Credit" ? "thẻ tín dụng" : "PayPal"
          }...`);

        setTimeout(() => {
          setSuccessMessage(`Thanh toán ${paymentMethod === "Credit" ? "thẻ tín dụng" : "PayPal"
            } thành công!`);
          resolve(true);
        }, 2000);
      });
    }
    return Promise.resolve(true);
  };

<<<<<<< Updated upstream
  // Cập nhật hàm handleVoucherChange để xử lý khi người dùng chọn voucher
  const handleVoucherChange = (e) => {
    const voucherId = e.target.value;
    
    // Reset messages and discount
    setVoucherErrorMessage('');
    setSuccessMessage('');
    
    if (!voucherId) {
      setSelectedVoucher(null);
      setDiscount(0);
      return;
    }
    
    if (!Array.isArray(vouchers)) {
      console.error("vouchers is not an array:", vouchers);
      setVoucherErrorMessage('Có lỗi khi chọn voucher, vui lòng thử lại sau');
      return;
    }
    
    const voucher = vouchers.find(v => v.voucherId.toString() === voucherId);
    if (voucher) {
      console.log("Selected voucher:", voucher);
      setSelectedVoucher(voucher);
    } else {
      console.error(`No voucher found with ID ${voucherId}`);
      setSelectedVoucher(null);
      setDiscount(0);
    }
  };

  // Cập nhật hàm xử lý áp dụng voucher
  const handleApplyVoucher = () => {
    if (!selectedVoucher) {
      setVoucherErrorMessage('Vui lòng chọn voucher trước khi áp dụng');
      return;
    }

    // Check if voucher has all required properties
    if (!selectedVoucher.minOrderValue || selectedVoucher.value === undefined) {
      console.error("Selected voucher has missing properties:", selectedVoucher);
      setVoucherErrorMessage('Voucher không hợp lệ, vui lòng chọn voucher khác');
      return;
    }

    // Kiểm tra điều kiện áp dụng voucher (minOrderValue)
    if (subtotal < selectedVoucher.minOrderValue) {
      setVoucherErrorMessage(
        `Đơn hàng tối thiểu phải từ ${formatVND(selectedVoucher.minOrderValue)} để áp dụng voucher này`
=======
  // Helper function to determine if a voucher is a shipping voucher
  const isShippingVoucher = (voucher) => {
    if (!voucher) return false;
    // A shipping voucher is identified by:
    // 1. Not being a percentage voucher (isPercent = false)
    // 2. Having a value of 0
    return !voucher.isPercent && voucher.value === 0;
  };

  // Cập nhật hàm xử lý áp dụng voucher để nhận voucher như một tham số
  const handleApplyVoucher = (voucher = null) => {
    // Sử dụng voucher được truyền vào hoặc từ state nếu không có
    const voucherToApply = voucher || selectedVoucher;
    
    if (!voucherToApply) {
      setVoucherErrorMessage('Vui lòng chọn voucher trước khi áp dụng');
      return;
    }

    // Check if voucher has all required properties
    if (!voucherToApply.minOrderValue || voucherToApply.value === undefined) {
      console.error("Selected voucher has missing properties:", voucherToApply);
      setVoucherErrorMessage('Voucher không hợp lệ, vui lòng chọn voucher khác');
      return;
    }

    // Kiểm tra điều kiện áp dụng voucher (minOrderValue)
    if (subtotal < voucherToApply.minOrderValue) {
      setVoucherErrorMessage(
        `Đơn hàng tối thiểu phải từ ${formatVND(voucherToApply.minOrderValue)} để áp dụng voucher này`
>>>>>>> Stashed changes
      );
      return;
    }

    // Check if voucher has expired (just in case it wasn't filtered out properly)
    const now = new Date();
<<<<<<< Updated upstream
    const expiryDate = new Date(selectedVoucher.expiredAt);
    if (expiryDate < now) {
      setVoucherErrorMessage(
        `Voucher "${selectedVoucher.code}" đã hết hạn từ ${expiryDate.toLocaleDateString('vi-VN')}. Vui lòng chọn voucher khác.`
=======
    now.setHours(0, 0, 0, 0); // Set to start of day - compare dates only

    const expiryDate = new Date(voucherToApply.expiredAt);
    expiryDate.setHours(0, 0, 0, 0); // Set to start of day for date comparison

    // Check if expiry date is earlier than today
    if (expiryDate < now) {
      setVoucherErrorMessage(
        `Voucher "${voucherToApply.code}" đã hết hạn từ ${expiryDate.toLocaleDateString('vi-VN')}. Vui lòng chọn voucher khác.`
      );
      setSelectedVoucher(null);
      // Refresh available vouchers list
      fetchVouchers();
      return;
    }

    // Check if voucher has started yet
    const startDate = new Date(voucherToApply.startedAt);
    startDate.setHours(0, 0, 0, 0); // Set to start of day for date comparison

    if (startDate > now) {
      setVoucherErrorMessage(
        `Voucher "${voucherToApply.code}" sẽ có hiệu lực từ ${startDate.toLocaleDateString('vi-VN')}. Vui lòng chọn voucher khác.`
>>>>>>> Stashed changes
      );
      setSelectedVoucher(null);
      // Refresh available vouchers list
      fetchVouchers();
      return;
    }

    // Check if voucher has been fully redeemed (quantity <= 0 and not infinite)
<<<<<<< Updated upstream
    if (!selectedVoucher.isInfinity && selectedVoucher.quantity <= 0) {
      setVoucherErrorMessage(
        `Voucher "${selectedVoucher.code}" đã hết lượt sử dụng. Vui lòng chọn voucher khác.`
=======
    if (!voucherToApply.isInfinity && voucherToApply.quantity <= 0) {
      setVoucherErrorMessage(
        `Voucher "${voucherToApply.code}" đã hết lượt sử dụng. Vui lòng chọn voucher khác.`
>>>>>>> Stashed changes
      );
      setSelectedVoucher(null);
      // Refresh available vouchers list
      fetchVouchers();
      return;
    }

    try {
      // Tính toán giá trị giảm giá dựa theo loại voucher
      let discountAmount = 0;
<<<<<<< Updated upstream
      
      if (selectedVoucher.isPercent) {
        // Tính giảm giá phần trăm
        discountAmount = (subtotal * selectedVoucher.value) / 100;
        
        // Áp dụng giới hạn maxDiscountValue nếu có
        if (selectedVoucher.maxDiscountValue > 0 && discountAmount > selectedVoucher.maxDiscountValue) {
          discountAmount = selectedVoucher.maxDiscountValue;
        }
      } else {
        // Giảm giá cố định
        discountAmount = selectedVoucher.value;
        
        // Xử lý voucher free ship
        if (selectedVoucher.code === "FREESHIP") {
          discountAmount = Math.min(shippingFee, selectedVoucher.value);
        }
      }

      // Đảm bảo giảm giá không vượt quá tổng tiền
      discountAmount = Math.min(discountAmount, subtotal);
=======
      let isShippingDiscount = isShippingVoucher(voucherToApply);
      
      if (voucherToApply.isPercent) {
        // Tính giảm giá phần trăm
        discountAmount = (subtotal * voucherToApply.value) / 100;
        
        // Áp dụng giới hạn maxDiscountValue nếu có
        if (voucherToApply.maxDiscountValue > 0 && discountAmount > voucherToApply.maxDiscountValue) {
          discountAmount = voucherToApply.maxDiscountValue;
        }
      } else if (isShippingDiscount) {
        // Giảm giá free ship - sử dụng phí vận chuyển làm giá trị giảm
        discountAmount = shippingFee;
      } else {
        // Giảm giá cố định
        discountAmount = voucherToApply.value;
      }

      // Đảm bảo giảm giá không vượt quá tổng tiền - bỏ qua cho voucher free ship
      if (!isShippingDiscount) {
        discountAmount = Math.min(discountAmount, subtotal);
      }
>>>>>>> Stashed changes
      
      // Cập nhật state discount
      setDiscount(discountAmount);
      
      // Hiển thị thông báo thành công
      setSuccessMessage(
<<<<<<< Updated upstream
        `Áp dụng voucher "${selectedVoucher.name}" thành công! Giảm ${
          selectedVoucher.isPercent ? selectedVoucher.value + '%' : formatVND(discountAmount)
        }`
=======
        isShippingDiscount
          ? `Áp dụng voucher "${voucherToApply.name}" thành công! Miễn phí vận chuyển ${formatVND(discountAmount)}`
          : `Áp dụng voucher "${voucherToApply.name}" thành công! Giảm ${
              voucherToApply.isPercent ? voucherToApply.value + '%' : formatVND(discountAmount)
            }`
>>>>>>> Stashed changes
      );
      
      // Tự động xóa thông báo thành công sau 3 giây
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
      setVoucherErrorMessage('');
    } catch (error) {
      console.error("Error applying voucher:", error);
      setVoucherErrorMessage('Có lỗi khi áp dụng voucher, vui lòng thử lại');
    }
  };

  // Cập nhật hàm handleVoucherChange để xử lý khi người dùng chọn voucher và tự động áp dụng
  const handleVoucherChange = (e) => {
    const voucherId = e.target.value;
    
    // Reset messages and discount
    setVoucherErrorMessage('');
    setSuccessMessage('');
    
    if (!voucherId) {
      setSelectedVoucher(null);
      setDiscount(0);
      return;
    }
    
    if (!Array.isArray(vouchers)) {
      console.error("vouchers is not an array:", vouchers);
      setVoucherErrorMessage('Có lỗi khi chọn voucher, vui lòng thử lại sau');
      return;
    }
    
    const voucher = vouchers.find(v => v.voucherId.toString() === voucherId);
    if (!voucher) {
      console.error(`No voucher found with ID ${voucherId}`);
      setSelectedVoucher(null);
      setDiscount(0);
      return;
    }
    
    console.log("Selected voucher:", voucher);
    setSelectedVoucher(voucher);
    
    // Tự động áp dụng voucher khi chọn
    handleApplyVoucher(voucher);
  };

  // Update the handleSubmit function to use isShippingVoucher
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submitting
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Kiểm tra đăng nhập
      if (!isAuthenticated) {
        throw new Error('Bạn chưa đăng nhập!');
      }

      // Kiểm tra token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!');
      }

      // Kiểm tra giỏ hàng trống
      if (!cartItems || cartItems.length === 0) {
        throw new Error('Giỏ hàng của bạn đang trống!');
      }

      // Check if selected voucher is a shipping voucher
      const isShippingDiscount = selectedVoucher ? isShippingVoucher(selectedVoucher) : false;

      // Chuẩn bị dữ liệu tạo Order
      const orderData = {
        voucherId: selectedVoucher?.voucherId || null,
        totalPrice: subtotal,
        discountPrice: discount,
        totalAmount: isShippingDiscount 
          ? subtotal
          : (subtotal - discount + shippingFee),
        status: 'Pending',
        isPrepaid: false,
        orderItems: cartItems.map((item) => ({
          productId: item.productId ?? 0,
          itemQuantity: item.quantity
        })),
        transactions: [
          {
            paymentMethod: 'Cash',
            status: 'Pending',
            amount: isShippingDiscount 
              ? subtotal
              : (subtotal - discount + shippingFee),
            createdDate: new Date().toISOString()
          }
        ]
      };

      console.log("Submitting order:", orderData);
      const response = await createOrder(orderData);
      console.log("Order created successfully:", response);

      // Only clear cart if not using "Buy Now" mode
      if (!isBuyNow) {
        try {
          await clearCart();
          console.log("Cart cleared successfully after order");
        } catch (clearError) {
          console.error("Failed to clear cart, but order was successful:", clearError);
        }
      }

      const orderId = response.data ? response.data.id : response.id;

      if (!orderId) {
        throw new Error("Đặt hàng thành công nhưng không thể hiển thị chi tiết đơn hàng.");
      }

      console.log("Navigating to order details with ID:", orderId);
      navigate(`/order/${orderId}`, {
        state: {
          orderId: orderId,
          paymentSuccess: true
        }
      });
    } catch (error) {
      console.error("Error creating order:", error);

      // Check for specific API error codes
      if (error.response?.data?.errorCode === "DUPLICATE_PHONE") {
        setFormErrors(prev => ({
          ...prev,
          phone: `Số điện thoại ${orderInfo.phone} đã được sử dụng bởi tài khoản khác`
        }));
        setLoading(false);
        return;
      }
      
      // Kiểm tra lỗi từ message và details (format thực tế)
      if (error.response?.data?.details && error.response.data.details.includes("Phone number") && error.response.data.details.includes("already exists")) {
        // Trích xuất số điện thoại từ thông báo lỗi
        const phoneMatch = error.response.data.details.match(/Phone number (\d+)/);
        const phone = phoneMatch ? phoneMatch[1] : orderInfo.phone;
        
        setFormErrors(prev => ({
          ...prev,
          phone: `Số điện thoại ${phone} đã được sử dụng bởi tài khoản khác`
        }));
        setLoading(false);
        return;
      }

      // Handle voucher-specific errors with more user-friendly messages
      if (error.type === "VOUCHER_ERROR" || error.response?.data?.errorCode?.startsWith("VOUCHER_")) {
        const errorCode = error.errorCode || error.response?.data?.errorCode;
        const errorMessage = error.message || error.response?.data?.message;
        
        // Reset the discount since voucher couldn't be applied
        setDiscount(0);
        
        // Handle specific voucher error types with friendly messages
        if (errorCode === "VOUCHER_EXPIRED") {
          setVoucherErrorMessage(`❌ Voucher "${selectedVoucher?.code}" đã hết hạn. Vui lòng chọn voucher khác.`);
          setSelectedVoucher(null);
        } 
        else if (errorCode === "VOUCHER_FULLY_REDEEMED") {
          setVoucherErrorMessage(`❌ Voucher "${selectedVoucher?.code}" đã hết lượt sử dụng. Vui lòng chọn voucher khác.`);
          setSelectedVoucher(null);
        } 
        else if (errorCode === "VOUCHER_MIN_ORDER_NOT_MET") {
          const minOrderValue = error.response?.data?.details?.minOrderValue || selectedVoucher?.minOrderValue || 0;
          setVoucherErrorMessage(`❌ Đơn hàng tối thiểu phải từ ${formatVND(minOrderValue)} để áp dụng voucher này.`);
        } 
        else {
          // Generic voucher error
          setVoucherErrorMessage(`❌ ${errorMessage || "Có lỗi khi áp dụng voucher. Vui lòng thử voucher khác."}`);
          setSelectedVoucher(null);
        }
        
        // Re-fetch available vouchers to get updated quantities
        fetchVouchers();
      }
      // Handle other specific error types
      else if (error.type === "INSUFFICIENT_INVENTORY") {
        setErrorMessage("❌ " + error.message);
        // Reload cart to get updated inventory
        await loadCartItems();
      } else if (error.type === "PRODUCT_NOT_FOUND") {
        setErrorMessage("❌ " + error.message);
        // Reload cart as product might have been removed
        await loadCartItems();
      } else if (error.type === "ORDER_ERROR") {
        setErrorMessage("❌ " + error.message);
      } else {
        setErrorMessage(
          "❌ " + (error.message || "Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại sau.")
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Add function to handle product click
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="order-detail-page">
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Đang xử lý đơn hàng của bạn...</p>
        </div>
      )}

      <div className="order-detail-container">
        <div className="order-detail-left">
          <h2>Thông Tin Giao Hàng</h2>
          <form onSubmit={handleSubmit}>
            <div className="user-info-section">
              <div className="form-group">
                <label>Họ Và Tên *</label>
                <input
                  type="text"
                  name="fullName"
                  value={orderInfo.fullName}
                  onChange={handleInputChange}
                  required
                  className={formErrors.fullName ? "error-input" : ""}
                />
                {formErrors.fullName && <div className="error-message">{formErrors.fullName}</div>}
              </div>
              <div className="form-group">
                <label>Email * (Không Thể Thay Đổi)</label>
                <input
                  type="email"
                  name="email"
                  value={orderInfo.email}
                  onChange={handleInputChange}
                  required
                  readOnly
                  className="readonly-input"
                />
              </div>
              <div className="form-group">
                <label>Số Điện Thoại *</label>
                <input
                  type="tel"
                  name="phone"
                  value={orderInfo.phone}
                  onChange={handleInputChange}
                  required
                  className={formErrors.phone ? "error-input" : ""}
                />
                {formErrors.phone && <div className="error-message">{formErrors.phone}</div>}
              </div>
              <div className="form-group">
                <label>Địa Chỉ *</label>
                <input
                  type="text"
                  name="address"
                  value={orderInfo.address}
                  onChange={handleInputChange}
                  required
                  className={formErrors.address ? "error-input" : ""}
                />
                {formErrors.address && <div className="error-message">{formErrors.address}</div>}
              </div>

              {/* Nút cập nhật thông tin đặt ngay dưới thông tin người dùng */}
              <div className="update-profile-section">
                <button
                  type="button"
                  className="update-profile-button"
                  onClick={handleUpdateProfile}
                  disabled={isUpdatingProfile}
                >
                  {isUpdatingProfile ? 'Đang Cập Nhật...' : 'Cập Nhật Thông Tin'}
                </button>
              </div>
            </div>

            {/* Thêm component chọn phương thức thanh toán */}
            <PaymentMethodSelector
              selectedMethod={paymentMethod}
              onChange={setPaymentMethod}
            />

            {/* Cập nhật phần chọn voucher */}
            <div className="voucher-section">
              <h3>Mã Giảm Giá</h3>
              <div className="voucher-selection">
                <select 
                  onChange={handleVoucherChange} 
                  className="voucher-select"
                >
                  <option value="">-- Chọn mã giảm giá --</option>
                  {Array.isArray(vouchers) && vouchers.length > 0 ? (
                    vouchers.map(voucher => (
                      <option key={voucher.voucherId} value={voucher.voucherId}>
                        {voucher.code} - {voucher.name} {voucher.isPercent 
                          ? `(${voucher.value}%)` 
                          : `(${formatVND(voucher.value)})`
                        } - Đơn tối thiểu: {formatVND(voucher.minOrderValue)}
                        {!voucher.isInfinity && voucher.quantity > 0 ? ` - Còn ${voucher.quantity} lượt dùng` : ''}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Không có voucher nào khả dụng</option>
                  )}
                </select>
<<<<<<< Updated upstream
                <button 
                  type="button" 
                  className="apply-voucher-button"
                  onClick={handleApplyVoucher}
                  disabled={!selectedVoucher}
                >
                  Áp Dụng
                </button>
=======
>>>>>>> Stashed changes
              </div>
              
              {voucherErrorMessage && (
                <div className="voucher-error">{voucherErrorMessage}</div>
              )}
              
              {selectedVoucher && discount > 0 && (
                <div className="applied-voucher">
                  <span>Voucher đã áp dụng: </span>
<<<<<<< Updated upstream
                  <strong>{selectedVoucher.code}</strong> - Giảm {formatVND(discount)}
=======
                  <strong>{selectedVoucher.code}</strong> - 
                  {selectedVoucher.code === "FREESHIP" 
                    ? <span className="free-shipping-text">Miễn phí vận chuyển</span>
                    : (selectedVoucher.isPercent 
                        ? `Giảm ${selectedVoucher.value}%` 
                        : `Giảm ${formatVND(discount)}`)
                  }
>>>>>>> Stashed changes
                  {!selectedVoucher.isInfinity && selectedVoucher.quantity > 0 && 
                    <span className="voucher-remaining"> (Còn {selectedVoucher.quantity} lượt sử dụng)</span>
                  }
                </div>
              )}
            </div>

            {errorMessage && <div className="error-message">{errorMessage}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
          </form>
        </div>
        <div className="order-detail-right">
          <h3>Tổng Quan Đơn Hàng</h3>
          <div className="cart-items-summary">
            {cartItems.map((item) => {
              const productName = item.productName || 'Sản phẩm không xác định';
              const productPrice = item.productPrice ?? 0;

              return (
                <div key={item.id} className="cart-item-summary">
                  <div
                    className="cart-item-image"
                    onClick={() => handleProductClick(item.productId)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img
                      src={formatProductImageUrl(item.productImage)}
                      alt={productName}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/src/assets/images/aboutus.jpg";
                      }}
                    />
                  </div>
                  <div
                    className="cart-item-info"
                    onClick={() => handleProductClick(item.productId)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="cart-item-name">{productName}</div>
                    <div className="cart-item-details">
                      <span className="cart-item-price">{formatVND(productPrice)}</span>
                      <span className="cart-item-quantity">x {item.quantity}</span>
                    </div>
                  </div>
                  <div className="cart-item-total">
                    {formatVND(productPrice * item.quantity)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="price-details">
            <div className="price-row">
              <span>Tổng Tạm Tính</span>
              <span>{formatVND(subtotal)}</span>
            </div>
            {discount > 0 && !isShippingVoucher(selectedVoucher) && (
              <div className="price-row discount">
                <span>Giảm Giá</span>
                <span>-{formatVND(discount)}</span>
              </div>
            )}
            <div className="price-row">
              <span>Phí Vận Chuyển</span>
              {selectedVoucher && isShippingVoucher(selectedVoucher) ? (
                <span>
                  <span className="original-shipping">{formatVND(shippingFee)}</span>
                  {" "}
                  <span className="free-shipping">Miễn phí</span>
                </span>
              ) : (
                <span>{formatVND(shippingFee)}</span>
              )}
            </div>
            <div className="price-row total">
              <span>Tổng Cộng</span>
              <span>{formatVND(
                selectedVoucher && isShippingVoucher(selectedVoucher)
                  ? subtotal 
                  : subtotal - discount + shippingFee
              )}</span>
            </div>
          </div>

          {/* Nút đặt hàng được di chuyển đến đây */}
          <button
            onClick={handleSubmit}
            className="checkout-button"
            disabled={loading}
          >
            {loading ? 'Đang Xử Lý...' : paymentMethod === "Cash" ? 'ĐẶT HÀNG (COD)' : 'THANH TOÁN NGAY'}
          </button>

          <div className="order-security-note">
            <p>Mọi thông tin của bạn sẽ được bảo mật theo chính sách bảo mật của chúng tôi.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
