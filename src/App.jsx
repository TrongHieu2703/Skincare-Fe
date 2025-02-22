import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SkinTest from "./servlets/SkinTest";
import Navbar from "./components/Navbar";
import FeaturedNews from "./components/FeaturedNews";
import Footer from "./components/Footer";
import Profile from "./servlets/Profile";
import Carousel from "./components/Carousel";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import SkinTest from "./servlets/SkinTest";
import Login from "./servlets/Login";
import Register from "./servlets/Register";
import Profile from "./servlets/Profile";
import Contact from "./components/Blog";
import Blog from "./components/Blog";

function AppContent() {
  const location = useLocation();
  const isSkintestPage = location.pathname === '/skin-test';

  return (
    <div className="app-wrapper">
      <Navbar />
      <div className="container mt-4"> {/* Thêm class container để căn giữa */}
        <Routes>
          {/* Route trang chủ */}
          <Route
            path="/"
            element={
              <>
                <Carousel />
                <div className="main-content">
                  <Cart />
                  <FeaturedNews />
                </div>
              </>
            }
          />
          <Route path="/test-loai-da" element={<SkinTest />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/san-pham" element={<FeaturedNews />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/ho-so" element={<Profile />} />
          <Route path="/blog" element={<Blog />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
