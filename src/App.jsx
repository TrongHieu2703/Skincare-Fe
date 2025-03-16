import React from "react";
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

// Admin pages
import Dashboard from "/admin/admin/pages2/Dashboard";
import PromotionManager from "/admin/admin/pages2/PromotionManager";
import ProductManager from "/admin/admin/pages2/ProductManager";
import OrderManager from "/admin/admin/pages2/OrderManager";
import ContentManager from "/admin/admin/pages2/ContentManager";
import CustomerManager from "/admin/admin/pages2/CustomerManager";

// Staff pages
import StaffDashboard from "/staff/pages3/StaffDashboard";
import StaffOrder from "/staff/pages3/StaffOrder";
import StaffProdcut from "/staff/pages3/StaffProduct";
import StaffUser from "/staff/pages3/StaffUser";

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");
  const isStaffPage = location.pathname.startsWith("/staff");

  return (
    <div className="app-container">
      {/* Conditionally render Navbar */}
      {!isAdminPage && !isStaffPage && <Navbar />}

      <div className="content-wrapper">
        <div className="container mt-4">
          <Routes>
            {/* Public routes */}
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
            <Route path="/order/:orderId" element={<OrderDetail />} />
            <Route path="/order-history" element={<OrderHistory />} />

            {/* Private routes */}
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

            {/* Admin routes */}
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/promotions" element={<PromotionManager />} />
            <Route path="/admin/productsmanager" element={<ProductManager />} />
            <Route path="/admin/customermanager" element={<CustomerManager />} />
            <Route path="/admin/orders" element={<OrderManager />} />
            <Route path="/admin/content" element={<ContentManager />} />

            {/* Staff routes */}
            <Route path="/staff/dashboard" element={<StaffDashboard />} />
            <Route path="/staff/orders" element={<StaffOrder />} />
            <Route path="/staff/products" element={<StaffProdcut />} />
            <Route path="/staff/user" element={<StaffUser />} />
            {/* 404 */}
            <Route path="*" element={<h1>404 - Không tìm thấy trang</h1>} />
          </Routes>
        </div>
      </div>

      {/* Conditionally render Footer */}
      {!isAdminPage && !isStaffPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppContent />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
