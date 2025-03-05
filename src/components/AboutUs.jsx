import React from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "/src/styles/AboutUs.css";
import { FaLeaf, FaHeart, FaSeedling, FaRecycle } from 'react-icons/fa';

const AboutUs = () => {
    const navigate = useNavigate();

    const handleInfoClick = () => {
        navigate("/blog");
    };

    return (
        <section className="about-us container my-5">
            <div className="about-header">
                <h2 className="title">
                    <FaLeaf className="title-icon" />
                    Sản Phẩm Chăm Sóc Da
                </h2>
                <div className="subtitle">Tự Nhiên • An Toàn • Hiệu Quả</div>
            </div>

            <p className="description">
                Chúng tôi cung cấp một dòng sản phẩm chăm sóc da <strong>"tự nhiên, sạch và không chứa hóa chất độc hại"</strong>,
                giúp bảo vệ và nuôi dưỡng làn da một cách an toàn nhất. Sản phẩm được nghiên cứu bởi đội ngũ dược sĩ, 
                phù hợp với mọi loại da, bao gồm cả da nhạy cảm, phụ nữ mang thai và trẻ em.
            </p>

            <div className="row align-items-center mt-5">
                <div className="col-lg-4 text-lg-end text-center mb-4">
                    <div className="about-card" onClick={handleInfoClick}>
                        <FaSeedling className="card-icon" />
                        <h5>Thành Phần Tự Nhiên</h5>
                        <p>Chiết xuất từ các thành phần hữu cơ, đảm bảo an toàn cho làn da nhạy cảm, không gây kích ứng.</p>
                    </div>
                    <div className="about-card" onClick={handleInfoClick}>
                        <FaHeart className="card-icon" />
                        <h5>Không Chứa Hóa Chất Độc Hại</h5>
                        <p>Cam kết không chứa paraben, sulfate, cồn hay các chất độc hại, giúp bảo vệ làn da an toàn.</p>
                    </div>
                </div>

                <div className="col-lg-4 text-center mb-4">
                    <img src="/src/assets/images/logo.png" alt="Sản phẩm chăm sóc da" className="about-logo pulse" />
                </div>

                <div className="col-lg-4 text-lg-start text-center mb-4">
                    <div className="about-card" onClick={handleInfoClick}>
                        <FaLeaf className="card-icon" />
                        <h5>Dưỡng Ẩm & Tái Tạo Da</h5>
                        <p>Giúp giữ cho làn da mềm mại, cung cấp độ ẩm sâu và hỗ trợ tái tạo da, giảm thiểu tình trạng khô da.</p>
                    </div>
                    <div className="about-card" onClick={handleInfoClick}>
                        <FaRecycle className="card-icon" />
                        <h5>Thân Thiện Với Môi Trường</h5>
                        <p>Sử dụng bao bì có thể tái chế, hạn chế nhựa, hướng tới bảo vệ môi trường bền vững.</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutUs;
