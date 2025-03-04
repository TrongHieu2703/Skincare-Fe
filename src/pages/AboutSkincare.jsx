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
                    <span className="text-green-600 text-2xl pr-2">🏵️</span> ABOUT US 🏵️
                </h3>
                <p className="mt-4 text-lg">
                    Chăm sóc da - là một câu chuyện bắt nguồn từ tình yêu thiên nhiên và những sản phẩm phong phú của Việt Nam, được phát triển từ các dược sĩ <span className="font-bold text-green-700">Hanoi University of Pharmacy</span>.
                </p>
                <p className="mt-4 text-lg">
                    Chúng tôi cam kết loại bỏ các thành phần độc hại trong mỹ phẩm và thay thế bằng các thành phần tự nhiên sạch như trà xanh, cà phê, nghệ, bơ, cám gạo, dầu dưỡng,...
                </p>
            </section>

            {/* AboutUs Component */}
            <AboutUs />


        </div>
    );
};

export default HomePage;
