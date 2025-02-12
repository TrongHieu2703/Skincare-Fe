import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SkinTest from "./servlets/SkinTest";
import Navbar from "./components/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Carousel from "./components/Carousel";
import Cart from "./components/Cart";
import FeaturedNews from "./components/FeaturedNews";
import Footer from "./components/Footer";
import Login from "./components/Login";
import Register from "./components/Register";

function App() {
  return (
    <Router>
      <Navbar />
      <div style={{ marginTop: "80px" }}>
        <Routes>
          {/* Route trang chủ */}
          <Route
            path="/"
            element={
              <>
                <Carousel />
                <Cart />
                <FeaturedNews />
              </>
            }
          />
          <Route path="/test-loai-da" element={<SkinTest />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/san-pham" element={<FeaturedNews />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;
