import React from "react";
import { FaFacebookMessenger, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { SiZalo } from "react-icons/si";
import AboutUs from "/src/components/AboutUs";
import "/src/styles/AboutSkincare.css";

const HomePage = () => {
    return (

        <div className="bg-white text-green-800 font-sans">
            {/* Header */}
            <header className="text-center py-6 text-3xl font-bold">
                MỸ PHẨM SKINCARE
            </header>

            {/* Banner */}
            <div className="relative w-full h-96 flex items-center justify-center">
                <img
                    src="/src/assets/images/docquyen2.webp"
                    alt="Banner Skincare"
                    className="absolute w-full h-full object-cover"
                />
                <div className="absolute bg-green-700 bg-opacity-70 p-6 rounded-lg text-white text-center">
                    <h2 className="text-2xl font-semibold">“LÀNH NGUYÊN LIỆU, SẠCH CHÂN TÂM <br /> ĐẸP TỰ NHIÊN, SỐNG AN YÊN”</h2>
                </div>
            </div>

            {/* Giới thiệu */}
            <section className="px-8 md:px-20 py-12">
                <h3 className="text-xl font-semibold flex items-center">
                    <span className="text-green-600 text-2xl pr-2">🟢</span> VỀ CHÚNG TÔI
                </h3>
                <p className="mt-4 text-lg">
                    Skincare  – là câu chuyện khởi nguồn từ tình yêu với thiên nhiên & những sản vật phong phú của Việt Nam,
                    được các dược sĩ từ <span className="font-bold text-green-700">Đại Học Dược Hà Nội</span> nghiên cứu và phát triển.
                </p>
                <p className="mt-4 text-lg">
                    Chúng tôi cam kết loại bỏ <span className="font-bold text-green-700">gia trong mỹ phẩm</span> và thay thế bằng các <span className="font-bold text-green-700">nguyên liệu thiên nhiên lành sạch</span> như trà xanh, cafe, nghệ, bơ, cám gạo, dầu dưỡng,...
                </p>
            </section>

            {/* AboutUs Component */}
            <AboutUs />


        </div>
    );
};

export default HomePage;
