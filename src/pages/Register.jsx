import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerWithAvatar } from "../api/authApi";
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import defaultAvatar from "/src/assets/images/profile-pic.png";
import "/src/styles/Register.css";

const Register = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
        address: "",
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [formErrors, setFormErrors] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
        address: '',
        serverError: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user types
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        // Real-time validation for confirm password
        if (name === 'confirmPassword' || (name === 'password' && formData.confirmPassword)) {
            if (name === 'password' && value !== formData.confirmPassword) {
                setFormErrors(prev => ({
                    ...prev,
                    confirmPassword: 'Mật khẩu xác nhận không khớp'
                }));
            } else if (name === 'confirmPassword' && value !== formData.password) {
                setFormErrors(prev => ({
                    ...prev,
                    confirmPassword: 'Mật khẩu xác nhận không khớp'
                }));
            } else {
                setFormErrors(prev => ({
                    ...prev,
                    confirmPassword: ''
                }));
            }
        }
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size
            if (file.size > 800 * 1024) {
                toast.error("Kích thước ảnh không được vượt quá 800KB");
                return;
            }

            // Validate file type
            if (!file.type.match(/^image\/(jpeg|jpg|png|gif)$/)) {
                toast.error("Chỉ chấp nhận file ảnh (JPG, PNG, GIF)");
                return;
            }

            try {
                const optimizedImage = await resizeImage(file);
                setAvatarFile(optimizedImage);

                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewImage(reader.result);
                    toast.success("Đã chọn ảnh đại diện");
                };
                reader.readAsDataURL(optimizedImage);
            } catch (error) {
                console.error("Error processing image:", error);
                toast.error("Có lỗi xử lý ảnh, vui lòng thử lại");
            }
        }
    };

    const resizeImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const maxSize = 800;

                    if (width > height) {
                        if (width > maxSize) {
                            height = Math.round((height * maxSize) / width);
                            width = maxSize;
                        }
                    } else {
                        if (height > maxSize) {
                            width = Math.round((width * maxSize) / height);
                            height = maxSize;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        resolve(new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        }));
                    }, 'image/jpeg', 0.8);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    };

    // Validation function
    const validateForm = () => {
        let valid = true;
        const errors = {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            phoneNumber: '',
            address: '',
            serverError: ''
        };

        // Username validation
        if (!formData.username.trim()) {
            errors.username = 'Vui lòng nhập tên người dùng';
            valid = false;
        } else if (formData.username.trim().length < 3) {
            errors.username = 'Tên người dùng phải có ít nhất 3 ký tự';
            valid = false;
        }

        // Email validation
        if (!formData.email.trim()) {
            errors.email = 'Vui lòng nhập email';
            valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Email không hợp lệ';
            valid = false;
        }

        // Password validation
        if (!formData.password) {
            errors.password = 'Vui lòng nhập mật khẩu';
            valid = false;
        } else if (formData.password.length < 6) {
            errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
            valid = false;
        }

        // Confirm password
        if (!formData.confirmPassword) {
            errors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
            valid = false;
        } else if (formData.confirmPassword !== formData.password) {
            errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
            valid = false;
        }

        // Phone validation - accepts Vietnamese phone format
        if (formData.phoneNumber && !/^(0|\+84)(\d{9,10})$/.test(formData.phoneNumber)) {
            errors.phoneNumber = 'Số điện thoại không hợp lệ';
            valid = false;
        }

        // Address validation
        if (!formData.address.trim()) {
            errors.address = 'Vui lòng nhập địa chỉ';
            valid = false;
        }

        setFormErrors(errors);
        return valid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Run full validation before submission
        if (!validateForm()) {
            // Remove toast and just rely on inline errors
            return;
        }

        try {
            setLoading(true);
            await registerWithAvatar(formData, avatarFile);
            toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
            navigate('/login');
        } catch (error) {
            console.error("Registration error:", error);

            // Handle specific error codes from backend by setting inline errors
            if (error && error.errorCode) {
                const errors = { ...formErrors };

                switch (error.errorCode) {
                    case "DUPLICATE_EMAIL":
                        errors.email = `Email ${formData.email} đã được sử dụng bởi tài khoản khác`;
                        break;
                    case "DUPLICATE_PHONE":
                        errors.phoneNumber = `Số điện thoại ${formData.phoneNumber} đã được sử dụng bởi tài khoản khác`;
                        break;
                    default:
                        // Generic server error - display at the bottom of the form
                        errors.serverError = error.message || "Đăng ký thất bại. Vui lòng thử lại.";
                }

                setFormErrors(errors);
            } else {
                // Generic error, set a server error message
                setFormErrors(prev => ({
                    ...prev,
                    serverError: error.message || "Lỗi kết nối đến máy chủ. Vui lòng thử lại sau."
                }));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-form">
                <div className="register-left">
                    <h2>Đăng ký tài khoản</h2>

                    <div className="avatar-upload">
                        <div className="avatar-preview">
                            <img
                                src={previewImage || defaultAvatar}
                                alt="Avatar Preview"
                                className="preview-image"
                            />
                        </div>
                        <label className="avatar-upload-button">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                            />
                            Chọn ảnh đại diện
                        </label>
                    </div>

                    <div className="login-link">
                        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                    </div>
                </div>

                <div className="register-right">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Tên người dùng"
                                required
                                className={formErrors.username ? "error-input" : ""}
                            />
                            {formErrors.username && <div className="error-message">{formErrors.username}</div>}
                        </div>

                        <div className="form-group">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Nhập email"
                                required
                                className={formErrors.email ? "error-input" : ""}
                            />
                            {formErrors.email && <div className="error-message">{formErrors.email}</div>}
                        </div>

                        <div className="form-group">
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Mật khẩu"
                                required
                                className={formErrors.password ? "error-input" : ""}
                            />
                            {formErrors.password && <div className="error-message">{formErrors.password}</div>}
                        </div>

                        <div className="form-group">
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Xác nhận mật khẩu"
                                required
                                className={formErrors.confirmPassword ? "error-input" : ""}
                            />
                            {formErrors.confirmPassword && <div className="error-message">{formErrors.confirmPassword}</div>}
                        </div>

                        <div className="form-group">
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                placeholder="Số điện thoại"
                                required
                                className={formErrors.phoneNumber ? "error-input" : ""}
                            />
                            {formErrors.phoneNumber && <div className="error-message">{formErrors.phoneNumber}</div>}
                        </div>

                        <div className="form-group">
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Địa chỉ"
                                required
                                className={formErrors.address ? "error-input" : ""}
                            />
                            {formErrors.address && <div className="error-message">{formErrors.address}</div>}
                        </div>


                        <button
                            type="submit"
                            className="register-button"
                            disabled={loading}
                        >
                            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                        </button>

                        {formErrors.serverError && (
                            <div className="server-error-message">{formErrors.serverError}</div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
