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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp");
            return;
        }

        try {
            setLoading(true);
            await registerWithAvatar(formData, avatarFile);
            toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
            navigate('/login');
        } catch (error) {
            console.error("Registration error:", error);
            toast.error(error.message || "Đăng ký thất bại. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-form">
                <h2>Đăng ký tài khoản</h2>
                
                {/* Avatar Upload */}
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

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <FaUser className="input-icon" />
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Tên người dùng"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <FaEnvelope className="input-icon" />
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <FaLock className="input-icon" />
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Mật khẩu"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <FaLock className="input-icon" />
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Xác nhận mật khẩu"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <FaPhone className="input-icon" />
                        <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            placeholder="Số điện thoại"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <FaMapMarkerAlt className="input-icon" />
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Địa chỉ"
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="register-button"
                        disabled={loading}
                    >
                        {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                    </button>
                </form>

                <p className="login-link">
                    Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
