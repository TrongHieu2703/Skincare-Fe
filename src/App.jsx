import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; // Import Route and Routes
import SkinTest from "./servlets/SkinTest"; // Import SkinTest component


import Navbar from "./components/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Carousel from "./components/Carousel"; // Import Carousel component
import Cart from "./components/Cart"; // Import Cart component
import FeaturedNews from "./components/FeaturedNews"; // Import FeaturedNews component
import Footer from "./components/Footer";

function App() {
  return (
    <Router>
      <Navbar />
      <div style={{ marginTop: "80px" }}> {/* Increased margin to ensure carousel is visible */}
        <Routes>
          <Route path="/" element={<Carousel />} />
          <Route path="/test-loai-da" element={<SkinTest />} /> {/* Add route for skin test */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/san-pham" element={<FeaturedNews />} />

          <Route path="/cart" element={<Cart />} />
          <Route path="/san-pham" element={<FeaturedNews />} />
          {/* Add other routes as necessary */}
        </Routes>



        <Carousel />
        <Cart /> {/* Hiển thị giỏ hàng ngay dưới carousel */}
        <FeaturedNews /> {/* Thêm phần Tin tức nổi bật dưới giỏ hàng */}
      </div>
      <Footer />
    </Router>
  );
}

// Đảm bảo export nằm ngoài hàm
export default App;
