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

      const userRole = response.role; // Get user role
      localStorage.setItem("user", JSON.stringify({

        email: response.email,
        username: response.username,
        role: response.role,
        avatar: response.avatar,
        phoneNumber: response.phoneNumber,
        address: response.address
      }));

      setMessage("Đăng nhập thành công!"); // Success message

      setShowToast(true);

      setTimeout(() => {
        if (userRole === "Admin") {
          navigate("/dashboard"); // Redirect to dashboard for admin
        } else {
          navigate("/"); // Redirect to default page for user
        }

        setShowToast(false);
        navigate("/");
      }, 3000);

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

      {/* Thông báo đăng nhập thành công */}
      <div className={`success-toast ${showToast ? "show" : ""}`} style={{ backgroundColor: '#28a745' }}>

        Đăng nhập thành công!
      </div>
    </div>
  );
};

export default Login;
