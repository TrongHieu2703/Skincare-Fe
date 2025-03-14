import React, { useState, useEffect } from "react";
import styles from "./ProductManager.module.css";
import Sidebar from "./Sidebar";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

// Các hàm API cho Product
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "/src/api/productApi";

// Giả lập hàm API cho brand & product type
// Thực tế bạn tạo file brandApi.js, productTypeApi.js
async function getAllBrands() {
  // return axiosClient.get("/Brand"); ...
  return [
    { id: 1, name: "Brand A" },
    { id: 2, name: "Brand B" },
  ];
}
async function getAllProductTypes() {
  // return axiosClient.get("/ProductType"); ...
  return [
    { id: 10, name: "Type X" },
    { id: 20, name: "Type Y" },
  ];
}

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [brandList, setBrandList] = useState([]);
  const [typeList, setTypeList] = useState([]);
  const [loading, setLoading] = useState(true);

  // productInForm: state cho form (dùng chung cho cả create & edit)
  const [productInForm, setProductInForm] = useState(null);

  // Xác định form đang ở chế độ “Create” hay “Edit”
  const isEditMode = productInForm?.id != null;

  // Lấy danh sách product + brand + type khi mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      // 1) Lấy danh sách sản phẩm
      const productRes = await getAllProducts();
      let productArray = [];
      if (productRes.data && Array.isArray(productRes.data.data)) {
        productArray = productRes.data.data;
      } else if (Array.isArray(productRes.data)) {
        productArray = productRes.data;
      } else if (Array.isArray(productRes)) {
        productArray = productRes;
      }
      setProducts(productArray);

      // 2) Lấy brand list
      const brands = await getAllBrands();
      setBrandList(brands);

      // 3) Lấy product type list
      const types = await getAllProductTypes();
      setTypeList(types);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mở form tạo sản phẩm mới
  const handleOpenCreateForm = () => {
    setProductInForm({
      id: null, // create mode
      name: "",
      description: "",
      price: 0,
      image: "",
      isAvailable: true,
      productTypeId: 0,
      productBrandId: 0,
    });
  };

  // Mở form edit
  const handleOpenEditForm = (product) => {
    setProductInForm({
      id: product.id,
      name: product.name || "",
      description: product.description || "",
      price: product.price || 0,
      image: product.image || "",
      isAvailable: product.isAvailable ?? true,
      productTypeId: product.productTypeId || 0,
      productBrandId: product.productBrandId || 0,
    });
  };

  // Xử lý khi thay đổi input
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = value;

    if (type === "checkbox") {
      val = checked;
    }
    if (type === "number") {
      val = parseFloat(value);
    }

    setProductInForm((prev) => ({
      ...prev,
      [name]: val,
    }));
  };

  // Upload file ảnh => base64
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Demo: chuyển file => base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64Str = reader.result; // "data:image/png;base64,...."
      setProductInForm((prev) => ({
        ...prev,
        image: base64Str,
      }));
    };
    reader.readAsDataURL(file);
  };

  // Lưu form
  const handleSave = async () => {
    try {
      if (!productInForm) return;

      if (isEditMode) {
        // Update
        await updateProduct(productInForm.id, {
          name: productInForm.name,
          description: productInForm.description,
          price: productInForm.price,
          image: productInForm.image,
          isAvailable: productInForm.isAvailable,
          productTypeId: productInForm.productTypeId,
          productBrandId: productInForm.productBrandId,
        });
        alert("Sản phẩm đã được cập nhật thành công!");
      } else {
        // Create
        await createProduct({
          name: productInForm.name,
          description: productInForm.description,
          price: productInForm.price,
          image: productInForm.image,
          isAvailable: productInForm.isAvailable,
          productTypeId: productInForm.productTypeId,
          productBrandId: productInForm.productBrandId,
        });
        alert("Sản phẩm mới đã được tạo!");
      }

      setProductInForm(null);
      fetchAllData();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Có lỗi khi lưu sản phẩm.");
    }
  };

  // Đóng form
  const handleCloseForm = () => {
    setProductInForm(null);
  };

  // Xóa
  const handleDelete = async (product) => {
    if (window.confirm(`Bạn có chắc muốn xóa sản phẩm: ${product.name}?`)) {
      try {
        await deleteProduct(product.id);
        alert("Sản phẩm đã được xóa thành công.");
        fetchAllData();
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Có lỗi khi xóa sản phẩm.");
      }
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar />
      <main className={styles.dashboardContent}>
        <h1 className={styles.title}>Quản lý sản phẩm</h1>
        <div style={{ marginBottom: "1rem" }}>
          <button onClick={handleOpenCreateForm} className={styles.createBtn}>
            <FaPlus /> Tạo sản phẩm
          </button>
        </div>

        {loading ? (
          <p>Đang tải sản phẩm...</p>
        ) : (
          <table className={styles.productTable}>
            <thead>
              <tr>
                <th>STT</th>
                <th>Hình ảnh</th>
                <th>Tên</th>
                <th>Mô tả</th>
                <th>Giá</th>
                <th>Thương hiệu</th>
                <th>Loại</th>
                <th>Còn hàng?</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product.id}>
                  <td>{index + 1}</td>
                  <td>
                    <img
                      src={product.image || "/placeholder.png"}
                      alt={product.name}
                      width="60"
                      height="60"
                      className={styles.productImage}
                    />
                  </td>
                  <td>{product.name}</td>
                  <td>{product.description}</td>
                  <td>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(product.price)}
                  </td>
                  <td>{product.productBrandName || product.productBrandId}</td>
                  <td>{product.productTypeName || product.productTypeId}</td>
                  <td>{product.isAvailable ? "✔" : "✖"}</td>
                  <td>
                    <button
                      className={`${styles.iconButton} ${styles.editIcon}`}
                      onClick={() => handleOpenEditForm(product)}
                      title="Cập nhật"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className={`${styles.iconButton} ${styles.deleteIcon}`}
                      onClick={() => handleDelete(product)}
                      title="Xóa"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Form (Create/Edit) */}
        {productInForm && (
          <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
              <h2>{isEditMode ? "Cập nhật sản phẩm" : "Tạo sản phẩm mới"}</h2>

              <label>Tên</label>
              <input
                type="text"
                name="name"
                value={productInForm.name}
                onChange={handleInputChange}
              />

              <label>Mô tả</label>
              <textarea
                name="description"
                rows={2}
                value={productInForm.description}
                onChange={handleInputChange}
              />

              <label>Giá</label>
              <input
                type="number"
                name="price"
                value={productInForm.price}
                onChange={handleInputChange}
              />

              <label>Hình ảnh (URL hoặc base64)</label>
              <input
                type="text"
                name="image"
                value={productInForm.image}
                onChange={handleInputChange}
              />
              <label>Hoặc upload file</label>
              <input type="file" accept="image/*" onChange={handleFileChange} />

              <label>
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={productInForm.isAvailable}
                  onChange={handleInputChange}
                />
                Còn hàng?
              </label>

              <label>Thương hiệu</label>
              <select
                name="productBrandId"
                value={productInForm.productBrandId}
                onChange={handleInputChange}
              >
                <option value={0}>-- Chọn thương hiệu --</option>
                {brandList.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>

              <label>Loại sản phẩm</label>
              <select
                name="productTypeId"
                value={productInForm.productTypeId}
                onChange={handleInputChange}
              >
                <option value={0}>-- Chọn loại --</option>
                {typeList.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>

              <div style={{ marginTop: "20px" }}>
                <button onClick={handleSave} style={{ marginRight: "10px" }}>
                  {isEditMode ? "Cập nhật" : "Tạo mới"}
                </button>
                <button onClick={handleCloseForm}>Hủy</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const modalContentStyle = {
  background: "#fff",
  padding: "20px",
  borderRadius: "4px",
  minWidth: "400px",
  maxWidth: "90%",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

export default ProductManager;
