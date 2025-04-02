import React, { useEffect, useState } from 'react';
import { getAllAccounts, deleteAccount, updateAccountInfo, createAccount } from '/src/api/accountApi';
import { Trash2, Pencil } from 'lucide-react';
import Sidebar from './Sidebar';
import styles from './CustomerManager.module.css';
import ConfirmationModal from "/src/components/ConfirmationModal";

const CustomerManager = () => {
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editAccount, setEditAccount] = useState(null);
  const [newAccount, setNewAccount] = useState({
    username: '',
    email: '',
    address: '',
    phoneNumber: '',
    status: 'active',
    role: 'customer'
  });

  // Add state for delete confirmation modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    accountId: null,
    accountName: ''
  });

  const fetchAccounts = async () => {
    try {
      const data = await getAllAccounts();
      setAccounts(data);
    } catch (error) {
      alert(error.message || "Lỗi khi tải dữ liệu");
    }
  };

  // Update the handleDelete function to work with confirmation modal
  const handleDelete = async (id) => {
    try {
      await deleteAccount(id);
      setAccounts(accounts.filter(acc => acc.id !== id));
      alert("Xóa thành công");
    } catch (error) {
      alert(error.message || "Lỗi khi xóa");
    }
  };

  // Add function to show delete confirmation modal
  const showDeleteConfirmation = (account) => {
    setDeleteModal({
      isOpen: true,
      accountId: account.id,
      accountName: account.username
    });
  };

  // Add function to close delete confirmation modal
  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      accountId: null,
      accountName: ''
    });
  };

  // Add function to handle delete confirmation
  const confirmDeleteAccount = async () => {
    if (deleteModal.accountId) {
      await handleDelete(deleteModal.accountId);
    }
  };

  const handleEditChange = (field, value) => {
    setEditAccount(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async () => {
    if (editAccount && editAccount.username && editAccount.email) {
      try {
        await updateAccountInfo(editAccount);
        setAccounts(accounts.map(acc =>
          acc.id === editAccount.id ? editAccount : acc
        ));
        setEditAccount(null);
        alert('Cập nhật thành công');
      } catch (error) {
        console.error('Error updating account:', error);
        alert('Cập nhật thông tin tài khoản thất bại.');
      }
    } else {
      alert('Vui lòng nhập đầy đủ thông tin!');
    }
  };

  const handleNewAccountChange = (field, value) => {
    setNewAccount(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateAccount = async () => {
    if (newAccount.username && newAccount.email) {
      try {
        const createdAccount = await createAccount(newAccount);
        setAccounts([...accounts, createdAccount]);
        setNewAccount({
          username: '',
          email: '',
          address: '',
          phoneNumber: '',
          status: 'active',
          role: 'customer'
        });
        alert('Tạo tài khoản thành công');
      } catch (error) {
        console.error('Error creating account:', error);
        alert('Tạo tài khoản thất bại.');
      }
    } else {
      alert('Vui lòng nhập đầy đủ thông tin!');
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
      <Sidebar />
      <div className={styles.container}>
        <h1 className={styles.title}>Quản lý tài khoản</h1>

        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.customerTable}>
            <thead>
              <tr>
                <th className={styles.th}>ID</th>
                <th className={styles.th}>Tên đăng nhập</th>
                <th className={styles.th}>Email</th>
                <th className={styles.th}>Địa chỉ</th>
                <th className={styles.th}>Số điện thoại</th>
                <th className={styles.th}>Trạng thái</th>
                <th className={styles.th}>Vai trò</th>
                <th className={styles.th}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map(acc => (
                <tr key={acc.id} className={styles.tr}>
                  <td className={styles.td}>{acc.id}</td>
                  <td className={styles.td}>{acc.username}</td>
                  <td className={styles.td}>{acc.email}</td>
                  <td className={styles.td}>{acc.address}</td>
                  <td className={styles.td}>{acc.phoneNumber}</td>
                  <td className={styles.td}>{acc.status}</td>
                  <td className={styles.td}>{acc.role}</td>
                  <td className={styles.td}>
                    <div className={styles.actionButtons}>

                      <button
                        onClick={() => showDeleteConfirmation(acc)}
                        className={`${styles.button} ${styles.delete}`}
                      >
                        <Trash2 size={16} /> Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAccounts.length === 0 && (
                <tr>
                  <td colSpan="8" className={styles.noResults}>
                    Không tìm thấy tài khoản nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>



        {/* Add delete confirmation modal */}
        <ConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={confirmDeleteAccount}
          title="Xác nhận xóa tài khoản"
          message="Bạn có chắc chắn muốn xóa"
          itemName={deleteModal.accountName}
          itemType="tài khoản"
        />
      </div>

      {/* Modal chỉnh sửa tài khoản */}
      {editAccount && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <span className={styles.modalClose} onClick={() => setEditAccount(null)}>&times;</span>
            <h2 className={styles.modalHeader}>Chỉnh sửa tài khoản</h2>

            <div className={styles.modalForm}>
              <input
                type="text"
                placeholder="Tên đăng nhập"
                value={editAccount.username}
                onChange={e => handleEditChange('username', e.target.value)}
                className={styles.input}
              />
              <input
                type="email"
                placeholder="Email"
                value={editAccount.email}
                onChange={e => handleEditChange('email', e.target.value)}
                className={styles.input}
              />
              <input
                type="text"
                placeholder="Địa chỉ"
                value={editAccount.address}
                onChange={e => handleEditChange('address', e.target.value)}
                className={styles.input}
              />
              <input
                type="text"
                placeholder="Số điện thoại"
                value={editAccount.phoneNumber}
                onChange={e => handleEditChange('phoneNumber', e.target.value)}
                className={styles.input}
              />
              <select
                value={editAccount.status}
                onChange={e => handleEditChange('status', e.target.value)}
                className={styles.select}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select
                value={editAccount.role}
                onChange={e => handleEditChange('role', e.target.value)}
                className={styles.select}
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
                <option value="admin">Staff</option>
              </select>
            </div>

            <div className={styles.modalButtons}>
              <button
                onClick={() => setEditAccount(null)}
                className={`${styles.button} ${styles.cancel}`}
              >
                Hủy
              </button>
              <button
                onClick={handleUpdate}
                className={`${styles.button} ${styles.save}`}
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerManager;
