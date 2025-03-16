// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { getAccountInfo, updateProfileWithAvatar } from "../api/accountApi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
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
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [successNotification, setSuccessNotification] = useState("");

  const getImageUrl = (avatarPath) => {
    if (!avatarPath) return defaultAvatar;
    
    // Kiểm tra URL Google Drive và thay đổi format
    if (avatarPath.includes("drive.google.com")) {
        // Nếu URL có dạng uc?id=
        if (avatarPath.includes("uc?id=")) {
            const fileId = avatarPath.split("uc?id=")[1].split("&")[0];
            return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
        }
        // Nếu URL có dạng /d/
        else if (avatarPath.includes("/d/")) {
            const fileId = avatarPath.split("/d/")[1].split("/")[0];
            return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
        }
    }
    
    // Nếu là URL http(s) khác, giữ nguyên
    if (avatarPath.startsWith("http")) {
        return avatarPath;
    }
    
    // Fallback cho base64
    if (avatarPath.startsWith("data:image")) {
        return avatarPath;
    }
    
    return defaultAvatar;
  };

  useEffect(() => {
    fetchUserProfile();
    // dependency có thể để [] nếu navigate không thay đổi
  }, []);

  useEffect(() => {
    if (formData.avatar) {
      console.log("Profile - Original Avatar URL:", formData.avatar);
      console.log("Profile - Transformed Avatar URL:", getImageUrl(formData.avatar));
    }
  }, [formData.avatar]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const userData = await getAccountInfo();
      
      console.log("Fetched profile data:", userData);
      
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
      setImageError(false);
      
      window.dispatchEvent(new CustomEvent('user-profile-updated'));
    } catch (error) {
      console.error("Error fetching user profile:", error);
      
      // Kiểm tra nếu lỗi liên quan đến hết hạn token
      if (error.message?.includes("Phiên đăng nhập đã hết hạn") || 
          error.message?.includes("Chưa đăng nhập")) {
        setSuccessNotification("Phiên đăng nhập đã hết hạn, đang chuyển hướng...");
        
        // Delay redirect để người dùng thấy thông báo
        setTimeout(() => {
          navigate("/login", { state: { returnUrl: "/profile" } });
        }, 2000);
      } else {
        setSuccessNotification("❌ Không thể tải thông tin người dùng");
        setTimeout(() => setSuccessNotification(""), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
        setAvatarFile(optimizedImage);

        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
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
          const canvas = document.createElement("canvas");
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
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              resolve(
                new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                })
              );
            },
            "image/jpeg",
            0.8
          );
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hasChanges = 
        avatarFile !== null || 
        formData.username !== originalData.username ||
        formData.phoneNumber !== originalData.phoneNumber || 
        formData.address !== originalData.address;

    if (!hasChanges) {
        toast.info("Không có thay đổi nào để cập nhật");
        return;
    }

    try {
        setSaving(true);
        
        // Gọi API cập nhật profile với avatar
        const response = await updateProfileWithAvatar(formData, avatarFile);
        
        // Cập nhật URL avatar từ response nếu có
        if (response.avatarUrl) {
            console.log("New avatar URL:", response.avatarUrl);
            setFormData(prev => ({
                ...prev,
                avatar: response.avatarUrl
            }));
            
            // Cập nhật localStorage ngay lập tức
            const userJson = localStorage.getItem('user');
            if (userJson) {
                const user = JSON.parse(userJson);
                user.avatar = response.avatarUrl;
                user.username = formData.username;
                user.phoneNumber = formData.phoneNumber;
                user.address = formData.address;
                localStorage.setItem('user', JSON.stringify(user));
                
                // Dispatch custom event thay vì storage event
                window.dispatchEvent(new CustomEvent('user-profile-updated'));
            }
        }
        
        setSuccessNotification("✅ Thông tin đã được cập nhật thành công!");
        setTimeout(() => setSuccessNotification(""), 3000);
        
        // Không cần gọi fetchUserProfile lại vì đã cập nhật state và localStorage
    } catch (error) {
        console.error("Error updating profile:", error);
        toast.error(error.message || "Không thể cập nhật thông tin");
        if (error.message === "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại") {
            navigate("/login");
        }
    } finally {
        setSaving(false);
    }
  };

  return (
    <div className="profile-container">
      {successNotification && (
        <div className="success-message-banner">
          {successNotification}
        </div>
      )}
      <div className="cover-photo">
        <img src={coverImage} alt="Cover" />
      </div>

      <div className="profile-section">
        <div className="profile-image-container">
          <img
            src={imageError ? defaultAvatar : (previewImage || getImageUrl(formData.avatar))}
            alt="Profile"
            className="profile-image"
            onError={() => setImageError(true)}
          />
          <label className="change-photo-button">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
            Đổi ảnh
          </label>
        </div>
        <h2>{formData.username || "Chưa cập nhật tên"}</h2>
        <p>{formData.email}</p>
      </div>

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

        <button type="submit" className="save-btn" disabled={saving}>
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
