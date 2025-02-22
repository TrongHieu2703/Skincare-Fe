import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Products from "./components/Products";
import Footer from "./components/Footer";
import Profile from "./servlets/Profile";
import Carousel from "./components/Carousel";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Blog from "./servlets/Blog";
import SkinTest from "./servlets/SkinTest";
import Login from "./servlets/Login";
import Register from "./servlets/Register";
import Cart from "./components/Cart";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Navbar />
        <main className="main-content">
          <div className="container mt-4">
            <Routes>
              <Route exact path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<Blog />} />
              <Route path="/blog/category/:category" element={<Blog />} />
              <Route path="/skin-test" element={<SkinTest />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
        <Carousel />
        <Cart />
        <Footer />
      </div>
    </Router>
  );
}

export default App;
