import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api/authApi";
import logo from "/src/assets/images/logo.png";
import signupImage from "/src/assets/images/signup-image.jpg";
import "/src/styles/Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
    address: "",
    avatar: null
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.name === 'avatar') {
      setFormData({ ...formData, avatar: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setMessage("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    try {
      await registerUser(formData);
      setMessage("Đăng ký thành công! Chuyển hướng đến trang đăng nhập...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setMessage(error.message || "Đăng ký thất bại! Vui lòng thử lại.");
    }
  };

  return (
    <div className="register-container">
      <div className="register-image">
        <img src={signupImage} alt="Đăng ký" />
      </div>
      <div className="register-box">
        <img src={logo} alt="Logo Skincare" className="logo" />
        <h2>ĐĂNG KÝ TÀI KHOẢN</h2>
        <p>Tham gia cùng chúng tôi ngay hôm nay!</p>

        {message && <p className={`message ${message.includes("thành công") ? "success" : "error"}`}>
          {message}
        </p>}

        <form onSubmit={handleSubmit}>
          {/* Tên đăng nhập */}
          <div className="input-group">
            <label>Tên đăng nhập</label>
            <input
              type="text"
              name="username"
              placeholder="Nhập tên đăng nhập"
              onChange={handleChange}
              minLength={3}
              required
            />
          </div>

          {/* Email */}
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Nhập địa chỉ email"
              onChange={handleChange}
              required
            />
          </div>

          {/* Mật khẩu */}
          <div className="input-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              name="password"
              placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
              onChange={handleChange}
              minLength={6}
              required
            />
          </div>

          {/* Số điện thoại */}
          <div className="input-group">
            <label>Số điện thoại</label>
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Nhập số điện thoại"
              onChange={handleChange}
            />
          </div>

          {/* Địa chỉ */}
          <div className="input-group">
            <label>Địa chỉ</label>
            <input
              type="text"
              name="address"
              placeholder="Nhập địa chỉ"
              onChange={handleChange}
            />
          </div>

          {/* Ảnh đại diện */}
          <div className="input-group">
            <label>Ảnh đại diện</label>
            <input
              type="file"
              name="avatar"
              accept="image/*"
              onChange={handleChange}
              className="file-input"
            />
          </div>

          {/* Nút đăng ký */}
          <button type="submit" className="register-button">
            Đăng ký
          </button>
        </form>

        <p className="switch-text">
          Đã có tài khoản? <Link to="/login">Đăng nhập ngay!</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
