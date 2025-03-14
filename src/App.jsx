import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./App.css";
import { AuthProvider } from './auth/AuthProvider';
import PrivateRoute from './auth/PrivateRoute';

import Navbar from "/src/components/Navbar";
import Cart from "/src/components/Cart";
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
import Checkout from "./pages/Checkout";
import PaymentPage from "/src/pages/Payment";

import ProductList from "/src/pages/ProductList";
import ProductDetails from "/src/pages/ProductDetails";
import AboutUs from "/src/components/Aboutus";
import AboutSkincare from "/src/pages/AboutSkincare";
import OrderHistory from './pages/OrderHistory';
import Dashboard from "/admin/admin/pages2/Dashboard"; // Import the Dashboard component

// Import additional components
import PromotionManager from "/admin/admin/pages2/PromotionManager";
import ProductManager from "/admin/admin/pages2/ProductManager";
import OrderManager from "/admin/admin/pages2/OrderManager";
import ContentManager from "/admin/admin/pages2/ContentManager";
import CustomerManager from "/admin/admin/pages2/CustomerManager";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          {/* Conditionally render Navbar */}
          {!window.location.pathname.startsWith("/admin") && <Navbar />}

          <div className="content-wrapper">
            {/* Main Content */}
            <div className="container mt-4">
              <Routes>
                <Route path="/" element={<><Carousel /><AboutUs /><FeaturedNews /></>} />
                <Route path="/test-loai-da" element={<SkinTest />} />
                <Route path="/cart-items" element={<CartItems />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/order-detail" element={<OrderDetail />} />
                <Route path="/Checkout" element={<Checkout />} />
                <Route path="/product-list" element={<ProductList />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/ho-so" element={<Profile />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/payment" element={<PaymentPage />} />
                <Route path="/AboutSkincare" element={<AboutSkincare />} />

                <Route path="/order-details" element={
                  <PrivateRoute>
                    <OrderDetail />
                  </PrivateRoute>
                } />

                <Route path="/profile" element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                } />

                <Route path="/order/:orderId" element={<OrderDetail />} />
                <Route path="/order-history" element={<OrderHistory />} />

                {/* Admin routes */}
                <Route path="/admin/dashboard" element={<Dashboard />} />
                <Route path="/admin/promotions" element={<PromotionManager />} />
                <Route path="/admin/productsmanager" element={<ProductManager />} />
                <Route path="/admin/customermanager" element={<CustomerManager />} />
                <Route path="/admin/orders" element={<OrderManager />} />
                <Route path="/admin/content" element={<ContentManager />} />

                <Route path="*" element={<h1>404 - Không tìm thấy trang</h1>} />
              </Routes>
            </div>
          </div>

          {/* Conditionally render Footer */}
          {!window.location.pathname.startsWith("/admin") && <Footer />}
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
