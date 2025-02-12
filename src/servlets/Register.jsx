import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";
import logo from "/src/images/logo.png"; 
import signupImage from "/src/images/signup-image.jpg";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Registered successfully:", { username, email, phone, password });
    navigate("/login");
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
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Confirm password</label>
            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
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
            <label>Phone Number</label>
            <input
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
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
