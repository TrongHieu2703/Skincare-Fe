import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/authApi";
import "/src/styles/Login.css";
import logo from "/src/assets/images/logo.png";
import googleIcon from "/src/assets/images/googleicon.png";
import loginImage from "/src/assets/images/loginlogo.jpg";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser({
        email: formData.email,
        password: formData.password
      });


      console.log("Phản hồi đăng nhập:", response);
      localStorage.setItem("user", JSON.stringify({
        id: response.id,
        email: response.email,
        username: response.username,
        role: response.role,
        avatar: response.avatar,
        phoneNumber: response.phoneNumber,
        address: response.address
      }));

      setMessage("Đăng nhập thành công!");
      setShowToast(true);
      if (response.role === "Admin") {
        setTimeout(() => {
          navigate("/dashboard");
          setShowToast(false);
        }, 1500);
      } else {
        setTimeout(() => {
          navigate("/");
          setShowToast(false);
        }, 1500);
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      setMessage(error.message || "Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin.");
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

          <button type="submit" className="login-button">
            Đăng nhập
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
