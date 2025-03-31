// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginUser } from "../api/authApi";
import { useAuth } from "../auth/AuthProvider"; // Import Hook từ Context
import "/src/styles/Login.css";
import logo from "/src/assets/images/logo.png";
import googleIcon from "/src/assets/images/googleicon.png";
import loginImage from "/src/assets/images/loginlogo.jpg";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const returnUrl = location.state?.returnUrl || "/";

  // Lấy hàm login từ context
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log("Attempting login with:", formData.email);
       
      // Gọi API lấy userData + token
      const result = await loginUser({
        email: formData.email,
        password: formData.password
      });
      
      console.log("Login result:", result);
      
      if (result && result.userData && result.token) {
        // Thêm log để debug
        console.log("Login successful, userData:", result.userData);
        
        // Dùng hàm login của AuthContext để lưu user + token
        login(result.userData, result.token);
       
        setMessage("Đăng nhập thành công!");
        setShowToast(true);

        // Chuyển trang sau 1.5s
        setTimeout(() => {
          if (result.userData.role === "Admin") {
            navigate("/admin/dashboard");
          } else if (result.userData.role === "Staff") {
            navigate("/staff/dashboard");
          } else {
            navigate(returnUrl);
          }
          setShowToast(false);
        }, 1500);
      } else {
        console.error("Login response error - missing data");
        setMessage("Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin.");
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      setMessage(error.message || "Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-header">
          <img src={logo} alt="Logo" className="login-logo" />
          <h1>Đăng nhập</h1>
          <p>Rất vui được gặp lại bạn!</p>

          {message && (
            <div className={`message ${message.includes("thành công") ? "success" : "error"}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Nhập địa chỉ email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Mật khẩu</label>
              <input
                type="password"
                name="password"
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="remember-forgot">
              <label>
                <input type="checkbox" /> Ghi nhớ đăng nhập
              </label>
              <a href="#">Quên mật khẩu?</a>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            <div className="separator">
              <span className="separator-text">hoặc</span>
            </div>

            <button type="button" className="google-button">
              <img src={googleIcon} alt="Google" className="google-icon" />
              Đăng nhập với Google
            </button>

            <div className="register-link">
              Chưa có tài khoản? <a href="/register">Đăng ký ngay</a>
            </div>
          </form>
        </div>
      </div>
      <div className="login-right">
        <img src={loginImage} alt="Skincare" />
      </div>

      <div className={`success-toast ${showToast ? "show" : ""}`} style={{ backgroundColor: '#28a745' }}>
        Đăng nhập thành công!
      </div>
    </div>
  );
};

export default Login;
