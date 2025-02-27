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
import CartItems from "/src/pages/CartItems";
import OrderDetail from "./pages/OrderDetails";
import PaymentPage from "/src/pages/Payment";

import AdminDashboard from "/src/admin/pages2/AdminDashboard";
import ManageProducts from "/src/admin/pages2/ManageProducts";
import ManageOrders from "/src/admin/pages2/ManageOrders";
import ManageCustomers from "/src/admin/pages2/ManageCustomers";

import ProductList from "/src/pages/ProductList";
import ProductDetails from "/src/pages/ProductDetails";


function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <div className="content-wrapper">
          {/* Main Content */}
          <div className="container mt-4">
            <Routes>
              <Route path="/" element={<><Carousel /><FeaturedNews /></>} />
              <Route path="/test-loai-da" element={<SkinTest />} />
              <Route path="/cartitems" element={<CartItems />} />
              <Route path="/order-detail" element={<OrderDetail />} />
              <Route path="/product-list" element={<ProductList />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/ho-so" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<ManageProducts />} />
              <Route path="/admin/orders" element={<ManageOrders />} />
              <Route path="/admin/customers" element={<ManageCustomers />} />
            
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
