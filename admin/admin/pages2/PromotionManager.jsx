import React, { useEffect, useState } from "react";
import styles from "./PromotionManager.module.css";
import { createVoucher, deleteVoucher, getAllVouchers, } from "/src/api/voucherApi";
import Sidebar from "./Sidebar";

const PromotionManager = () => {
  const [promotions, setPromotions] = useState([]);
  const [newPromotion, setNewPromotion] = useState({
    code: "",
    type: "percentage",
    value: "",
    minOrder: "",
    startDate: "",
    endDate: "",
    usageLimit: "",
    description: "",
  });

  const promotionTypes = [
    { value: "percentage", label: "Giảm theo %" },
    { value: "fixed", label: "Giảm số tiền cố định" },
  ];

  const fetchPromotions = async () => {
    try {
      const response = await getAllVouchers();
      setPromotions(response.data);
      console.log("Fetched promotions:", response.data); // Log fetched promotions
    } catch (error) {
      console.error("Lỗi khi lấy danh sách khuyến mãi:", error);
    }
  };

  const addPromotion = async () => {
    try {
      await createVoucher(newPromotion);
      await fetchPromotions();
      resetNewPromotion();
      alert("Tạo mã khuyến mãi thành công!");
    } catch (error) {
      console.error("Lỗi khi tạo khuyến mãi:", error);
    }
  };

  const removePromotion = async (id, code) => {
    console.log("Removing promotion with ID:", id); // Log the ID being removed
    const confirmed = window.confirm(
      `Bạn có chắc muốn xoá mã khuyến mãi "${code}" không?`
    );
    if (!confirmed) return;

    try {
      await deleteVoucher(id);
      await fetchPromotions();
    } catch (error) {
      console.error("Lỗi khi xoá khuyến mãi:", error);
      alert("Xoá thất bại.");
    }
  };

  const resetNewPromotion = () => {
    setNewPromotion({
      code: "",
      type: "percentage",
      value: "",
      minOrder: "",
      startDate: "",
      endDate: "",
      usageLimit: "",
      description: "",
    });
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  return (
    <>
      <Sidebar />
      <div className={styles.container}>
        <h1>Quản lý mã khuyến mãi</h1>

        {/* Form tạo mới */}
        <div className={styles.formContainer}>
          <h2>Tạo mã khuyến mãi mới</h2>

          <div className={styles.formRow}>
            <label>Mã khuyến mãi</label>
            <input
              type="text"
              value={newPromotion.code}
              onChange={(e) =>
                setNewPromotion({
                  ...newPromotion,
                  code: e.target.value.toUpperCase(),
                })
              }
              placeholder="VD: GIAM10"
              className={styles.input}
            />
          </div>

          <div className={styles.formRow}>
            <label>Loại khuyến mãi</label>
            <select
              value={newPromotion.type}
              onChange={(e) =>
                setNewPromotion({ ...newPromotion, type: e.target.value })
              }
              className={styles.select}
            >
              {promotionTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formRow}>
            <label>
              {newPromotion.type === "percentage"
                ? "Phần trăm giảm (%)"
                : "Số tiền giảm (VNĐ)"}
            </label>
            <input
              type="number"
              value={newPromotion.value}
              onChange={(e) =>
                setNewPromotion({ ...newPromotion, value: e.target.value })
              }
              className={styles.input}
            />
          </div>

          <div className={styles.formRow}>
            <label>Đơn hàng tối thiểu (VNĐ)</label>
            <input
              type="number"
              value={newPromotion.minOrder}
              onChange={(e) =>
                setNewPromotion({ ...newPromotion, minOrder: e.target.value })
              }
              className={styles.input}
            />
          </div>

          <div className={styles.formRow}>
            <label>Ngày bắt đầu</label>
            <input
              type="datetime-local"
              value={newPromotion.startDate}
              onChange={(e) =>
                setNewPromotion({ ...newPromotion, startDate: e.target.value })
              }
              className={styles.input}
            />
          </div>

          <div className={styles.formRow}>
            <label>Ngày kết thúc</label>
            <input
              type="datetime-local"
              value={newPromotion.endDate}
              onChange={(e) =>
                setNewPromotion({ ...newPromotion, endDate: e.target.value })
              }
              className={styles.input}
            />
          </div>

          <div className={styles.formRow}>
            <label>Giới hạn lượt dùng</label>
            <input
              type="number"
              value={newPromotion.usageLimit}
              onChange={(e) =>
                setNewPromotion({ ...newPromotion, usageLimit: e.target.value })
              }
              className={styles.input}
            />
          </div>

          <div className={styles.formRow}>
            <label>Mô tả</label>
            <textarea
              value={newPromotion.description}
              onChange={(e) =>
                setNewPromotion({ ...newPromotion, description: e.target.value })
              }
              placeholder="Mô tả ngắn về chương trình khuyến mãi..."
              className={styles.textarea}
            />
          </div>

          <div className={styles.buttonRow}>
            <button onClick={addPromotion} className={styles.button}>
              Tạo khuyến mãi
            </button>
            <button onClick={resetNewPromotion} className={styles.resetButton}>
              Làm mới
            </button>
          </div>
        </div>

        {/* Danh sách mã khuyến mãi */}
        <div className={styles.promotionList}>
          <h2>Danh sách mã khuyến mãi</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mã</th>
                <th>Loại</th>
                <th>Giá trị</th>
                <th>Đơn tối thiểu</th>
                <th>Ngày bắt đầu</th>
                <th>Ngày kết thúc</th>
                <th>Lượt dùng</th>
                <th>Mô tả</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((promo) => (
                <tr key={promo._id}>
                  <td>{promo.code}</td>
                  <td>{promo.type === "percentage" ? "%" : "VNĐ"}</td>
                  <td>{promo.value}</td>
                  <td>{promo.minOrder}</td>
                  <td>{new Date(promo.startDate).toLocaleString()}</td>
                  <td>{new Date(promo.endDate).toLocaleString()}</td>
                  <td>{promo.usageLimit}</td>
                  <td>{promo.description}</td>
                  <td>
                    <button
                      onClick={() => removePromotion(promo._id, promo.code)}
                      className={styles.deleteBtn}
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default PromotionManager;