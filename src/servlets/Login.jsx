import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import logo from "/src/images/logo.png";
import googleIcon from "/src/images/googleicon.png";
import loginImage from "/src/images/loginlogo.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Implement authentication logic here
    // Example: Call an API to verify credentials
    if (email === "test@example.com" && password === "password") {
      navigate("/dashboard"); // Navigate to dashboard on successful login
    } else {
      alert("Invalid credentials, please try again."); // Alert for invalid login
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={logo} alt="Skincare Logo" className="logo" />
        <h2>WELCOME BACK</h2>
        <p>We're glad to see you again!</p>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="options">
            <label>
              <input type="checkbox" /> Remember me
            </label>
            <a href="#">Forgot password?</a>
          </div>
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
