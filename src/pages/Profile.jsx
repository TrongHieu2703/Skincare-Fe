import React, { useState, useEffect } from "react";
import { getAccountInfo, updateAccountInfo } from "../api/accountApi";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import coverImage from "/src/assets/images/cover-image.png";
import defaultAvatar from "/src/assets/images/profile-pic.png";
import "/src/styles/Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    address: "",
    avatar: "",
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [originalData, setOriginalData] = useState(null);

  // Fetch user profile data
  useEffect(() => {
    fetchUserProfile();
  }, [navigate]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const userData = await getAccountInfo();
      const data = {
        username: userData.username || "",
        email: userData.email || "",
        phoneNumber: userData.phoneNumber || "",
        address: userData.address || "",
        avatar: userData.avatar || "",
      };
      setFormData(data);
      setOriginalData(data);
      setPreviewImage(getImageUrl(userData.avatar));
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Không thể tải thông tin người dùng");
      if (error.message === "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại") {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (avatarPath) => {
    if (!avatarPath) return defaultAvatar;
    if (avatarPath.startsWith('data:image')) return avatarPath;
    return `${import.meta.env.VITE_API_URL}${avatarPath}`;
  };

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
      if (file.size > 800 * 1024) {
        toast.error("Kích thước ảnh không được vượt quá 800KB");
        return;
      }

      if (!file.type.match(/^image\/(jpeg|jpg|png|gif)$/)) {
        toast.error("Chỉ chấp nhận file ảnh (JPG, PNG, GIF)");
        return;
      }

      try {
        const optimizedImage = await resizeImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
          setFormData(prev => ({
            ...prev,
            avatar: reader.result
          }));
          toast.success("Đã chọn ảnh mới. Nhấn 'Lưu thay đổi' để cập nhật.");
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
    
    // Check if there are any changes
    const hasChanges = Object.keys(formData).some(key => 
      formData[key] !== originalData[key]
    );

    if (!hasChanges) {
      toast.info("Không có thay đổi nào để cập nhật");
      return;
    }

    try {
      setSaving(true);
      await updateAccountInfo(formData);
      toast.success("Cập nhật thông tin thành công!");
      
      // Refresh user data
      await fetchUserProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Không thể cập nhật thông tin");
      if (error.message === "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại") {
        navigate('/login');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Đang tải thông tin...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Cover Image */}
      <div className="cover-photo">
        <img src={coverImage} alt="Cover" />
      </div>

      {/* Profile Section */}
      <div className="profile-section">
        <div className="profile-image-container">
          <img 
            src={previewImage || getImageUrl(formData.avatar)} 
            alt="Profile" 
            className="profile-image"
          />
          <label className="change-photo-button">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            Đổi ảnh
          </label>
        </div>
        <h2>{formData.username || 'Chưa cập nhật tên'}</h2>
        <p>{formData.email}</p>
      </div>

      {/* Profile Form */}
      <form className="profile-form" onSubmit={handleSubmit}>
        <h3>Thông tin cá nhân</h3>
        
        <div className="form-group">
          <label>Tên người dùng</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Nhập tên người dùng"
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Nhập email"
            disabled
          />
        </div>

        <div className="form-group">
          <label>Số điện thoại</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Nhập số điện thoại"
          />
        </div>

        <div className="form-group">
          <label>Địa chỉ</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Nhập địa chỉ"
          />
        </div>

        <button 
          type="submit" 
          className="save-btn"
          disabled={saving}
        >
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </form>
    </div>
  );
};

export default Profile;
