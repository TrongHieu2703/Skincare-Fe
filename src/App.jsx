import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./App.css";
import Navbar from "/src/components/Navbar";
import Footer from "/src/components/Footer";
import Carousel from "/src/components/Carousel";
import FeaturedNews from "/src/components/FeaturedNews";
import Blog from "/src/components/Blog";
import SkinTest from "/src/pages/SkinTest";
import Login from "/src/pages/Login";
import Register from "/src/pages/Register";
import Profile from "/src/pages/Profile";
import Cart from "/src/components/Cart";


function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <div className="content-wrapper">
          {/* Hero Section */}
          <div className="hero-section">
            <div className="container">
              <h1>Chăm sóc da của bạn</h1>
              <p>Khám phá các sản phẩm chăm sóc da tốt nhất</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="container mt-4">
            <Routes>
              <Route path="/" element={
                <>
                  <Carousel />
                  <Cart />
                  <FeaturedNews />
                </>
              } />
              <Route path="/test-loai-da" element={<SkinTest />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/san-pham" element={<FeaturedNews />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/ho-so" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<h1>404 - Không tìm thấy trang</h1>} />
            </Routes>
          </div>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
