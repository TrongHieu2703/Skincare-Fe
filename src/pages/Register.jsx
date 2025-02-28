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
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setMessage("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    try {
      await registerUser(formData);
      setMessage("Đăng ký thành công! Hãy đăng nhập.");
      setTimeout(() => navigate("/login"), 2000); // Điều hướng sau 2s
    } catch (error) {
      setMessage(error.message || "Đăng ký thất bại!");
    }
  };

  return (
    <div className="register-container">
      <div className="register-image">
        <img src={signupImage} alt="Signup" />
      </div>
      <div className="register-box">
        <img src={logo} alt="Skincare Logo" className="logo" />
        <h2>SIGN UP</h2>
        <p>Join Us Today!</p>

        {message && <p className="error-message">{message}</p>}

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <input
            type="text"
            name="username"
            placeholder="Username"
            onChange={handleChange}
            minLength={3}
            required
          />

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />

          {/* Password */}
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            minLength={6}
            required
          />

          {/* PhoneNumber */}
          <input
            type="text"
            name="phoneNumber"
            placeholder="Phone Number"
            onChange={handleChange}
          />

          {/* Address */}
          <input
            type="text"
            name="address"
            placeholder="Address"
            onChange={handleChange}
          />

          {/* Avatar - File Input */}
          <input
            type="file"
            name="avatar"
            accept="image/*" // Chỉ chấp nhận tệp hình ảnh
            onChange={handleChange} // Hàm xử lý khi chọn tệp
          />

          {/* Submit Button */}
          <button type="submit" className="register-button">
            Sign Up
          </button>
        </form>

        <p className="switch-text">
          Have an account? <Link to="/login">Sign in now!</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
