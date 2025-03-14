import React, { useEffect, useState } from 'react';
import { getAllAccounts } from '/src/api/accountApi';
import StaffSidebar from './StaffSidebar';
import './StaffUser.css';

const StaffCustomerManager = () => {
    const [accounts, setAccounts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchAccounts = async () => {
        try {
            const data = await getAllAccounts();
            setAccounts(data);
        } catch (error) {
            alert(error.message || "Lỗi khi tải dữ liệu");
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const filteredAccounts = accounts.filter(acc =>
        acc.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <StaffSidebar />
            <div className="container">
                <h1 className="title">Quản lý tài khoản</h1>

                <div className="searchBar">
                    <input
                        type="text"
                        placeholder="Tìm theo tên hoặc email..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="searchInput"
                    />
                </div>

                <div className="tableContainer">
                    <table className="customerTable">
                        <thead>
                            <tr>
                                <th className="th">ID</th>
                                <th className="th">Tên đăng nhập</th>
                                <th className="th">Email</th>
                                <th className="th">Địa chỉ</th>
                                <th className="th">Số điện thoại</th>
                                <th className="th">Trạng thái</th>
                                <th className="th">Vai trò</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAccounts.map(acc => (
                                <tr key={acc.id} className="tr">
                                    <td className="td">{acc.id}</td>
                                    <td className="td">{acc.username}</td>
                                    <td className="td">{acc.email}</td>
                                    <td className="td">{acc.address}</td>
                                    <td className="td">{acc.phoneNumber}</td>
                                    <td className="td">{acc.status}</td>
                                    <td className="td">{acc.role}</td>
                                </tr>
                            ))}
                            {filteredAccounts.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="noResults">
                                        Không tìm thấy tài khoản nào
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default StaffCustomerManager;