import React from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "/src/styles/AboutUs.css"; // Đảm bảo tạo file CSS để tùy chỉnh giao diện

const AboutUs = () => {
    const navigate = useNavigate();

    const handleInfoClick = () => {
        navigate("/blog"); // Điều hướng đến trang blog khi bấm vào thông tin
    };

    return (
        <section className="about-us container text-center my-5">
            <h2 className="fw-bold">SKINCARE SKIN CARE PRODUCTS🍀</h2>
            <p className="text-muted">
                We carry a line of skin care products <strong>"natural, clean and free of toxic chemicals"</strong>,
                Helps protect and nourish the skin in the safest way. The product is researched by a team of Pharmacists, suitable for all skin types, including sensitive skin, pregnant women and children.
            </p>

            <div className="row align-items-center mt-5">
                <div className="col-lg-4 text-lg-end text-center mb-4">
                    <div className="about-card p-4 border rounded shadow-sm" onClick={handleInfoClick} style={{ cursor: 'pointer' }}>
                        <img src="/src/assets/images/aboutus.jpg" alt="Thành phần tự nhiên" className="about-icon mb-3" />
                        <h5 className="fw-bold">Natural Ingredients</h5>
                        <p className="text-muted">
                            Extracted from organic ingredients, ensuring safety for sensitive skin, does not cause irritation.                        </p>
                    </div>
                    <div className="about-card p-4 border rounded shadow-sm mt-4" onClick={handleInfoClick} style={{ cursor: 'pointer' }}>
                        <img src="/src/assets/images/aboutus.jpg" alt="Không hóa chất độc hại" className="about-icon mb-3" />
                        <h5 className="fw-bold">Contains No Toxic Chemicals</h5>
                        <p className="text-muted">
                            Committed to containing no parabens, sulfates, alcohol or harmful substances, helping to protect the skin safely.
                        </p>
                    </div>
                </div>

                <div className="col-lg-4 text-center mb-4">
                    <img src="/src/assets/images/logo.png" alt="Sản phẩm chăm sóc da" className="about-logo" />
                </div>

                <div className="col-lg-4 text-lg-start text-center mb-4">
                    <div className="about-card p-4 border rounded shadow-sm" onClick={handleInfoClick} style={{ cursor: 'pointer' }}>
                        <img src="/src/assets/images/aboutus.jpg" alt="Dưỡng ẩm sâu" className="about-icon mb-3" />
                        <h5 className="fw-bold">Moisturizes & Restores Skin</h5>
                        <p className="text-muted">
                            Helps keep skin soft, deeply moisturizes and supports skin regeneration, minimizing dryness.
                        </p>
                    </div>
                    <div className="about-card p-4 border rounded shadow-sm mt-4" onClick={handleInfoClick} style={{ cursor: 'pointer' }}>
                        <img src="/src/assets/images/aboutus.jpg" alt="Bao bì thân thiện môi trường" className="about-icon mb-3" />
                        <h5 className="fw-bold"> Environmentally Friendly</h5>
                        <p className="text-muted">
                            Use recyclable packaging, limit plastic, towards sustainable environmental protection.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutUs;
