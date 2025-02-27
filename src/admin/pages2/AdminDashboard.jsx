import React from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaShoppingCart, FaBox, FaChartLine } from 'react-icons/fa';
import './AdminDashboard.css';

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="dashboard-cards">
        <Link to="/admin/products" className="dashboard-card">
          <FaBox />
          <h2>Manage Products</h2>
        </Link>
        <Link to="/admin/orders" className="dashboard-card">
          <FaShoppingCart />
          <h2>Manage Orders</h2>
        </Link>
        <Link to="/admin/customers" className="dashboard-card">
          <FaUsers />
          <h2>Manage Customers</h2>
        </Link>
        <Link to="/admin/reports" className="dashboard-card">
          <FaChartLine />
          <h2>Reports</h2>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;