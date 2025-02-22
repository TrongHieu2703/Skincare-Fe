import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
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
import Cart from "./components/Cart";
import Blog from "./components/Blog";

function AppContent() {
  const location = useLocation();
  const isSkintestPage = location.pathname === '/skin-test';

  return (
    <div className="app-wrapper">
      <Navbar />
      <main className="main-content">
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<FeaturedNews />} />  {/* Trang chủ */}
            <Route path="/skin-test" element={<SkinTest />} />
            <Route path="/products" element={<FeaturedNews />} />
            <Route path="/blog/*" element={<Blog />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
        {!isSkintestPage && <Carousel />}
        {!isSkintestPage && <Cart />}
      </main>
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
