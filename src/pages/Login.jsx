import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/authApi"; // Import từ authApi.js
import "/src/styles/Login.css";
import logo from "/src/assets/images/logo.png";
import googleIcon from "/src/assets/images/googleicon.png";
import loginImage from "/src/assets/images/loginlogo.jpg";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Hàm xử lý thay đổi input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Hàm xử lý khi submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser({
        email: formData.email,
        password: formData.password
      });

      // Lưu thông tin người dùng nếu API trả về
      localStorage.setItem("user", JSON.stringify({
        email: response.email,
        username: response.username,
        role: response.role,
        avatar: response.avatar,
        phoneNumber: response.phoneNumber,
        address: response.address
      }));

      setMessage("Đăng nhập thành công!");
      setTimeout(() => navigate("/blog"), 1500); // Chuyển hướng sau khi đăng nhập
    } catch (error) {
      setMessage(error.message || "Đăng nhập thất bại!");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={logo} alt="Skincare Logo" className="logo" />
        <h2>WELCOME BACK</h2>
        <p>We're glad to see you again!</p>

        {message && <div className={`message ${message.includes("thành công") ? "success" : "error"}`}>{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="********"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="login-button">Sign in</button>

          <button type="button" className="google-button">
            <img src={googleIcon} alt="Google Icon" /> Sign in with Google
          </button>

          <p className="register-link">
            Don't have an account? <span onClick={() => navigate("/register")} className="signup-link">Sign up for free!</span>
          </p>
        </form>
      </div>

      <div className="login-image">
        <img src={loginImage} alt="Skincare" />
      </div>
    </div>
  );
};

export default Login;
