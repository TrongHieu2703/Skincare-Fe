import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaClipboardList, FaBox, FaUsers, FaChartBar, FaSignOutAlt } from 'react-icons/fa';
import './StaffSidebar.css';

const StaffSidebar = () => {
    return (
        <div className="sidebar">
            <h2 className="sidebar-title">Nhân viên</h2>
            <ul className="sidebar-menu">
                <li>
                    <NavLink to="/staff/dashboard">
                        <FaTachometerAlt /> Tổng quan
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/staff/orders">
                        <FaClipboardList /> Quản lý đơn hàng
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/staff/products">
                        <FaBox /> Quản lý sản phẩm
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/staff/user">
                        <FaUsers /> Quản lý khách hàng
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/staff/blogs">
                        <FaChartBar /> Quản lý bài đăng
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/staff/vounchers">
                        <FaChartBar /> Quản lý khuyến mãi
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/login">
                        <FaSignOutAlt /> Đăng xuất
                    </NavLink>
                </li>
            </ul>
        </div>
    );
};

export default StaffSidebar;
