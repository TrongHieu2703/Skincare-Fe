import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import SkinTest from "./servlets/SkinTest";
import FeaturedNews from "./components/FeaturedNews";
import Footer from "./components/Footer";
import Login from "./servlets/Login";
import Register from "./servlets/Register";
import Profile from "./servlets/Profile";
import Blog from "./components/Blog";
import Carousel from "./components/Carousel";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Cart from "./components/Cart";

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Navbar />
        <main className="main-content">
          <div className="container mt-4">
            <Carousel />
            <Cart />
            <Routes>
              <Route path="/" element={<FeaturedNews />} />  {/* Trang chủ */}
              <Route path="/test-loai-da" element={<SkinTest />} />
              <Route path="/san-pham" element={<FeaturedNews />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/ho-so" element={<Profile />} />
              <Route path="/blog" element={<Blog />} />
            </Routes>
          </div>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
