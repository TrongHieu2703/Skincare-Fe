import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home"; // Thêm Home.jsx
import SkinTest from "./servlets/SkinTest";
import Navbar from "./components/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Carousel from "./components/Carousel";
import Cart from "./components/Cart";
import FeaturedNews from "./components/FeaturedNews";
import Footer from "./components/Footer";
import Login from "./servlets/Login";
import Register from "./servlets/Register";
import Profile from "./servlets/Profile";
import Blog from "./components/Blog";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          {/* Route trang chủ dùng Home.jsx */}
          <Route path="/" element={<Home />} />
          
          <Route path="/test-loai-da" element={<SkinTest />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/san-pham" element={<FeaturedNews />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/ho-so" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Route bắt lỗi 404 */}
          <Route path="*" element={<h1>404 - Page Not Found</h1>} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;
