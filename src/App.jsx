import React, { memo } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./App.css";
import { AuthProvider } from './auth/AuthProvider';
import { CartProvider } from './store/CartContext';
import PrivateRoute from './auth/PrivateRoute';

// Components
import Navbar from "/src/components/Navbar";
import Cart from "/src/components/Cart";
import Footer from "/src/components/Footer";
import Carousel from "/src/components/Carousel";
import FeaturedNews from "/src/components/FeaturedNews";
import Blog from "/src/components/Blog";
import BlogDetail from "/src/components/BlogDetail";
import SkinTest from "/src/pages/SkinTest";
import Rountine from "/src/pages/Rountine";
import Login from "/src/pages/Login";
import Register from "/src/pages/Register";
import Profile from "/src/pages/Profile";
import CartItems from "./pages/CartItems";
import Checkout from "./pages/Checkout";
import PaymentPage from "/src/pages/Payment";
import ProductList from "./pages/ProductList";
import ProductDetails from "./pages/ProductDetails";
import AboutUs from "/src/components/Aboutus";
import AboutSkincare from "/src/pages/AboutSkincare";
import OrderHistory from './pages/OrderHistory';
import OrderDetails from './pages/OrderDetails';
import ProductComparison from "./pages/ProductComparison";

import AdminProducts from './pages/AdminProducts';
import Home from './pages/Home';

// Admin pages
import Dashboard from "/admin/admin/pages2/Dashboard";
import ProductManager from "/admin/admin/pages2/ProductManager";
import OrderManager from "/admin/admin/pages2/OrderManager";
import ContentManager from "/admin/admin/pages2/ContentManager";
import CustomerManager from "/admin/admin/pages2/CustomerManager";
import VoucherManager from "/admin/admin/pages2/VoucherManager";

// Staff pages
import StaffDashboard from "/staff/pages3/StaffDashboard";
import StaffOrder from "/staff/pages3/StaffOrder";
import StaffProduct from "/staff/pages3/StaffProduct";
import StaffUser from "/staff/pages3/StaffUser";
import StaffBlog from "/staff/pages3/StaffBlog";
import StaffVouncher from "/staff/pages3/StaffVouncher";

// Memoize AppContent to prevent unnecessary rerenders
const AppContent = memo(function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");
  const isStaffPage = location.pathname.startsWith("/staff");

  console.log("Rendering AppContent at path:", location.pathname);

  return (
    <div className="app-container">
      {/* Conditionally render Navbar */}
      {!isAdminPage && !isStaffPage && <Navbar />}

      <div className="content-wrapper">
        <div className="container mt-4">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/test-loai-da" element={<SkinTest />} />
            <Route path="/routine/:skinType" element={<Rountine />} />
            <Route path="/cart-items" element={<CartItems />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/order-detail" element={<OrderDetails />} />
            <Route path="/Checkout" element={<Checkout />} />
            <Route path="/product-list" element={<ProductList />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogDetail />} />

            <Route path="/ho-so" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/AboutSkincare" element={<AboutSkincare />} />
            <Route path="/order/:orderId" element={<OrderDetails />} />
            <Route path="/order-history" element={<OrderHistory />} />
            <Route path="/product-comparison" element={<ProductComparison />} />

            {/* Private routes */}
            <Route path="/order-details" element={
              <PrivateRoute>
                <OrderDetails />
              </PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />

            {/* Admin routes */}
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/productsmanager" element={<ProductManager />} />
            <Route path="/admin/customermanager" element={<CustomerManager />} />
            <Route path="/admin/orders" element={<OrderManager />} />
            <Route path="/admin/content" element={<ContentManager />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/vouchers" element={<VoucherManager />} />
            {/* Staff routes */}
            <Route path="/staff/dashboard" element={<StaffDashboard />} />
            <Route path="/staff/orders" element={<StaffOrder />} />
            <Route path="/staff/products" element={<StaffProduct />} />
            <Route path="/staff/user" element={<StaffUser />} />
            <Route path="/staff/blogs" element={<StaffBlog />} />
            <Route path="/staff/vounchers" element={<StaffVouncher />} />
            {/* 404 */}
            <Route path="*" element={<h1>404 - Không tìm thấy trang</h1>} />
          </Routes>
        </div>
      </div>


    </div>
  );
});

function App() {
  console.log("Rendering App component");

  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;