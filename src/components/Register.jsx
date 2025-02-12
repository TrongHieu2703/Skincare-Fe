import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./register.css"; // Import CSS

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Mật khẩu nhập lại không khớp!");
      return;
    }
    console.log("Đăng ký thành công:", { name, email, password });
    navigate("/login"); // Chuyển hướng về trang Login sau khi đăng ký thành công
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Đăng Ký</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Họ và tên</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Nhập lại mật khẩu</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="register-button">
            Đăng ký
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
