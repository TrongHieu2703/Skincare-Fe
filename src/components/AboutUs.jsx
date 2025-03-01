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
            <h2 className="fw-bold">SẢN PHẨM CHĂM SÓC DA SKINCARE🍀</h2>
            <p className="text-muted">
                Chúng tôi mang đến dòng sản phẩm chăm sóc da <strong>"tự nhiên, lành sạch và không chứa hóa chất độc hại"</strong>,
                giúp bảo vệ và nuôi dưỡng làn da theo cách an toàn nhất. Sản phẩm được nghiên cứu bởi đội ngũ Dược Sĩ, phù hợp với mọi loại da, kể cả da nhạy cảm, mẹ bầu và trẻ nhỏ.
            </p>

            <div className="row align-items-center mt-5">
                <div className="col-lg-4 text-lg-end text-center mb-4">
                    <div className="about-card p-4 border rounded shadow-sm" onClick={handleInfoClick} style={{ cursor: 'pointer' }}>
                        <img src="/src/assets/images/aboutus.jpg" alt="Thành phần tự nhiên" className="about-icon mb-3" />
                        <h5 className="fw-bold">Thành Phần Tự Nhiên</h5>
                        <p className="text-muted">
                            Chiết xuất từ các thành phần hữu cơ, đảm bảo an toàn cho làn da nhạy cảm, không gây kích ứng.
                        </p>
                    </div>
                    <div className="about-card p-4 border rounded shadow-sm mt-4" onClick={handleInfoClick} style={{ cursor: 'pointer' }}>
                        <img src="/src/assets/images/aboutus.jpg" alt="Không hóa chất độc hại" className="about-icon mb-3" />
                        <h5 className="fw-bold">Không Chứa Hóa Chất Độc Hại</h5>
                        <p className="text-muted">
                            Cam kết không chứa paraben, sulfate, cồn hay các chất gây hại, giúp bảo vệ làn da một cách an toàn.
                        </p>
                    </div>
                </div>

                <div className="col-lg-4 text-center mb-4">
                    <img src="/src/assets/images/logo.png" alt="Sản phẩm chăm sóc da" className="about-logo" />
                </div>

                <div className="col-lg-4 text-lg-start text-center mb-4">
                    <div className="about-card p-4 border rounded shadow-sm" onClick={handleInfoClick} style={{ cursor: 'pointer' }}>
                        <img src="/src/assets/images/aboutus.jpg" alt="Dưỡng ẩm sâu" className="about-icon mb-3" />
                        <h5 className="fw-bold">Dưỡng Ẩm & Phục Hồi Da</h5>
                        <p className="text-muted">
                            Giúp da luôn mềm mại, cấp ẩm sâu và hỗ trợ tái tạo da, giảm thiểu tình trạng khô ráp.
                        </p>
                    </div>
                    <div className="about-card p-4 border rounded shadow-sm mt-4" onClick={handleInfoClick} style={{ cursor: 'pointer' }}>
                        <img src="/src/assets/images/aboutus.jpg" alt="Bao bì thân thiện môi trường" className="about-icon mb-3" />
                        <h5 className="fw-bold"> Thân Thiện Với Môi Trường</h5>
                        <p className="text-muted">
                            Sử dụng bao bì có thể tái chế, hạn chế nhựa, hướng tới bảo vệ môi trường bền vững.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutUs;
