import React, { useEffect, useState } from "react";
import "./StaffVouncher.css";
import { deleteVoucher, getAllVouchers } from "/src/api/voucherApi";
import Sidebar from "./StaffSidebar";

const PromotionManager = () => {
    const [promotions, setPromotions] = useState([]);
    const [isStaff, setIsStaff] = useState(false); // Add state for staff

    const fetchPromotions = async () => {
        try {
            const response = await getAllVouchers();
            setPromotions(response.data);
            console.log("Fetched promotions:", response.data); // Log fetched promotions
        } catch (error) {
            console.error("Lỗi khi lấy danh sách khuyến mãi:", error);
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

    useEffect(() => {
        fetchPromotions();
    }, []);

    return (
        <>
            <Sidebar />
            <div className="container">
                <h1>Quản lý mã khuyến mãi</h1>
                {/* Danh sách mã khuyến mãi */}
                <div className="promotionList">
                    <h2>Danh sách mã khuyến mãi</h2>
                    <table className="table">
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
                                        {!isStaff && (
                                            <button
                                                onClick={() => removePromotion(promo._id, promo.code)}
                                                className="deleteBtn"
                                            >
                                                Xoá
                                            </button>
                                        )}
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