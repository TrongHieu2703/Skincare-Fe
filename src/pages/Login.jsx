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
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser(formData);
      setMessage("Đăng nhập thành công!");
      setTimeout(() => navigate("/"), 2000);
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

        {message && <p className="error-message">{message}</p>}

        <form onSubmit={handleSubmit}>
          <input type="email" name="email" placeholder="Enter your email" onChange={handleChange} required />
          <input type="password" name="password" placeholder="********" onChange={handleChange} required />
          <button type="submit" className="login-button">Sign in</button>
          <button className="google-button">
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


