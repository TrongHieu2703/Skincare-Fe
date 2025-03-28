// src/pages/Login.jsx (hoặc tương tự)
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

  // Lấy hàm login từ context
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {

      // Gọi API lấy userData + token
      const { userData, token } = await loginUser({
        email: formData.email,
        password: formData.password
      });

      // Dùng hàm login của AuthContext để lưu user + token
      login(userData, token);


      setMessage("Đăng nhập thành công!");
      setShowToast(true);


      // Chuyển trang sau 1.5s
      setTimeout(() => {
        if (userData.role === "Admin") {
          navigate("/admin/dashboard");
        } else if (userData.role === "Staff") {
          navigate("/staff/dashboard");
        } else {
          navigate("/");
        }
        setShowToast(false);
      }, 1500);
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      setMessage("Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={logo} alt="Logo Skincare" className="logo" />
        <h2>CHÀO MỪNG TRỞ LẠI</h2>
        <p>Rất vui được gặp lại bạn!</p>

        {message && (
          <div className={`message ${message.includes("thành công") ? "success" : "error"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>

          <button type="button" className="google-button">
            <img src={googleIcon} alt="Google Icon" />
            Đăng nhập với Google
          </button>

          <p className="register-link">
            Chưa có tài khoản?{" "}
            <span onClick={() => navigate("/register")} className="signup-link">
              Đăng ký miễn phí!
            </span>
          </p>
        </form>
      </div>

      <div className="login-image">
        <img src={loginImage} alt="Skincare" />
      </div>

      <div className={`success-toast ${showToast ? "show" : ""}`} style={{ backgroundColor: '#28a745' }}>
        Đăng nhập thành công!
      </div>
    </div>
  );
};

export default Login;
